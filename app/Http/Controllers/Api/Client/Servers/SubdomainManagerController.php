<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\SubdomainRequest;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Classes\Cloudflare\Auth\APIKey;
use Pterodactyl\Classes\Cloudflare\Endpoints\DNS;
use Pterodactyl\Classes\Cloudflare\Endpoints\Zones;
use Pterodactyl\Classes\Cloudflare\Adapter\Guzzle;
use Illuminate\Support\Facades\Log;

class SubdomainManagerController extends ClientApiController
{
    private $settingsRepository;

    public function __construct(SettingsRepositoryInterface $settingsRepository)
    {
        parent::__construct();
        $this->settingsRepository = $settingsRepository;
    }

    public function index(SubdomainRequest $request, Server $server): array
    {
        $subdomains = DB::table('subdomain_manager_subdomains')
            ->where('server_id', $server->id)
            ->get();

        $domains = DB::table('subdomain_manager_domains')->get();
        
        $filteredDomains = $domains->filter(function ($domain) use ($server) {
            return in_array($server->egg_id, explode(',', $domain->egg_ids));
        });

        $subdomains = $subdomains->map(function ($subdomain) use ($filteredDomains) {
            $domain = $filteredDomains->firstWhere('id', $subdomain->domain_id);
            $subdomain->fullSubdomain = $domain ? "$subdomain->subdomain.$domain->domain" : "$subdomain->subdomain.unknown";
            return $subdomain;
        });

        return [
            'success' => true,
            'data' => [
                'subdomains' => $subdomains->toArray(),
                'domains' => $filteredDomains->toArray(),
            ],
        ];
    }

    public function create(SubdomainRequest $request, Server $server): array
    {
        try {
            $request->validate([
                'subdomain' => 'required|min:2|max:32|regex:/^[a-zA-Z0-9-]+$/',
                'domainId' => 'required|integer'
            ]);
    
            $cfEmail = $this->settingsRepository->get('settings::subdomain::cf_email', '');
            $cfApiKey = $this->settingsRepository->get('settings::subdomain::cf_api_key', '');
    
            if (empty($cfEmail) || empty($cfApiKey)) {
                throw new DisplayException('Cloudflare API credentials are missing. Please configure them in the settings panel.');
            }
    
            $subdomain = strtolower(trim(strip_tags($request->input('subdomain'))));
            $domain = DB::table('subdomain_manager_domains')
                ->select('id', 'domain', 'protocol', 'protocol_types')
                ->where('id', $request->input('domainId'))
                ->first();
            
            if (!$domain) {
                throw new DisplayException('The selected domain does not exist. Please select a valid domain.');
            }
            
            $existingSubdomain = DB::table('subdomain_manager_subdomains')
                ->where('subdomain', $subdomain)
                ->where('domain_id', $domain->id)
                ->first();
            
            if ($existingSubdomain) {
                throw new DisplayException("The subdomain '{$subdomain}.{$domain->domain}' already exists. Please choose a different subdomain.");
            }
    
            $service = isset($domain->protocol) ? unserialize($domain->protocol)[$server->egg_id] ?? null : null;
            $protocol = isset($domain->protocol_types) ? unserialize($domain->protocol_types)[$server->egg_id] ?? 'tcp' : 'tcp';
    
            $allocation = DB::table('allocations')->where('id', '=', $server->allocation_id)->first();
            if (!$allocation) {
                throw new DisplayException('Server allocation not found. Make sure your server has a valid IP and port assigned.');
            }
    
            $zoneID = $this->getCloudflareZoneID($domain->domain);
            if (!$zoneID) {
                throw new DisplayException("Could not retrieve Cloudflare Zone ID for domain '{$domain->domain}'. Please check your Cloudflare settings.");
            }
    
            if (!empty($allocation->ip_alias)) {
                if (filter_var($allocation->ip_alias, FILTER_VALIDATE_IP)) {
                    Log::info("Subdomain creation: Using ip_alias '{$allocation->ip_alias}' as a valid IP.");
                    
                    $this->manageCloudflareARecord($zoneID, $subdomain, $domain->domain, $allocation->ip_alias, 'create');
            
                    if ($service) {
                        $this->manageCloudflareSRVRecord($zoneID, $subdomain, $domain->domain, $protocol, $service, $allocation->port, "$subdomain.$domain->domain", 'create');
                    }
            
                    $recordType = $service ? 'A & SRV' : 'A';
                    $ipUsed = $allocation->ip_alias;
                } else {
                    Log::info("Subdomain creation: Using ip_alias '{$allocation->ip_alias}' as a domain.");
                    
                    if ($service) {
                        $this->manageCloudflareSRVRecord($zoneID, $subdomain, $domain->domain, $protocol, $service, $allocation->port, $allocation->ip_alias, 'create');
                        $recordType = 'SRV';
                    } else {
                        throw new DisplayException("Cannot create subdomain with domain alias '{$allocation->ip_alias}' because no service is defined.");
                    }
            
                    $ipUsed = $allocation->ip_alias;
                }
            } else {
                $this->manageCloudflareARecord($zoneID, $subdomain, $domain->domain, $allocation->ip, 'create');
            
                if ($service) {
                    $this->manageCloudflareSRVRecord($zoneID, $subdomain, $domain->domain, $protocol, $service, $allocation->port, "$subdomain.$domain->domain", 'create');
                }
            
                $recordType = $service ? 'A & SRV' : 'A';
                $ipUsed = $allocation->ip;
            }            

            DB::table('subdomain_manager_subdomains')->insert([
                'server_id' => $server->id,
                'domain_id' => $domain->id,
                'subdomain' => $subdomain,
                'ip' => $ipUsed,
                'port' => $allocation->port,
                'record_type' => $recordType,
                'protocol' => $protocol,
            ]);
    
            Activity::event('server:subdomain.create')
                ->subject($server)
                ->property([
                    'subdomain' => "$subdomain.{$domain->domain}",
                    'ip' => $ipUsed,
                    'port' => $allocation->port,
                    'protocol' => $protocol,
                    'record_type' => $recordType
                ])
                ->log();
    
            return ['success' => true, 'message' => "Subdomain '$subdomain.{$domain->domain}' created successfully!"];
        } catch (DisplayException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        } catch (\Exception $e) {
            \Log::error('Unexpected error while creating subdomain', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return ['success' => false, 'message' => 'An unexpected error occurred. Please try again later or contact support.'];
        }
    }

    public function sync(SubdomainRequest $request, Server $server, int $subdomainId): array
    {
        try {
            $subdomain = DB::table('subdomain_manager_subdomains')
                ->where('id', $subdomainId)
                ->where('server_id', $server->id)
                ->first();
    
            if (!$subdomain) {
                throw new DisplayException('The subdomain does not exist or is not associated with this server.');
            }
    
            $domain = DB::table('subdomain_manager_domains')
                ->where('id', $subdomain->domain_id)
                ->first();
    
            if (!$domain) {
                throw new DisplayException('Associated domain not found. Please check your domain settings.');
            }
    
            $allocation = DB::table('allocations')->where('id', '=', $server->allocation_id)->first();
            if (!$allocation) {
                throw new DisplayException('Server allocation not found. Ensure your server has a valid IP and port assigned.');
            }
    
            $zoneID = $this->getCloudflareZoneID($domain->domain);
            if (!$zoneID) {
                throw new DisplayException("Could not retrieve Cloudflare Zone ID for domain '{$domain->domain}'. Please check your Cloudflare settings.");
            }
    
            $service = isset($domain->protocol) ? unserialize($domain->protocol)[$server->egg_id] ?? null : null;
            $protocol = isset($domain->protocol_types) ? unserialize($domain->protocol_types)[$server->egg_id] ?? 'tcp' : 'tcp';
    
            $newIp = !empty($allocation->ip_alias) ? $allocation->ip_alias : $allocation->ip;
            $isIpAliasDomain = filter_var($newIp, FILTER_VALIDATE_IP) === false;
    
            if ($subdomain->ip === $newIp && $subdomain->port === $allocation->port) {
                return ['success' => true, 'message' => "No changes detected for '{$subdomain->subdomain}.{$domain->domain}'."];
            }
    
            $this->manageCloudflareARecord($zoneID, $subdomain->subdomain, $domain->domain, $subdomain->ip, 'delete');
            if ($service) {
                $this->manageCloudflareSRVRecord($zoneID, $subdomain->subdomain, $domain->domain, $subdomain->protocol, $service, $subdomain->port, $subdomain->ip, 'delete');
            }
    
            if ($isIpAliasDomain) {
                Log::info("Subdomain sync: Using ip_alias '{$newIp}' as a domain.");
                if ($service) {
                    $this->manageCloudflareSRVRecord($zoneID, $subdomain->subdomain, $domain->domain, $protocol, $service, $allocation->port, $newIp, 'create');
                } else {
                    throw new DisplayException("Cannot sync subdomain '{$subdomain->subdomain}.{$domain->domain}' with alias '{$newIp}' because no service is defined.");
                }
            } else {
                Log::info("Subdomain sync: Using ip_alias '{$newIp}' as an IP.");
                $this->manageCloudflareARecord($zoneID, $subdomain->subdomain, $domain->domain, $newIp, 'create');
                if ($service) {
                    $this->manageCloudflareSRVRecord($zoneID, $subdomain->subdomain, $domain->domain, $protocol, $service, $allocation->port, $subdomain->subdomain . '.' . $domain->domain, 'create');
                }
            }
    
            DB::table('subdomain_manager_subdomains')
                ->where('id', $subdomainId)
                ->update([
                    'ip' => $newIp,
                    'port' => $allocation->port
                ]);
    
            Activity::event('server:subdomain.sync')
                ->subject($server)
                ->property([
                    'subdomain' => "$subdomain->subdomain.{$domain->domain}",
                    'old_ip' => $subdomain->ip,
                    'new_ip' => $newIp,
                    'old_port' => $subdomain->port,
                    'new_port' => $allocation->port,
                    'is_alias_domain' => $isIpAliasDomain ? 'Yes' : 'No'
                ])
                ->log();
    
            return ['success' => true, 'message' => "Subdomain '{$subdomain->subdomain}.{$domain->domain}' synchronized successfully!"];
        } catch (DisplayException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        } catch (\Exception $e) {
            \Log::error('Unexpected error while syncing subdomain', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return ['success' => false, 'message' => 'An unexpected error occurred while syncing the subdomain. Please try again later or contact support.'];
        }
    }

    public function delete(SubdomainRequest $request, Server $server, int $subdomainId): array
    {
        try {
            $subdomain = DB::table('subdomain_manager_subdomains')
                ->where('id', $subdomainId)
                ->where('server_id', $server->id)
                ->first();
    
            if (!$subdomain) {
                throw new DisplayException('The subdomain does not exist or is not associated with this server.');
            }
    
            $domain = DB::table('subdomain_manager_domains')
                ->where('id', $subdomain->domain_id)
                ->first();
    
            if (!$domain) {
                throw new DisplayException('Associated domain not found. Please check your domain settings.');
            }
    
            $zoneID = $this->getCloudflareZoneID($domain->domain);
    
            if (!$zoneID) {
                throw new DisplayException("Cloudflare Zone ID not found for domain '{$domain->domain}'. Please check your Cloudflare settings.");
            }
    
            $target = !empty($subdomain->ip_alias) ? $subdomain->ip_alias : $subdomain->ip;
            $service = isset($domain->protocol) ? unserialize($domain->protocol)[$server->egg_id] ?? null : null;
    
            $this->manageCloudflareARecord($zoneID, $subdomain->subdomain, $domain->domain, $target, 'delete');
            if ($service) {
                $this->manageCloudflareSRVRecord($zoneID, $subdomain->subdomain, $domain->domain, $subdomain->protocol, $service, $subdomain->port, $target, 'delete');
            }            
    
            DB::table('subdomain_manager_subdomains')->where('id', $subdomainId)->delete();
    
            Activity::event('server:subdomain.delete')
                ->subject($server)
                ->property([
                    'subdomain' => "$subdomain->subdomain.{$domain->domain}",
                    'ip' => $subdomain->ip,
                    'port' => $subdomain->port
                ])
                ->log();
    
            return ['success' => true, 'message' => "Subdomain '{$subdomain->subdomain}.{$domain->domain}' has been removed successfully."];
        } catch (DisplayException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        } catch (\Exception $e) {
            \Log::error('Unexpected error while deleting subdomain', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return ['success' => false, 'message' => 'An unexpected error occurred while deleting the subdomain. Please try again later or contact support.'];
        }
    }

    private function manageCloudflareARecord($zoneID, $subdomain, $domain, $ip, $action = 'create')
    {
        $adapter = new Guzzle(new APIKey(
            $this->settingsRepository->get('settings::subdomain::cf_email', ''),
            $this->settingsRepository->get('settings::subdomain::cf_api_key', '')
        ));
        
        $dns = new DNS($adapter);
        $records = $dns->listRecords($zoneID, 'A', "$subdomain.$domain");

        if ($action === 'delete' && count($records->result) > 0) {
            return $dns->deleteRecord($zoneID, $records->result[0]->id);
        }

        if ($action === 'create' && count($records->result) === 0) {
            return $dns->addRecord($zoneID, [
                'type' => 'A',
                'name' => $subdomain,
                'content' => $ip,
                'ttl' => 120,
                'proxied' => false,
            ]);
        }
    }

    private function manageCloudflareSRVRecord($zoneID, $subdomain, $domain, $protocol, $service, $port, $target, $action = 'create')
    {
        $adapter = new Guzzle(new APIKey(
            $this->settingsRepository->get('settings::subdomain::cf_email', ''),
            $this->settingsRepository->get('settings::subdomain::cf_api_key', '')
        ));
    
        $dns = new DNS($adapter);
        $srvName = "$service._$protocol.$subdomain.$domain";
        $records = $dns->listRecords($zoneID, 'SRV', $srvName);
    
        if ($action === 'delete') {
            if (count($records->result) > 0) {
                foreach ($records->result as $record) {
                    try {
                        $dns->deleteRecord($zoneID, $record->id);
                        Log::info("Deleted SRV record: {$srvName} (ID: {$record->id})");
                    } catch (\Exception $e) {
                        Log::error("Failed to delete SRV record: {$srvName}", ['error' => $e->getMessage()]);
                    }
                }
            } else {
                Log::warning("No SRV record found to delete: $srvName");
            }
            return;
        }        
    
        if ($action === 'create' && count($records->result) === 0) {
            try {
                $dns->addRecord($zoneID, [
                    'type' => 'SRV',
                    'name' => $srvName,
                    'data' => [
                        'ttl' => 120,
                        'priority' => 1,
                        'weight' => 1,
                        'port' => $port,
                        'target' => $target,
                    ],
                ]);
                Log::info("Created SRV record: $srvName → $target:$port");
            } catch (\Exception $e) {
                Log::error("Failed to create SRV record: $srvName", ['error' => $e->getMessage()]);
            }
        }
    }

    private function getCloudflareZoneID($domain)
    {
        $key = new APIKey(
            $this->settingsRepository->get('settings::subdomain::cf_email', ''),
            $this->settingsRepository->get('settings::subdomain::cf_api_key', '')
        );

        $adapter = new Guzzle($key);
        $zones = new Zones($adapter);

        return $zones->getZoneID($domain);
    }
}

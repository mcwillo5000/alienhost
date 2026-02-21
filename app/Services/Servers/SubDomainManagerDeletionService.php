<?php

namespace Pterodactyl\Services\Servers;

use Illuminate\Support\Facades\DB;
use Pterodactyl\Classes\Cloudflare\Auth\APIKey;
use Pterodactyl\Classes\Cloudflare\Endpoints\DNS;
use Pterodactyl\Classes\Cloudflare\Adapter\Guzzle;
use Pterodactyl\Classes\Cloudflare\Endpoints\Zones;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Illuminate\Support\Facades\Log;

class SubDomainManagerDeletionService
{
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function delete($server_id, $egg_id)
    {
        $subdomains = DB::table('subdomain_manager_subdomains')
            ->where('server_id', '=', $server_id)
            ->get();

        if ($subdomains->isEmpty()) {
            return;
        }

        foreach ($subdomains as $subdomain) {
            $domains = DB::table('subdomain_manager_domains')
                ->where('id', '=', $subdomain->domain_id)
                ->get();

            if ($domains->isEmpty()) {
                Log::warning("No domains found for subdomain ID: {$subdomain->id}");
                continue;
            }

            foreach ($domains as $domain) {
                $protocol = unserialize($domain->protocol)[$egg_id] ?? null;
                $type = unserialize($domain->protocol_types)[$egg_id] ?? 'tcp';

                try {
                    $key = new APIKey(
                        $this->settings->get('settings::subdomain::cf_email', ''),
                        $this->settings->get('settings::subdomain::cf_api_key', '')
                    );
                    $adapter = new Guzzle($key);
                    $zones = new Zones($adapter);
                    $dns = new DNS($adapter);

                    $zoneID = $zones->getZoneID($domain->domain);

                    if (!$zoneID) {
                        Log::error("Failed to retrieve Cloudflare Zone ID for domain: {$domain->domain}");
                        continue;
                    }

                    $this->deleteCloudflareRecords($dns, $zoneID, $subdomain->subdomain, $domain->domain, $protocol, $type);
                    
                    Log::info("Deleted Cloudflare records for subdomain '{$subdomain->subdomain}.{$domain->domain}'");
                } catch (\Exception $e) {
                    Log::error("Error deleting subdomain '{$subdomain->subdomain}.{$domain->domain}': " . $e->getMessage());
                }
            }

            DB::table('subdomain_manager_subdomains')->where('id', $subdomain->id)->delete();
            Log::info("Subdomain '{$subdomain->subdomain}' deleted successfully.");
        }
    }

    private function deleteCloudflareRecords(DNS $dns, $zoneID, $subdomain, $domain, $protocol, $type)
    {
        $subdomain_all = "{$subdomain}.{$domain}";
        
        $aRecords = $dns->listRecords($zoneID, 'A', $subdomain_all)->result;
        if (!empty($aRecords)) {
            try {
                $dns->deleteRecord($zoneID, $aRecords[0]->id);
                Log::info("Deleted A record for {$subdomain_all}");
            } catch (\Exception $e) {
                Log::error("Failed to delete A record for {$subdomain_all}: " . $e->getMessage());
            }
        }

        if (!empty($protocol)) {
            $subdomain_srv = "{$protocol}._{$type}.{$subdomain}.{$domain}";
            $srvRecords = $dns->listRecords($zoneID, 'SRV', $subdomain_srv)->result;
            
            if (!empty($srvRecords)) {
                try {
                    $dns->deleteRecord($zoneID, $srvRecords[0]->id);
                    Log::info("Deleted SRV record for {$subdomain_srv}");
                } catch (\Exception $e) {
                    Log::error("Failed to delete SRV record for {$subdomain_srv}: " . $e->getMessage());
                }
            }
        }
    }
}

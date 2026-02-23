<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Advertisement;
use Pterodactyl\Services\AdvertisementService;
use Illuminate\Http\Request;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Support\Facades\Log;

class AdvertisementController extends Controller
{
    protected $alert;

    public function __construct(AlertsMessageBag $alert)
    {
        $this->alert = $alert;
    }

    public function index()
    {
        $advertisements = Advertisement::with('nest')->orderBy('created_at', 'desc')->get();
        
        try {
            $nests = \Pterodactyl\Models\Nest::orderBy('name')->get();
        } catch (\Exception $e) {
            Log::error('Failed to load nests in index: ' . $e->getMessage());
            $nests = collect([]);
        }

        $totalAdsSent = 0;
        $todayAdsSent = 0;
        $activeAdvertisements = Advertisement::where('is_active', true)->count();
        $serversToSendAdsTo = 0;

        foreach ($advertisements as $advertisement) {
            $servers = \Pterodactyl\Models\Server::whereIn('egg_id', function($query) use ($advertisement) {
                $query->select('id')
                    ->from('eggs')
                    ->where('nest_id', $advertisement->nest_id);
            })
            ->whereNull('status')
            ->count();

            if ($advertisement->last_sent_at) {
                $totalAdsSent += $servers;
                if ($advertisement->last_sent_at->isToday()) {
                    $todayAdsSent += $servers;
                }
            }
        }

        try {
            $serversToSendAdsTo = \Pterodactyl\Models\Server::whereNull('status')->count();
        } catch (\Exception $e) {
            Log::error('Failed to count servers: ' . $e->getMessage());
        }

        return view('admin.advertisements.index', [
            'advertisements' => $advertisements,
            'nests' => $nests,
            'totalAdsSent' => $totalAdsSent,
            'todayAdsSent' => $todayAdsSent,
            'activeAdvertisements' => $activeAdvertisements,
            'serversToSendAdsTo' => $serversToSendAdsTo,
        ]);
    }

    public function create()
    {
        try {
            $nests = \Pterodactyl\Models\Nest::orderBy('name')->get();
        } catch (\Exception $e) {
            Log::error('Failed to load nests in create: ' . $e->getMessage());
            $nests = collect([]);
        }

        return view('admin.advertisements.create', [
            'nests' => $nests,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nest_id' => 'required|exists:nests,id',
                'name' => 'required|string|max:255',
                'commands' => 'required|array|min:1',
                'commands.*' => 'required|string',
                'interval_minutes' => 'required|integer|min:1|max:1440',
                'is_active' => 'boolean',
            ]);

            $commands = array_filter(array_map('trim', $request->input('commands', [])), function($cmd) {
                return !empty($cmd);
            });

            if (empty($commands)) {
                $this->alert->danger('At least one command is required.')->flash();
                return redirect()->back()->withInput();
            }

            Advertisement::create([
                'nest_id' => $request->input('nest_id'),
                'name' => $request->input('name'),
                'commands' => array_values($commands),
                'interval_minutes' => $request->input('interval_minutes'),
                'is_active' => $request->has('is_active'),
            ]);

            $this->alert->success('Advertisement created successfully.')->flash();

            return redirect()->route('admin.advertisements.index');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create advertisement', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            
            $this->alert->danger('Failed to create advertisement: ' . $e->getMessage())->flash();
            return redirect()->back()->withInput();
        }
    }

    public function edit(Advertisement $advertisement)
    {
        $advertisement->load('nest');
        
        try {
            $nests = \Pterodactyl\Models\Nest::orderBy('name')->get();
        } catch (\Exception $e) {
            Log::error('Failed to load nests in edit: ' . $e->getMessage());
            $nests = collect([]);
        }

        return view('admin.advertisements.edit', [
            'advertisement' => $advertisement,
            'nests' => $nests,
        ]);
    }

    public function update(Request $request, Advertisement $advertisement)
    {
        $request->validate([
            'nest_id' => 'required|exists:nests,id',
            'name' => 'required|string|max:255',
            'commands' => 'required|array|min:1',
            'commands.*' => 'required|string',
            'interval_minutes' => 'required|integer|min:1|max:1440',
            'is_active' => 'boolean',
        ]);

        $commands = array_filter(array_map('trim', $request->input('commands', [])), function($cmd) {
            return !empty($cmd);
        });

        if (empty($commands)) {
            $this->alert->danger('At least one command is required.')->flash();
            return redirect()->back()->withInput();
        }

        $advertisement->update([
            'nest_id' => $request->input('nest_id'),
            'name' => $request->input('name'),
            'commands' => array_values($commands),
            'interval_minutes' => $request->input('interval_minutes'),
            'is_active' => $request->has('is_active'),
        ]);

        $this->alert->success('Advertisement updated successfully.')->flash();

        return redirect()->route('admin.advertisements.index');
    }

    public function destroy(Advertisement $advertisement)
    {
        $advertisement->delete();

        $this->alert->success('Advertisement deleted successfully.')->flash();

        return redirect()->route('admin.advertisements.index');
    }

    public function send($advertisement, AdvertisementService $service)
    {
        try {
            if (!($advertisement instanceof Advertisement)) {
                $advertisement = Advertisement::findOrFail($advertisement);
            }
            
            $result = $service->sendAdvertisement($advertisement);
            
            if ($result['total'] === 0) {
                $this->alert->warning('No running servers found in this nest.')->flash();
                return redirect()->route('admin.advertisements.index');
            }
            
            $advertisement->update(['last_sent_at' => now()]);
            
            if ($result['failed'] === 0) {
                $this->alert->success("Advertisement sent successfully to {$result['success']} server(s).")->flash();
            } else {
                $this->alert->warning("Advertisement sent to {$result['success']} server(s), but failed on {$result['failed']} server(s).")->flash();
            }
        } catch (\Exception $e) {
            Log::error('Failed to send advertisement', [
                'advertisement_id' => is_object($advertisement) ? $advertisement->id : $advertisement,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            $this->alert->danger('Failed to send advertisement: ' . $e->getMessage())->flash();
        }

        return redirect()->route('admin.advertisements.index');
    }
}


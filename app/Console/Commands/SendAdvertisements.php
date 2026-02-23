<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Pterodactyl\Models\Advertisement;
use Pterodactyl\Services\AdvertisementService;

class SendAdvertisements extends Command
{
    protected $signature = 'advertisements:send';
    protected $description = 'Send advertisements to servers based on their configured intervals';

    public function handle(AdvertisementService $service): int
    {
        $advertisements = Advertisement::where('is_active', true)->get();
        
        foreach ($advertisements as $advertisement) {
            if ($this->shouldSend($advertisement)) {
                $this->info("Sending advertisement: {$advertisement->name}");
                $service->sendAdvertisement($advertisement);
                $advertisement->update(['last_sent_at' => now()]);
            }
        }

        return 0;
    }

    protected function shouldSend(Advertisement $advertisement): bool
    {
        if (!$advertisement->last_sent_at) {
            return true;
        }

        $nextSendTime = $advertisement->last_sent_at->copy()->addMinutes($advertisement->interval_minutes);
        
        return now()->greaterThanOrEqualTo($nextSendTime);
    }
}


<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Settings;

use Pterodactyl\Models\Permission;
use Pterodactyl\Contracts\Http\ClientPermissionsRequest;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

use Illuminate\Contracts\Validation\Rule;

class TimezoneServerRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    /**
     * Returns the permissions string indicating which permission should be used to
     * validate that the authenticated user has permission to perform this action against
     * the given resource (server).
     */
    public function permission(): string
    {
        return Permission::ACTION_SETTINGS_RENAME;
    }

    /**
     * The rules to apply when validating this request.
     */
    public function rules(): array
    {
        return [
            'timezone' => ['required', 'string', 'in:' . implode(',', $this->validTimezones())],
        ];
    }

    private function validTimezones(): array
    {
        return [
            'Pacific/Kwajalein', // GMT-12: International Date Line West
            'Pacific/Pago_Pago', // GMT-11: Midway Island, Samoa
            'Pacific/Honolulu', // GMT-10: Hawaii
            'America/Anchorage', // GMT-9: Alaska
            'America/Los_Angeles', // GMT-8: Pacific Time (e.g., Los Angeles, Vancouver)
            'America/Denver', // GMT-7: Mountain Time (e.g., Denver, Calgary)
            'America/Chicago', // GMT-6: Central Time (e.g., Chicago, Mexico City)
            'America/New_York', // GMT-5: Eastern Time (e.g., New York, Toronto)
            'America/Halifax', // GMT-4: Atlantic Time (e.g., Halifax, Puerto Rico)
            'America/Argentina/Buenos_Aires', // GMT-3: Buenos Aires, Greenland
            'Atlantic/South_Georgia', // GMT-2: Mid-Atlantic
            'Atlantic/Azores', // GMT-1: Azores, Cape Verde Islands
            'Europe/London', // GMT+0: Greenwich Mean Time (London, Dublin)
            'Europe/Berlin', // GMT+1: Central European Time (e.g., Berlin, Paris)
            'Europe/Athens', // GMT+2: Eastern European Time (e.g., Athens, Istanbul)
            'Europe/Moscow', // GMT+3: Moscow, Baghdad
            'Asia/Dubai', // GMT+4: Dubai, Samara
            'Asia/Karachi', // GMT+5: Islamabad, Yekaterinburg
            'Asia/Almaty', // GMT+6: Almaty, Dhaka
            'Asia/Bangkok', // GMT+7: Bangkok, Jakarta
            'Asia/Shanghai', // GMT+8: Beijing, Singapore
            'Asia/Tokyo', // GMT+9: Tokyo, Seoul
            'Australia/Sydney', // GMT+10: Sydney, Vladivostok
            'Pacific/Guadalcanal', // GMT+11: Solomon Islands, Magadan
            'Pacific/Fiji' // GMT+12: Fiji, New Zealand
        ];
    }
}

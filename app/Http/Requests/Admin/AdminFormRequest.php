<?php

namespace Pterodactyl\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

abstract class AdminFormRequest extends FormRequest
{
    /**
     * The rules to apply to the incoming form request.
     */
    abstract public function rules(): array;

    /**
     * Determine if the user has permission to submit this admin form.
     *
     * Root admins always pass. Users with an advanced role also pass —
     * route-level access is already enforced by AdminAuthenticate middleware
     * before this method is ever reached.
     */
    public function authorize(): bool
    {
        if (is_null($this->user())) {
            return false;
        }

        if ($this->user()->root_admin) {
            return true;
        }

        // Allow users who have been granted an advanced role.
        // The AdminAuthenticate middleware has already confirmed that this
        // specific route is permitted for their role, so we just need to
        // confirm they hold a role at all.
        return !is_null($this->user()->adv_role_id);
    }

    /**
     * Return only the fields that we are interested in from the request.
     * This will include empty fields as a null value.
     */
    public function normalize(?array $only = null): array
    {
        return $this->only($only ?? array_keys($this->rules()));
    }
}

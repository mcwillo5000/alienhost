<?php

namespace Pterodactyl\Models\VeltaStudios;

use Illuminate\Database\Eloquent\Model;

class ScheduleTemplateTask extends Model
{
    protected $fillable = [
        'action', 'payload', 'time_offset', 'continue_on_failure', 'schedule_template_id', 'order_index'
    ];

    public function scheduleTemplate()
    {
        return $this->belongsTo(ScheduleTemplate::class, 'schedule_template_id');
    }
}
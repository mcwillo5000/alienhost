<?php

namespace Pterodactyl\Models\VeltaStudios;

use Illuminate\Database\Eloquent\Model;

class ScheduleTemplate extends Model
{
    protected $fillable = [
        'name', 'description', 'cron_minute', 'cron_hour', 'cron_day_of_month', 'cron_month', 'cron_day_of_week'
    ];

    public function tasks()
    {
        return $this->hasMany(ScheduleTemplateTask::class, 'schedule_template_id')->orderBy('order_index');
    }
}
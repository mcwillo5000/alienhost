<?php

namespace Pterodactyl\Http\Controllers\Admin\VeltaStudios;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\VeltaStudios\ScheduleTemplate;
use Pterodactyl\Models\VeltaStudios\ScheduleTemplateTask;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\Support\Facades\Http;

class ScheduleTemplateController extends Controller
{
    protected AlertsMessageBag $alert;

    public function __construct(AlertsMessageBag $alert)
    {
        $this->alert = $alert;
    }

    public function index(): View
    {
        $templates = QueryBuilder::for(ScheduleTemplate::query())->allowedFilters(['name'])->paginate(10);

        return view('admin.veltastudios.schedule-templates.index', [
            'templates' => $templates,
        ]);
    }

    public function getVersion()
    {
        $apiUrl = 'https://api.teramont.net/api/veltastudios/p_addons/schedule-templates';
        $appName = config('app.name', 'Pterodactyl');
        $appUrl = config('app.url', 'Unregistered');

        $response = Http::withUserAgent("Schedule Template Manager by Velta Studios @ $appName - $appUrl")
            ->timeout(5)
            ->retry(2, 100, throw: false)
            ->get($apiUrl);

        if ($response->successful()) {
            return response()->json(['version' => $response->json('version')]);
        } else {
            return response()->json(['error' => 'Unable to fetch version information'], 500);
        }
    }

    public function create(): View
    {
        return view('admin.veltastudios.schedule-templates.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'cron.minute' => 'required|string',
            'cron.hour' => 'required|string',
            'cron.dayOfMonth' => 'required|string',
            'cron.month' => 'required|string',
            'cron.dayOfWeek' => 'required|string',
            'tasks' => 'required|array',
            'tasks.*.action' => 'required|string',
            'tasks.*.timeOffset' => 'required|integer|numeric',
            'tasks.*.continueOnFailure' => 'required|boolean',
        ];

        foreach ($request->input('tasks', []) as $key => $task) {
            if (isset($task['action']) && $task['action'] !== 'backup') {
                $rules["tasks.$key.payload"] = 'required|string';
            }
        }

        $validatedData = $request->validate($rules);

        $cronValid = $this->validateCronExpression(
            $validatedData['cron']['minute'],
            $validatedData['cron']['hour'],
            $validatedData['cron']['dayOfMonth'],
            $validatedData['cron']['month'],
            $validatedData['cron']['dayOfWeek']
        );

        if (!$cronValid) {
            return redirect()->back()->withErrors(['cron' => 'Invalid cron expression'])->withInput();
        }

        $template = ScheduleTemplate::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'cron_minute' => $validatedData['cron']['minute'],
            'cron_hour' => $validatedData['cron']['hour'],
            'cron_day_of_month' => $validatedData['cron']['dayOfMonth'],
            'cron_month' => $validatedData['cron']['month'],
            'cron_day_of_week' => $validatedData['cron']['dayOfWeek'],
        ]);

        foreach ($validatedData['tasks'] as $index => $task) {
            ScheduleTemplateTask::create([
                'schedule_template_id' => $template->id,
                'action' => $task['action'],
                'payload' => $task['payload'] ?? '',
                'time_offset' => $task['timeOffset'],
                'continue_on_failure' => $task['continueOnFailure'],
                'order_index' => $index
            ]);
        }

        $this->alert->success('Template created successfully.')->flash();

        return redirect()->route('admin.veltastudios.schedule-templates');
    }

    public function edit(int $id): View
    {
        $template = ScheduleTemplate::with('tasks')->findOrFail($id);

        $template->cron = [
            'minute' => $template->cron_minute,
            'hour' => $template->cron_hour,
            'dayOfMonth' => $template->cron_day_of_month,
            'month' => $template->cron_month,
            'dayOfWeek' => $template->cron_day_of_week,
        ];

        return view('admin.veltastudios.schedule-templates.edit', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        try {
            $rules = [
                'name' => 'required|string|max:255',
                'description' => 'required|string|max:255',
                'cron.minute' => 'required|string',
                'cron.hour' => 'required|string',
                'cron.dayOfMonth' => 'required|string',
                'cron.month' => 'required|string',
                'cron.dayOfWeek' => 'required|string',
                'tasks' => 'required|array',
                'tasks.*.action' => 'required|string',
                'tasks.*.timeOffset' => 'required|integer',
                'tasks.*.continueOnFailure' => 'required|boolean',
            ];

            foreach ($request->input('tasks', []) as $key => $task) {
                if (isset($task['action']) && $task['action'] !== 'backup') {
                    $rules["tasks.$key.payload"] = 'required|string';
                }
            }

            $validatedData = $request->validate($rules);

            $cronValid = $this->validateCronExpression(
                $validatedData['cron']['minute'],
                $validatedData['cron']['hour'],
                $validatedData['cron']['dayOfMonth'],
                $validatedData['cron']['month'],
                $validatedData['cron']['dayOfWeek']
            );

            if (!$cronValid) {
                return redirect()->back()->withErrors(['cron' => 'Invalid cron expression'])->withInput();
            }

            $template = ScheduleTemplate::findOrFail($id);
            $template->update([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'],
                'cron_minute' => $validatedData['cron']['minute'],
                'cron_hour' => $validatedData['cron']['hour'],
                'cron_day_of_month' => $validatedData['cron']['dayOfMonth'],
                'cron_month' => $validatedData['cron']['month'],
                'cron_day_of_week' => $validatedData['cron']['dayOfWeek'],
            ]);

            $template->tasks()->delete();

            foreach ($validatedData['tasks'] as $index => $task) {
                ScheduleTemplateTask::create([
                    'schedule_template_id' => $template->id,
                    'action' => $task['action'],
                    'payload' => $task['payload'] ?? '',
                    'time_offset' => $task['timeOffset'],
                    'continue_on_failure' => $task['continueOnFailure'],
                    'order_index' => $index
                ]);
            }

            $this->alert->success('Template updated successfully.')->flash();
            return redirect()->route('admin.veltastudios.schedule-templates');
        } catch (\Exception $exception) {
            $this->alert->danger('An error occurred while updating the template.')->flash();
            return redirect()->route('admin.veltastudios.schedule-templates.edit', $id);
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        ScheduleTemplate::destroy($id);

        $this->alert->success('Template deleted successfully.')->flash();

        return redirect()->route('admin.veltastudios.schedule-templates');
    }

    protected function validateCronExpression($minute, $hour, $dayOfMonth, $month, $dayOfWeek)
    {
        $expression = "$minute $hour $dayOfMonth $month $dayOfWeek";

        try {
            new \Cron\CronExpression($expression);
            return true;
        } catch (\InvalidArgumentException $e) {
            return false;
        }
    }
}
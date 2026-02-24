<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Helpers\Utilities;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Repositories\Eloquent\ScheduleRepository;
use Pterodactyl\Services\Schedules\ProcessScheduleService;
use Pterodactyl\Transformers\Api\Client\ScheduleTransformer;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Pterodactyl\Http\Requests\Api\Client\Servers\Schedules\ViewScheduleRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Schedules\StoreScheduleRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Schedules\DeleteScheduleRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Schedules\UpdateScheduleRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Schedules\TriggerScheduleRequest;
use Dotenv\Dotenv;

class ScheduleController extends ClientApiController
{
    /**
     * ScheduleController constructor.
     */
    public function __construct(private ScheduleRepository $repository, private ProcessScheduleService $service)
    {
        parent::__construct();

        $dotenv = Dotenv::createImmutable(base_path());
        $dotenv->load();
        $dotenv->required('APP_TIMEZONE');
    }

    /**
     * Returns all the schedules belonging to a given server.
     */
    public function index(ViewScheduleRequest $request, Server $server): array
    {
        $schedules = $server->schedules->loadMissing('tasks');

        return $this->fractal->collection($schedules)
            ->transformWith($this->getTransformer(ScheduleTransformer::class))
            ->toArray();
    }

    /**
     * Store a new schedule for a server.
     *
     * @throws DisplayException
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function store(StoreScheduleRequest $request, Server $server): array
    {
        $panelTimeZone = new \DateTimeZone(env('APP_TIMEZONE'));
        $serverTimeZone = new \DateTimeZone($server->timezone);
        $cronHour = $this->adjustCronHour($request->input('hour'), $serverTimeZone, $panelTimeZone);

        /** @var Schedule $model */
        $model = $this->repository->create([
            'server_id' => $server->id,
            'name' => $request->input('name'),
            'cron_day_of_week' => $request->input('day_of_week'),
            'cron_month' => $request->input('month'),
            'cron_day_of_month' => $request->input('day_of_month'),
            'cron_hour' => (string) $cronHour,
            'cron_minute' => $request->input('minute'),
            'is_active' => (bool) $request->input('is_active'),
            'only_when_online' => (bool) $request->input('only_when_online'),
            'next_run_at' => $this->getNextRunAt($request, $server),
        ]);

        Activity::event('server:schedule.create')
            ->subject($model)
            ->property('name', $model->name)
            ->log();

        return $this->fractal->item($model)
            ->transformWith($this->getTransformer(ScheduleTransformer::class))
            ->toArray();
    }

    /**
     * Returns a specific schedule for the server.
     */
    public function view(ViewScheduleRequest $request, Server $server, Schedule $schedule): array
    {
        if ($schedule->server_id !== $server->id) {
            throw new NotFoundHttpException();
        }

        $schedule->loadMissing('tasks');

        return $this->fractal->item($schedule)
            ->transformWith($this->getTransformer(ScheduleTransformer::class))
            ->toArray();
    }

    /**
     * Updates a given schedule with the new data provided.
     *
     * @throws DisplayException
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(UpdateScheduleRequest $request, Server $server, Schedule $schedule): array
    {
        $active = (bool) $request->input('is_active');

        $panelTimeZone = new \DateTimeZone(env('APP_TIMEZONE'));
        $serverTimeZone = new \DateTimeZone($server->timezone);
        $cronHour = $this->adjustCronHour($request->input('hour'), $serverTimeZone, $panelTimeZone);

        $data = [
            'name' => $request->input('name'),
            'cron_day_of_week' => $request->input('day_of_week'),
            'cron_month' => $request->input('month'),
            'cron_day_of_month' => $request->input('day_of_month'),
            'cron_hour' => (string) $cronHour,
            'cron_minute' => $request->input('minute'),
            'is_active' => $active,
            'only_when_online' => (bool) $request->input('only_when_online'),
            'next_run_at' => $this->getNextRunAt($request, $server),
        ];

        // Toggle the processing state of the scheduled task when it is enabled or disabled so that an
        // invalid state can be reset without manual database intervention.
        //
        // @see https://github.com/pterodactyl/panel/issues/2425
        if ($schedule->is_active !== $active) {
            $data['is_processing'] = false;
        }

        $this->repository->update($schedule->id, $data);

        Activity::event('server:schedule.update')
            ->subject($schedule)
            ->property(['name' => $schedule->name, 'active' => $active])
            ->log();

        return $this->fractal->item($schedule->refresh())
            ->transformWith($this->getTransformer(ScheduleTransformer::class))
            ->toArray();
    }

    /**
     * Executes a given schedule immediately rather than waiting on it's normally scheduled time
     * to pass. This does not care about the schedule state.
     *
     * @throws \Throwable
     */
    public function execute(TriggerScheduleRequest $request, Server $server, Schedule $schedule): JsonResponse
    {
        $this->service->handle($schedule, true);

        Activity::event('server:schedule.execute')->subject($schedule)->property('name', $schedule->name)->log();

        return new JsonResponse([], JsonResponse::HTTP_ACCEPTED);
    }

    /**
     * Deletes a schedule and it's associated tasks.
     */
    public function delete(DeleteScheduleRequest $request, Server $server, Schedule $schedule): JsonResponse
    {
        $this->repository->delete($schedule->id);

        Activity::event('server:schedule.delete')->subject($schedule)->property('name', $schedule->name)->log();

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    /**
     * Get the next run timestamp based on the cron data provided.
     *
     * @throws DisplayException
     */
    protected function getNextRunAt(Request $request, Server $server): Carbon
    {
        $panelTimeZone = new \DateTimeZone(env('APP_TIMEZONE'));
        $serverTimeZone = new \DateTimeZone($server->timezone);
        $cronHour = $this->adjustCronHour($request->input('hour'), $serverTimeZone, $panelTimeZone);

        $minute = $request->input('minute');
        $hour = (string) $cronHour;
        $dayOfMonth = $request->input('day_of_month');
        $month = $request->input('month');
        $dayOfWeek = $request->input('day_of_week');

        try {
            return Utilities::getScheduleNextRunDate($minute, $hour, $dayOfMonth, $month, $dayOfWeek);
        } catch (\Exception $exception) {
            throw new DisplayException('The cron data provided does not evaluate to a valid expression.');
        }
    }

    private function adjustCronHour($inputHour, $serverTimeZone, $panelTimeZone)
    {
        if (strpos($inputHour, ',') !== false) {
            $hours = explode(',', $inputHour);
            $adjustedHours = array_map(function ($hour) use ($serverTimeZone, $panelTimeZone) {
                return $this->adjustSingleHour($hour, $serverTimeZone, $panelTimeZone);
            }, $hours);
            return implode(',', $adjustedHours);
        }
        if (strpos($inputHour, '-') !== false) {
            list($start, $end) = explode('-', $inputHour);
            $startAdjusted = $this->adjustSingleHour($start, $serverTimeZone, $panelTimeZone);
            $endAdjusted = $this->adjustSingleHour($end, $serverTimeZone, $panelTimeZone);
            return $startAdjusted . '-' . $endAdjusted;
        }

        return $this->adjustSingleHour($inputHour, $serverTimeZone, $panelTimeZone);
    }

    private function adjustSingleHour($hour, $serverTimeZone, $panelTimeZone)
    {
        if (strpos($hour, '/') !== false || $hour === '*') {
            return $hour;
        } else {
            $offsetDifference = ($panelTimeZone->getOffset(new \DateTime()) - $serverTimeZone->getOffset(new \DateTime())) / 3600;
            $adjustedHour = (int) $hour + $offsetDifference;
            $adjustedHour = ($adjustedHour >= 0) ? $adjustedHour % 24 : 24 + ($adjustedHour % 24);
            return (string) $adjustedHour;
        }
    }
}

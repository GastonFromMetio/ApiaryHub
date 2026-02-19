<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\Apiary;
use App\Models\Hive;
use App\Models\Reading;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'apiary_id' => ['nullable', 'integer', 'exists:apiaries,id'],
        ]);

        $selectedApiaryId = array_key_exists('apiary_id', $validated)
            ? (int) $validated['apiary_id']
            : null;

        $users = User::query()
            ->select(['id', 'name', 'email', 'is_admin', 'created_at'])
            ->latest()
            ->get();

        $apiaryOptions = Apiary::query()
            ->with('user:id,name,email')
            ->orderBy('name')
            ->get(['id', 'user_id', 'name']);

        $apiaryCounts = Apiary::query()
            ->selectRaw('user_id, COUNT(*) as total')
            ->when($selectedApiaryId, fn ($query) => $query->where('id', $selectedApiaryId))
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $hiveCounts = Hive::query()
            ->selectRaw('user_id, COUNT(*) as total')
            ->when($selectedApiaryId, fn ($query) => $query->where('apiary_id', $selectedApiaryId))
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $readingCounts = Reading::query()
            ->join('hives', 'hives.id', '=', 'readings.hive_id')
            ->selectRaw('hives.user_id, COUNT(readings.id) as total')
            ->when($selectedApiaryId, fn ($query) => $query->where('hives.apiary_id', $selectedApiaryId))
            ->groupBy('hives.user_id')
            ->pluck('total', 'hives.user_id');

        $actionCounts = Action::query()
            ->join('hives', 'hives.id', '=', 'actions.hive_id')
            ->selectRaw('hives.user_id, COUNT(actions.id) as total')
            ->when($selectedApiaryId, fn ($query) => $query->where('hives.apiary_id', $selectedApiaryId))
            ->groupBy('hives.user_id')
            ->pluck('total', 'hives.user_id');

        $lastReadingAtByUser = Reading::query()
            ->join('hives', 'hives.id', '=', 'readings.hive_id')
            ->selectRaw('hives.user_id, MAX(readings.recorded_at) as last_at')
            ->when($selectedApiaryId, fn ($query) => $query->where('hives.apiary_id', $selectedApiaryId))
            ->groupBy('hives.user_id')
            ->pluck('last_at', 'hives.user_id');

        $lastActionAtByUser = Action::query()
            ->join('hives', 'hives.id', '=', 'actions.hive_id')
            ->selectRaw('hives.user_id, MAX(actions.performed_at) as last_at')
            ->when($selectedApiaryId, fn ($query) => $query->where('hives.apiary_id', $selectedApiaryId))
            ->groupBy('hives.user_id')
            ->pluck('last_at', 'hives.user_id');

        $people = $users->map(function (User $user) use (
            $apiaryCounts,
            $hiveCounts,
            $readingCounts,
            $actionCounts,
            $lastReadingAtByUser,
            $lastActionAtByUser
        ) {
            $lastReading = $lastReadingAtByUser->get($user->id);
            $lastAction = $lastActionAtByUser->get($user->id);
            $lastActivityAt = $this->resolveLastActivityAt($lastReading, $lastAction);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => (bool) $user->is_admin,
                'created_at' => $user->created_at,
                'apiaries_count' => (int) ($apiaryCounts->get($user->id) ?? 0),
                'hives_count' => (int) ($hiveCounts->get($user->id) ?? 0),
                'readings_count' => (int) ($readingCounts->get($user->id) ?? 0),
                'actions_count' => (int) ($actionCounts->get($user->id) ?? 0),
                'last_activity_at' => $lastActivityAt?->toISOString(),
            ];
        })->sortByDesc('last_activity_at')->values();

        $recentApiaries = Apiary::query()
            ->with(['user:id,name,email'])
            ->when($selectedApiaryId, fn ($query) => $query->where('id', $selectedApiaryId))
            ->latest()
            ->limit(8)
            ->get(['id', 'user_id', 'name', 'created_at']);

        $recentHives = Hive::query()
            ->with(['user:id,name,email', 'apiaryEntity:id,name'])
            ->when($selectedApiaryId, fn ($query) => $query->where('apiary_id', $selectedApiaryId))
            ->latest()
            ->limit(8)
            ->get(['id', 'user_id', 'apiary_id', 'name', 'status', 'created_at']);

        $recentReadings = Reading::query()
            ->with([
                'hive:id,name,user_id,apiary_id',
                'hive.user:id,name,email',
                'hive.apiaryEntity:id,name',
            ])
            ->when($selectedApiaryId, function ($query) use ($selectedApiaryId) {
                $query->whereHas('hive', fn ($hiveQuery) => $hiveQuery->where('apiary_id', $selectedApiaryId));
            })
            ->latest('created_at')
            ->limit(8)
            ->get(['id', 'hive_id', 'weight_kg', 'temperature_c', 'humidity_percent', 'activity_index', 'recorded_at', 'created_at']);

        $recentActions = Action::query()
            ->with([
                'hive:id,name,user_id,apiary_id',
                'hive.user:id,name,email',
                'hive.apiaryEntity:id,name',
            ])
            ->when($selectedApiaryId, function ($query) use ($selectedApiaryId) {
                $query->whereHas('hive', fn ($hiveQuery) => $hiveQuery->where('apiary_id', $selectedApiaryId));
            })
            ->latest('created_at')
            ->limit(8)
            ->get(['id', 'hive_id', 'type', 'description', 'performed_at', 'created_at']);

        $activityByDay = $this->buildActivityByDay($selectedApiaryId);
        $activeUsers = $people->filter(
            fn (array $person) => ($person['readings_count'] + $person['actions_count']) > 0
        )->count();

        return response()->json([
            'filters' => [
                'apiary_id' => $selectedApiaryId,
            ],
            'apiary_options' => $apiaryOptions,
            'stats' => [
                'accounts' => $people->count(),
                'admins' => $users->where('is_admin', true)->count(),
                'active_users' => $activeUsers,
                'apiaries' => $selectedApiaryId ? $recentApiaries->count() : Apiary::count(),
                'hives' => $selectedApiaryId ? Hive::where('apiary_id', $selectedApiaryId)->count() : Hive::count(),
                'readings' => $selectedApiaryId
                    ? Reading::whereHas('hive', fn ($query) => $query->where('apiary_id', $selectedApiaryId))->count()
                    : Reading::count(),
                'actions' => $selectedApiaryId
                    ? Action::whereHas('hive', fn ($query) => $query->where('apiary_id', $selectedApiaryId))->count()
                    : Action::count(),
            ],
            'people' => $people,
            'recent_creations' => [
                'apiaries' => $recentApiaries,
                'hives' => $recentHives,
                'readings' => $recentReadings,
                'actions' => $recentActions,
            ],
            'activity_by_day' => $activityByDay,
        ]);
    }

    private function resolveLastActivityAt(?string $lastReading, ?string $lastAction): ?Carbon
    {
        $readingDate = $lastReading ? Carbon::parse($lastReading) : null;
        $actionDate = $lastAction ? Carbon::parse($lastAction) : null;

        if (! $readingDate) {
            return $actionDate;
        }

        if (! $actionDate) {
            return $readingDate;
        }

        return $readingDate->greaterThan($actionDate) ? $readingDate : $actionDate;
    }

    private function buildActivityByDay(?int $apiaryId): Collection
    {
        $from = now()->subDays(6)->startOfDay();

        $readings = Reading::query()
            ->join('hives', 'hives.id', '=', 'readings.hive_id')
            ->where('readings.recorded_at', '>=', $from)
            ->when($apiaryId, fn ($query) => $query->where('hives.apiary_id', $apiaryId))
            ->selectRaw('DATE(readings.recorded_at) as day, COUNT(readings.id) as total')
            ->groupBy(DB::raw('DATE(readings.recorded_at)'))
            ->pluck('total', 'day');

        $actions = Action::query()
            ->join('hives', 'hives.id', '=', 'actions.hive_id')
            ->where('actions.performed_at', '>=', $from)
            ->when($apiaryId, fn ($query) => $query->where('hives.apiary_id', $apiaryId))
            ->selectRaw('DATE(actions.performed_at) as day, COUNT(actions.id) as total')
            ->groupBy(DB::raw('DATE(actions.performed_at)'))
            ->pluck('total', 'day');

        return collect(range(0, 6))->map(function (int $offset) use ($from, $readings, $actions) {
            $day = $from->copy()->addDays($offset)->toDateString();
            $readingsCount = (int) ($readings->get($day) ?? 0);
            $actionsCount = (int) ($actions->get($day) ?? 0);

            return [
                'day' => $day,
                'readings' => $readingsCount,
                'actions' => $actionsCount,
                'total' => $readingsCount + $actionsCount,
            ];
        });
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\Apiary;
use App\Models\Hive;
use App\Models\Reading;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'apiary_id' => ['nullable', 'integer', 'exists:apiaries,id'],
            'hive_id' => ['nullable', 'integer', 'exists:hives,id'],
        ]);

        $selectedUserId = array_key_exists('user_id', $validated)
            ? (int) $validated['user_id']
            : null;
        $selectedApiaryId = array_key_exists('apiary_id', $validated)
            ? (int) $validated['apiary_id']
            : null;
        $selectedHiveId = array_key_exists('hive_id', $validated)
            ? (int) $validated['hive_id']
            : null;

        $users = $this->applyUserFilters(
            User::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->select(['id', 'name', 'email', 'is_admin', 'created_at'])
            ->latest()
            ->get();

        $userOptions = User::query()
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        $apiaryOptions = Apiary::query()
            ->with('user:id,name,email')
            ->when($selectedUserId, fn (Builder $query) => $query->where('user_id', $selectedUserId))
            ->orderBy('name')
            ->get(['id', 'user_id', 'name']);

        $hiveOptions = $this->applyHiveFilters(
            Hive::query(),
            $selectedUserId,
            $selectedApiaryId,
            null
        )
            ->with(['user:id,name,email', 'apiaryEntity:id,name'])
            ->orderBy('name')
            ->get(['id', 'user_id', 'apiary_id', 'name', 'status']);

        $apiaryCounts = $this->applyApiaryFilters(
            Apiary::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $hiveCounts = $this->applyHiveFilters(
            Hive::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $readingCounts = $this->filteredReadingsQuery(
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->selectRaw('hives.user_id, COUNT(readings.id) as total')
            ->groupBy('hives.user_id')
            ->pluck('total', 'hives.user_id');

        $actionCounts = $this->filteredActionsQuery(
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->selectRaw('hives.user_id, COUNT(actions.id) as total')
            ->groupBy('hives.user_id')
            ->pluck('total', 'hives.user_id');

        $lastReadingAtByUser = $this->filteredReadingsQuery(
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->selectRaw('hives.user_id, MAX(readings.recorded_at) as last_at')
            ->groupBy('hives.user_id')
            ->pluck('last_at', 'hives.user_id');

        $lastActionAtByUser = $this->filteredActionsQuery(
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->selectRaw('hives.user_id, MAX(actions.performed_at) as last_at')
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

        $apiaries = $this->applyApiaryFilters(
            Apiary::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->with(['user:id,name,email'])
            ->withCount('hives')
            ->latest()
            ->get(['id', 'user_id', 'name', 'latitude', 'longitude', 'created_at']);

        $hives = $this->applyHiveFilters(
            Hive::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->with(['user:id,name,email', 'apiaryEntity:id,name'])
            ->withCount(['readings', 'actions'])
            ->latest()
            ->get(['id', 'user_id', 'apiary_id', 'name', 'status', 'latitude', 'longitude', 'created_at']);

        $recentApiaries = $this->applyApiaryFilters(
            Apiary::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->with(['user:id,name,email'])
            ->latest()
            ->limit(8)
            ->get(['id', 'user_id', 'name', 'created_at']);

        $recentHives = $this->applyHiveFilters(
            Hive::query(),
            $selectedUserId,
            $selectedApiaryId,
            $selectedHiveId
        )
            ->with(['user:id,name,email', 'apiaryEntity:id,name'])
            ->latest()
            ->limit(8)
            ->get(['id', 'user_id', 'apiary_id', 'name', 'status', 'created_at']);

        $recentReadings = Reading::query()
            ->with([
                'hive:id,name,user_id,apiary_id',
                'hive.user:id,name,email',
                'hive.apiaryEntity:id,name',
            ])
            ->whereHas('hive', fn (Builder $query) => $this->applyHiveFilters(
                $query,
                $selectedUserId,
                $selectedApiaryId,
                $selectedHiveId
            ))
            ->latest('created_at')
            ->limit(8)
            ->get(['id', 'hive_id', 'weight_kg', 'temperature_c', 'humidity_percent', 'activity_index', 'recorded_at', 'created_at']);

        $recentActions = Action::query()
            ->with([
                'hive:id,name,user_id,apiary_id',
                'hive.user:id,name,email',
                'hive.apiaryEntity:id,name',
            ])
            ->whereHas('hive', fn (Builder $query) => $this->applyHiveFilters(
                $query,
                $selectedUserId,
                $selectedApiaryId,
                $selectedHiveId
            ))
            ->latest('created_at')
            ->limit(8)
            ->get(['id', 'hive_id', 'type', 'description', 'performed_at', 'created_at']);

        $activityByDay = $this->buildActivityByDay($selectedUserId, $selectedApiaryId, $selectedHiveId);
        $activeUsers = $people->filter(
            fn (array $person) => ($person['readings_count'] + $person['actions_count']) > 0
        )->count();

        return response()->json([
            'filters' => [
                'user_id' => $selectedUserId,
                'apiary_id' => $selectedApiaryId,
                'hive_id' => $selectedHiveId,
            ],
            'user_options' => $userOptions,
            'apiary_options' => $apiaryOptions,
            'hive_options' => $hiveOptions,
            'stats' => [
                'accounts' => $people->count(),
                'admins' => $users->where('is_admin', true)->count(),
                'active_users' => $activeUsers,
                'apiaries' => $apiaries->count(),
                'hives' => $hives->count(),
                'readings' => (int) $readingCounts->sum(),
                'actions' => (int) $actionCounts->sum(),
            ],
            'people' => $people,
            'apiaries' => $apiaries,
            'hives' => $hives,
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

    private function buildActivityByDay(?int $userId, ?int $apiaryId, ?int $hiveId): Collection
    {
        $from = now()->subDays(6)->startOfDay();

        $readings = $this->filteredReadingsQuery($userId, $apiaryId, $hiveId)
            ->where('readings.recorded_at', '>=', $from)
            ->selectRaw('DATE(readings.recorded_at) as day, COUNT(readings.id) as total')
            ->groupBy(DB::raw('DATE(readings.recorded_at)'))
            ->pluck('total', 'day');

        $actions = $this->filteredActionsQuery($userId, $apiaryId, $hiveId)
            ->where('actions.performed_at', '>=', $from)
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

    private function applyUserFilters(Builder $query, ?int $userId, ?int $apiaryId, ?int $hiveId): Builder
    {
        return $query
            ->when($userId, fn (Builder $builder) => $builder->whereKey($userId))
            ->when($apiaryId, fn (Builder $builder) => $builder->whereHas(
                'apiaries',
                fn (Builder $apiaryQuery) => $apiaryQuery->whereKey($apiaryId)
            ))
            ->when($hiveId, fn (Builder $builder) => $builder->whereHas(
                'hives',
                fn (Builder $hiveQuery) => $hiveQuery->whereKey($hiveId)
            ));
    }

    private function applyApiaryFilters(Builder $query, ?int $userId, ?int $apiaryId, ?int $hiveId): Builder
    {
        return $query
            ->when($userId, fn (Builder $builder) => $builder->where('user_id', $userId))
            ->when($apiaryId, fn (Builder $builder) => $builder->whereKey($apiaryId))
            ->when($hiveId, fn (Builder $builder) => $builder->whereHas(
                'hives',
                fn (Builder $hiveQuery) => $hiveQuery->whereKey($hiveId)
            ));
    }

    private function applyHiveFilters(Builder $query, ?int $userId, ?int $apiaryId, ?int $hiveId): Builder
    {
        return $query
            ->when($userId, fn (Builder $builder) => $builder->where('user_id', $userId))
            ->when($apiaryId, fn (Builder $builder) => $builder->where('apiary_id', $apiaryId))
            ->when($hiveId, fn (Builder $builder) => $builder->whereKey($hiveId));
    }

    private function filteredReadingsQuery(?int $userId, ?int $apiaryId, ?int $hiveId): Builder
    {
        return Reading::query()
            ->join('hives', 'hives.id', '=', 'readings.hive_id')
            ->when($userId, fn (Builder $query) => $query->where('hives.user_id', $userId))
            ->when($apiaryId, fn (Builder $query) => $query->where('hives.apiary_id', $apiaryId))
            ->when($hiveId, fn (Builder $query) => $query->where('readings.hive_id', $hiveId));
    }

    private function filteredActionsQuery(?int $userId, ?int $apiaryId, ?int $hiveId): Builder
    {
        return Action::query()
            ->join('hives', 'hives.id', '=', 'actions.hive_id')
            ->when($userId, fn (Builder $query) => $query->where('hives.user_id', $userId))
            ->when($apiaryId, fn (Builder $query) => $query->where('hives.apiary_id', $apiaryId))
            ->when($hiveId, fn (Builder $query) => $query->where('actions.hive_id', $hiveId));
    }
}

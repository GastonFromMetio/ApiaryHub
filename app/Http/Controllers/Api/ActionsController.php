<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActionRequest;
use App\Http\Requests\UpdateActionRequest;
use App\Models\Action as HiveAction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActionsController extends Controller
{
    /// Display a listing of the resource.
    public function index(Request $request)
    {
        $query = HiveAction::query()
            ->with('hive:id,name')
            ->whereHas('hive', function ($hiveQuery) use ($request) {
                $hiveQuery->where('user_id', $request->user()->id);
            })
            ->orderByDesc('performed_at');

        if ($request->filled('hive_id')) {
            $hiveId = (int) $request->query('hive_id');

            abort_if(
                ! $request->user()->hives()->whereKey($hiveId)->exists(),
                Response::HTTP_FORBIDDEN,
                'You do not have access to this hive.'
            );

            $query->where('hive_id', $hiveId);
        }

        return response()->json($query->get());
    }

    /// Store a newly created resource in storage.
    public function store(StoreActionRequest $request)
    {
        $action = HiveAction::create($request->validated());

        return response()->json($action->load('hive:id,name'), Response::HTTP_CREATED);
    }

    /// Update the specified resource in storage.
    public function update(UpdateActionRequest $request, HiveAction $action)
    {
        $this->abortIfNotOwner($request, $action);
        $action->update($request->validated());

        return response()->json($action->fresh()->load('hive:id,name'));
    }

    /// Remove the specified resource from storage.
    public function destroy(Request $request, HiveAction $action)
    {
        $this->abortIfNotOwner($request, $action);
        $action->delete();

        return response()->noContent();
    }

    /// Helper method to check if the authenticated user is the owner of the action's hive.
    private function abortIfNotOwner(Request $request, HiveAction $action): void
    {
        abort_if(
            $action->hive()->value('user_id') !== $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You do not have access to this action.'
        );
    }
}

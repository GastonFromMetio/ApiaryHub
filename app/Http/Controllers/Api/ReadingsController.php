<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReadingRequest;
use App\Http\Requests\UpdateReadingRequest;
use App\Models\Reading;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReadingsController extends Controller
{
    public function index(Request $request)
    {
        $query = Reading::query()
            ->with('hive:id,name')
            ->whereHas('hive', function ($hiveQuery) use ($request) {
                $hiveQuery->where('user_id', $request->user()->id);
            })
            ->orderByDesc('recorded_at');

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

    public function store(StoreReadingRequest $request)
    {
        $reading = Reading::create($request->validated());

        return response()->json($reading->load('hive:id,name'), Response::HTTP_CREATED);
    }

    public function update(UpdateReadingRequest $request, Reading $reading)
    {
        $this->abortIfNotOwner($request, $reading);
        $reading->update($request->validated());

        return response()->json($reading->fresh()->load('hive:id,name'));
    }

    public function destroy(Request $request, Reading $reading)
    {
        $this->abortIfNotOwner($request, $reading);
        $reading->delete();

        return response()->noContent();
    }

    private function abortIfNotOwner(Request $request, Reading $reading): void
    {
        abort_if(
            $reading->hive()->value('user_id') !== $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You do not have access to this reading.'
        );
    }
}

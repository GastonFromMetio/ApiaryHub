<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHiveRequest;
use App\Http\Requests\UpdateHiveRequest;
use App\Models\Hive;
use App\Services\WeatherService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HivesController extends Controller
{
    /// Display a listing of the resource.
    public function index(Request $request)
    {
        $query = $request->user()
            ->hives()
            ->with('apiaryEntity:id,name')
            ->latest()
            ;

        if ($request->filled('apiary_id')) {
            $apiaryId = (int) $request->query('apiary_id');

            abort_if(
                ! $request->user()->apiaries()->whereKey($apiaryId)->exists(),
                Response::HTTP_FORBIDDEN,
                'You do not have access to this apiary.'
            );

            $query->where('apiary_id', $apiaryId);
        }

        $hives = $query->get();

        return response()->json($hives);
    }

    /// Store a newly created resource in storage.
    public function store(StoreHiveRequest $request)
    {
        $hive = $request->user()->hives()->create($request->validated());

        return response()->json($hive->load('apiaryEntity:id,name'), Response::HTTP_CREATED);
    }

    /// Update the specified resource in storage.     
    public function update(UpdateHiveRequest $request, Hive $hive)
    {
        $this->abortIfNotOwner($request, $hive);
        $hive->update($request->validated());

        return response()->json($hive->fresh()->load('apiaryEntity:id,name'));
    }

    /// Remove the specified resource from storage.
    public function destroy(Request $request, Hive $hive)
    {
        $this->abortIfNotOwner($request, $hive);
        $hive->delete();

        return response()->noContent();
    }

    /// Fetch current weather data for the hive's location.
    public function weather(Request $request, Hive $hive, WeatherService $weatherService)
    {
        $this->abortIfNotOwner($request, $hive);

        if ($hive->latitude === null || $hive->longitude === null) {
            return response()->json([
                'message' => 'Hive latitude and longitude are required to fetch weather.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $weather = $weatherService->forCoordinates(
                (float) $hive->latitude,
                (float) $hive->longitude
            );
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to fetch weather data from provider.',
            ], Response::HTTP_BAD_GATEWAY);
        }

        return response()->json([
            'hive_id' => $hive->id,
            'weather' => $weather,
        ]);
    }

    /// Helper method to check if the authenticated user is the owner of the hive.
    private function abortIfNotOwner(Request $request, Hive $hive): void
    {
        abort_if(
            $hive->user_id !== $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You do not have access to this hive.'
        );
    }
}

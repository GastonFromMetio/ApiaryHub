<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApiaryRequest;
use App\Http\Requests\UpdateApiaryRequest;
use App\Models\Apiary;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiariesController extends Controller
{
    public function index(Request $request)
    {
        $apiaries = $request->user()
            ->apiaries()
            ->withCount('hives')
            ->latest()
            ->get();

        return response()->json($apiaries);
    }

    public function store(StoreApiaryRequest $request)
    {
        $apiary = $request->user()->apiaries()->create($request->validated());

        return response()->json($apiary->loadCount('hives'), Response::HTTP_CREATED);
    }

    public function update(UpdateApiaryRequest $request, Apiary $apiary)
    {
        $this->abortIfNotOwner($request, $apiary);
        $apiary->update($request->validated());

        return response()->json($apiary->fresh()->loadCount('hives'));
    }

    public function destroy(Request $request, Apiary $apiary)
    {
        $this->abortIfNotOwner($request, $apiary);

        if ($apiary->hives()->exists()) {
            return response()->json([
                'message' => 'Cannot delete an apiary that still contains hives.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $apiary->delete();

        return response()->noContent();
    }

    private function abortIfNotOwner(Request $request, Apiary $apiary): void
    {
        abort_if(
            $apiary->user_id !== $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You do not have access to this apiary.'
        );
    }
}

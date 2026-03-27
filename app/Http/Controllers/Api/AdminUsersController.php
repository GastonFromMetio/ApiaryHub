<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminUsersController extends Controller
{
    public function destroy(Request $request, User $user)
    {
        if ($request->user()->is($user)) {
            return response()->json([
                'message' => 'Impossible de supprimer votre propre compte depuis l’administration.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }
}

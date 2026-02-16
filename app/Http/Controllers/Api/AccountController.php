<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpFoundation\Response;

class AccountController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ]);

        if (! empty($validated['password'] ?? null)) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is invalid.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user->password = $validated['password'];
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return response()->json($user->fresh());
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'password' => ['required', 'string'],
            'confirmation' => ['required', 'in:SUPPRIMER'],
        ]);

        if (! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Password is invalid.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }
}

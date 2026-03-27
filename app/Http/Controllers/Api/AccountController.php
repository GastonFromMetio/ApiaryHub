<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AccountController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $emailHasChanged = false;
        $passwordHasChanged = false;

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

        $emailHasChanged = $user->email !== $validated['email'];
        $passwordHasChanged = ! empty($validated['password'] ?? null);
        $requiresCredentialConfirmation = $emailHasChanged || $passwordHasChanged;

        if ($requiresCredentialConfirmation) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is invalid.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if ($passwordHasChanged) {
            $user->password = $validated['password'];
        }

        $user->name = $validated['name'];

        if ($emailHasChanged) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailHasChanged) {
            try {
                $user->sendEmailVerificationNotification();
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        $responsePayload = [
            'user' => $user->fresh(),
            'session_rotated' => false,
        ];

        if ($requiresCredentialConfirmation) {
            $user->tokens()->delete();
            $issuedToken = $user->issueApiToken();

            $responsePayload['token'] = $issuedToken->plainTextToken;
            $responsePayload['token_type'] = 'Bearer';
            $responsePayload['expires_at'] = $issuedToken->accessToken->expires_at?->toISOString();
            $responsePayload['session_rotated'] = true;
        }

        return response()->json($responsePayload);
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

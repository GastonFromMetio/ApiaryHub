<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuthController extends Controller
{
    /// Register a new user.
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $user = User::create($validated);
        $verificationEmailSent = $this->trySendVerificationEmail($user);

        return response()->json([
            'message' => $verificationEmailSent
                ? 'Compte cree. Verifie ton email pour activer ta connexion.'
                : 'Compte cree. Email de verification indisponible temporairement, reessaie plus tard.',
            'email_verification_required' => true,
            'verification_email_sent' => $verificationEmailSent,
        ], 201);
    }

    /// Authenticate a user and issue a token.
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        $emailVerificationRequired = ! $user->hasVerifiedEmail();

        $verificationEmailSent = true;

        if ($emailVerificationRequired) {
            $verificationEmailSent = $this->trySendVerificationEmail($user);
        }

        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'email_verification_required' => $emailVerificationRequired,
            'verification_email_sent' => $verificationEmailSent,
            'message' => $emailVerificationRequired
                ? ($verificationEmailSent
                    ? 'Email non verifie. Verifie ta boite mail.'
                    : 'Email non verifie. Verification indisponible temporairement, reessaie plus tard.')
                : 'Connexion reussie.',
        ]);
    }

    /// Logout the authenticated user by revoking their current token.
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        $verificationEmailSent = false;
        if ($user && ! $user->hasVerifiedEmail()) {
            $verificationEmailSent = $this->trySendVerificationEmail($user);
        }

        return response()->json([
            'message' => $verificationEmailSent
                ? 'Si un compte non verifie existe, un email de verification vient d\'etre envoye.'
                : 'Si un compte non verifie existe, reessaie plus tard pour renvoyer la verification.',
            'verification_email_sent' => $verificationEmailSent,
        ]);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);

        abort_if(
            ! hash_equals((string) $hash, sha1($user->getEmailForVerification())),
            Response::HTTP_FORBIDDEN,
            'Invalid verification link.'
        );

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Email verifie avec succes.',
            ]);
        }

        return redirect('/?email_verified=1');
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink([
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'Si cet email existe, un lien de reinitialisation vient d\'etre envoye.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'message' => 'Mot de passe reinitialise. Tu peux maintenant te connecter.',
        ]);
    }

    private function trySendVerificationEmail(User $user): bool
    {
        try {
            $user->sendEmailVerificationNotification();
            return true;
        } catch (Throwable $exception) {
            report($exception);
            return false;
        }
    }
}

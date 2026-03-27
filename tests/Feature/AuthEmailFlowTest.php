<?php

namespace Tests\Feature;

use App\Notifications\QueuedResetPassword;
use App\Notifications\QueuedVerifyEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthEmailFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_sends_verification_email_and_does_not_return_token(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Nouveau Compte',
            'email' => 'nouveau@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('email_verification_required', true)
            ->assertJsonMissingPath('token');

        $user = User::where('email', 'nouveau@example.test')->firstOrFail();

        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, QueuedVerifyEmail::class);
    }

    public function test_unverified_user_can_login_but_is_flagged_and_receives_verification_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'pending@example.test',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'pending@example.test',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('email_verification_required', true)
            ->assertJsonStructure(['token', 'token_type', 'expires_at', 'user']);

        $accessToken = PersonalAccessToken::findToken($response->json('token'));

        $this->assertNotNull($accessToken);
        $this->assertNotNull($accessToken->expires_at);

        Notification::assertSentTo($user, QueuedVerifyEmail::class);
    }

    public function test_resend_verification_response_does_not_disclose_account_state(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create([
            'email' => 'pending@example.test',
        ]);

        $expectedMessage = 'Si ce compte existe et n\'est pas verifie, un email va etre envoye si possible.';

        $existingResponse = $this->postJson('/api/auth/resend-verification', [
            'email' => 'pending@example.test',
        ]);

        $missingResponse = $this->postJson('/api/auth/resend-verification', [
            'email' => 'missing@example.test',
        ]);

        $existingResponse->assertOk()
            ->assertExactJson(['message' => $expectedMessage]);

        $missingResponse->assertOk()
            ->assertExactJson(['message' => $expectedMessage]);

        Notification::assertSentTo($user, QueuedVerifyEmail::class);
    }

    public function test_user_can_verify_email_through_signed_link(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(30),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->getJson($verificationUrl);

        $response->assertOk()
            ->assertJsonPath('message', 'Email verifie avec succes.');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_forgot_password_sends_reset_link_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset@example.test',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'reset@example.test',
        ]);

        $response->assertOk();

        Notification::assertSentTo($user, QueuedResetPassword::class);
    }

    public function test_user_can_reset_password_and_login_with_new_password(): void
    {
        $user = User::factory()->create([
            'email' => 'recover@example.test',
            'password' => 'old-password-123',
            'email_verified_at' => now(),
        ]);

        $token = Password::broker()->createToken($user);

        $resetResponse = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => 'recover@example.test',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $resetResponse->assertOk()
            ->assertJsonPath('message', 'Mot de passe reinitialise. Tu peux maintenant te connecter.');

        $this->postJson('/api/auth/login', [
            'email' => 'recover@example.test',
            'password' => 'old-password-123',
        ])->assertUnprocessable();

        $this->postJson('/api/auth/login', [
            'email' => 'recover@example.test',
            'password' => 'new-password-123',
        ])->assertOk()->assertJsonStructure(['token', 'token_type', 'expires_at', 'user']);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
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
        Notification::assertSentTo($user, VerifyEmail::class);
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
            ->assertJsonStructure(['token', 'token_type', 'user']);

        Notification::assertSentTo($user, VerifyEmail::class);
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

        Notification::assertSentTo($user, ResetPassword::class);
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
        ])->assertOk()->assertJsonStructure(['token', 'token_type', 'user']);
    }
}

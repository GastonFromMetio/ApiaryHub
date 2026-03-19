<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_throttled_after_five_attempts_per_account_and_ip(): void
    {
        User::factory()->create([
            'email' => 'login-throttle@example.test',
            'password' => 'password123',
        ]);

        $ip = '198.51.100.10';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])
                ->postJson('/api/auth/login', [
                    'email' => 'login-throttle@example.test',
                    'password' => 'wrong-password',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/auth/login', [
                'email' => 'login-throttle@example.test',
                'password' => 'wrong-password',
            ])
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Too many authentication attempts. Please retry in a minute.');
    }

    public function test_register_is_throttled_after_three_attempts_per_ip(): void
    {
        Notification::fake();

        $ip = '198.51.100.11';

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])
                ->postJson('/api/auth/register', [
                    'name' => 'Register Throttle',
                    'email' => "register-throttle-{$attempt}@example.test",
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ])
                ->assertCreated();
        }

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/auth/register', [
                'name' => 'Register Throttle',
                'email' => 'register-throttle-4@example.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Too many authentication attempts. Please retry in a minute.');
    }

    public function test_forgot_password_is_throttled_after_three_attempts_per_account_and_ip(): void
    {
        Notification::fake();

        User::factory()->create([
            'email' => 'forgot-throttle@example.test',
        ]);

        $ip = '198.51.100.12';

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])
                ->postJson('/api/auth/forgot-password', [
                    'email' => 'forgot-throttle@example.test',
                ])
                ->assertOk();
        }

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/auth/forgot-password', [
                'email' => 'forgot-throttle@example.test',
            ])
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Too many authentication attempts. Please retry in a minute.');
    }

    public function test_reset_password_is_throttled_after_five_attempts_per_account_and_ip(): void
    {
        User::factory()->create([
            'email' => 'reset-throttle@example.test',
        ]);

        $ip = '198.51.100.13';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])
                ->postJson('/api/auth/reset-password', [
                    'token' => 'invalid-token',
                    'email' => 'reset-throttle@example.test',
                    'password' => 'new-password-123',
                    'password_confirmation' => 'new-password-123',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/auth/reset-password', [
                'token' => 'invalid-token',
                'email' => 'reset-throttle@example.test',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Too many authentication attempts. Please retry in a minute.');
    }

    public function test_resend_verification_is_throttled_after_three_attempts_per_account_and_ip(): void
    {
        Notification::fake();

        User::factory()->unverified()->create([
            'email' => 'verification-throttle@example.test',
        ]);

        $ip = '198.51.100.14';

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])
                ->postJson('/api/auth/resend-verification', [
                    'email' => 'verification-throttle@example.test',
                ])
                ->assertOk();
        }

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/auth/resend-verification', [
                'email' => 'verification-throttle@example.test',
            ])
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Too many authentication attempts. Please retry in a minute.');
    }
}

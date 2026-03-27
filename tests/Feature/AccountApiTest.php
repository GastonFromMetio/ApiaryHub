<?php

namespace Tests\Feature;

use App\Models\Apiary;
use App\Models\Hive;
use App\Models\User;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile_without_password_change(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/account', [
            'name' => 'Updated Name',
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonPath('user.name', 'Updated Name')
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('session_rotated', false)
            ->assertJsonMissingPath('token');
    }

    public function test_changing_email_requires_new_verification_mail(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/account', [
            'name' => $user->name,
            'email' => 'new-address@example.test',
            'current_password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'new-address@example.test')
            ->assertJsonPath('user.email_verified_at', null)
            ->assertJsonPath('session_rotated', true)
            ->assertJsonStructure(['user', 'token', 'token_type', 'expires_at', 'session_rotated']);

        Notification::assertSentTo($user->fresh(), QueuedVerifyEmail::class);
    }

    public function test_email_change_requires_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/account', [
            'name' => $user->name,
            'email' => 'new-address@example.test',
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'Current password is invalid.');
    }

    public function test_user_can_update_password_with_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'old-password',
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/account', [
            'name' => $user->name,
            'email' => $user->email,
            'current_password' => 'old-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk()
            ->assertJsonPath('session_rotated', true)
            ->assertJsonStructure(['user', 'token', 'token_type', 'expires_at', 'session_rotated']);
    }

    public function test_sensitive_account_changes_revoke_existing_tokens_and_rotate_session(): void
    {
        $user = User::factory()->create([
            'password' => 'old-password',
        ]);

        $currentToken = $user->issueApiToken('current-session');
        $otherToken = $user->issueApiToken('other-session');

        $response = $this->putJson('/api/account', [
            'name' => $user->name,
            'email' => $user->email,
            'current_password' => 'old-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ], [
            'Authorization' => 'Bearer '.$currentToken->plainTextToken,
        ]);

        $rotatedToken = $response->json('token');

        $response->assertOk()
            ->assertJsonPath('session_rotated', true);

        $this->assertNotEmpty($rotatedToken);
        $this->assertSame(1, $user->fresh()->tokens()->count());
        $this->assertNull(PersonalAccessToken::findToken($currentToken->plainTextToken));
        $this->assertNull(PersonalAccessToken::findToken($otherToken->plainTextToken));
        $this->assertNotNull(PersonalAccessToken::findToken($rotatedToken));

        $this->getJson('/api/user', [
            'Authorization' => 'Bearer '.$rotatedToken,
        ])->assertOk()->assertJsonPath('id', $user->id);
    }

    public function test_account_deletion_requires_valid_password_and_confirmation(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson('/api/account', [
            'password' => 'wrong-password',
            'confirmation' => 'SUPPRIMER',
        ])->assertUnprocessable();

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_account_deletion_removes_related_data(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        $apiary = Apiary::create([
            'user_id' => $user->id,
            'name' => 'Rucher Test',
        ]);

        Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiary->id,
            'name' => 'Ruche Test',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson('/api/account', [
            'password' => 'password123',
            'confirmation' => 'SUPPRIMER',
        ])->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('apiaries', ['id' => $apiary->id]);
    }
}

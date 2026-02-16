<?php

namespace Tests\Feature;

use App\Models\Apiary;
use App\Models\Hive;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'email' => 'updated@example.test',
        ]);

        $response->assertOk()
            ->assertJsonPath('name', 'Updated Name')
            ->assertJsonPath('email', 'updated@example.test');
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

        $response->assertOk();
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

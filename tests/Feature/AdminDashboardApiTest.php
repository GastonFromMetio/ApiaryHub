<?php

namespace Tests\Feature;

use App\Models\Action as HiveAction;
use App\Models\Apiary;
use App\Models\Hive;
use App\Models\Reading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_read_dashboard_payload(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $apiary = Apiary::create([
            'user_id' => $user->id,
            'name' => 'Rucher Nord',
        ]);

        $hive = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiary->id,
            'name' => 'Ruche A',
            'status' => 'active',
        ]);

        Reading::create([
            'hive_id' => $hive->id,
            'weight_kg' => 33.1,
            'temperature_c' => 29.8,
            'humidity_percent' => 58,
            'activity_index' => 67,
            'recorded_at' => now(),
        ]);

        HiveAction::create([
            'hive_id' => $hive->id,
            'type' => 'visite',
            'description' => 'Controle de routine',
            'performed_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('stats.accounts', 2)
            ->assertJsonPath('stats.admins', 1)
            ->assertJsonPath('stats.active_users', 1)
            ->assertJsonPath('stats.apiaries', 1)
            ->assertJsonPath('stats.hives', 1)
            ->assertJsonPath('stats.readings', 1)
            ->assertJsonPath('stats.actions', 1)
            ->assertJsonCount(1, 'apiary_options')
            ->assertJsonCount(2, 'people')
            ->assertJsonCount(7, 'activity_by_day')
            ->assertJsonCount(1, 'recent_creations.apiaries')
            ->assertJsonCount(1, 'recent_creations.hives')
            ->assertJsonCount(1, 'recent_creations.readings')
            ->assertJsonCount(1, 'recent_creations.actions');
    }

    public function test_admin_dashboard_can_be_filtered_by_apiary(): void
    {
        $admin = User::factory()->admin()->create();
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $apiaryA = Apiary::create([
            'user_id' => $userA->id,
            'name' => 'Rucher A',
        ]);

        $apiaryB = Apiary::create([
            'user_id' => $userB->id,
            'name' => 'Rucher B',
        ]);

        $hiveA = Hive::create([
            'user_id' => $userA->id,
            'apiary_id' => $apiaryA->id,
            'name' => 'Ruche A',
            'status' => 'active',
        ]);

        $hiveB = Hive::create([
            'user_id' => $userB->id,
            'apiary_id' => $apiaryB->id,
            'name' => 'Ruche B',
            'status' => 'active',
        ]);

        Reading::create([
            'hive_id' => $hiveA->id,
            'recorded_at' => now(),
        ]);

        Reading::create([
            'hive_id' => $hiveB->id,
            'recorded_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/dashboard?apiary_id='.$apiaryA->id);

        $response->assertOk()
            ->assertJsonPath('filters.apiary_id', $apiaryA->id)
            ->assertJsonPath('stats.apiaries', 1)
            ->assertJsonPath('stats.hives', 1)
            ->assertJsonPath('stats.readings', 1);
    }

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('message', 'Admin access required.');
    }
}

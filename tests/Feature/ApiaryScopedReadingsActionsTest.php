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

class ApiaryScopedReadingsActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_readings_can_be_filtered_by_owned_apiary(): void
    {
        $user = User::factory()->create();
        $apiaryA = Apiary::create(['user_id' => $user->id, 'name' => 'Rucher A']);
        $apiaryB = Apiary::create(['user_id' => $user->id, 'name' => 'Rucher B']);
        $hiveA = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryA->id,
            'name' => 'Ruche A1',
            'status' => 'active',
        ]);
        $hiveB = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryB->id,
            'name' => 'Ruche B1',
            'status' => 'active',
        ]);
        $readingA = Reading::create([
            'hive_id' => $hiveA->id,
            'recorded_at' => now()->subHour(),
            'weight_kg' => 21.50,
        ]);
        Reading::create([
            'hive_id' => $hiveB->id,
            'recorded_at' => now()->subMinutes(30),
            'weight_kg' => 19.10,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/readings?apiary_id={$apiaryA->id}");

        $response->assertOk();
        $this->assertSame([$readingA->id], collect($response->json())->pluck('id')->all());
    }

    public function test_readings_apiary_filter_is_forbidden_for_foreign_apiary(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $foreignApiary = Apiary::create(['user_id' => $otherUser->id, 'name' => 'Rucher Externe']);

        Sanctum::actingAs($user);

        $this->getJson("/api/readings?apiary_id={$foreignApiary->id}")
            ->assertForbidden();
    }

    public function test_actions_can_be_filtered_by_owned_apiary(): void
    {
        $user = User::factory()->create();
        $apiaryA = Apiary::create(['user_id' => $user->id, 'name' => 'Rucher A']);
        $apiaryB = Apiary::create(['user_id' => $user->id, 'name' => 'Rucher B']);
        $hiveA = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryA->id,
            'name' => 'Ruche A1',
            'status' => 'active',
        ]);
        $hiveB = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryB->id,
            'name' => 'Ruche B1',
            'status' => 'active',
        ]);
        $actionA = HiveAction::create([
            'hive_id' => $hiveA->id,
            'type' => 'visite',
            'performed_at' => now()->subHour(),
        ]);
        HiveAction::create([
            'hive_id' => $hiveB->id,
            'type' => 'traitement',
            'performed_at' => now()->subMinutes(30),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/actions?apiary_id={$apiaryA->id}");

        $response->assertOk();
        $this->assertSame([$actionA->id], collect($response->json())->pluck('id')->all());
    }

    public function test_actions_apiary_filter_is_forbidden_for_foreign_apiary(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $foreignApiary = Apiary::create(['user_id' => $otherUser->id, 'name' => 'Rucher Externe']);

        Sanctum::actingAs($user);

        $this->getJson("/api/actions?apiary_id={$foreignApiary->id}")
            ->assertForbidden();
    }
}

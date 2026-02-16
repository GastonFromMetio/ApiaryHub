<?php

namespace Tests\Feature;

use App\Models\Apiary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HiveApiaryLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_hive_inherits_apiary_name_and_coordinates_when_location_not_set(): void
    {
        $user = User::factory()->create();
        $apiary = Apiary::create([
            'user_id' => $user->id,
            'name' => 'Rucher Localise',
            'latitude' => 43.6046520,
            'longitude' => 1.4442090,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/hives', [
            'name' => 'Ruche Geoloc',
            'apiary_id' => $apiary->id,
            'status' => 'active',
            'notes' => 'test',
        ]);

        $response->assertCreated()
            ->assertJsonPath('apiary', 'Rucher Localise')
            ->assertJsonPath('apiary_id', $apiary->id)
            ->assertJsonPath('latitude', 43.604652)
            ->assertJsonPath('longitude', 1.444209);
    }
}

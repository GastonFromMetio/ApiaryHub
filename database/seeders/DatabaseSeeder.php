<?php

namespace Database\Seeders;

use App\Models\Action as HiveAction;
use App\Models\Apiary;
use App\Models\Hive;
use App\Models\Reading;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::updateOrCreate([
            'email' => 'demo@apiarihub.local',
        ], [
            'name' => 'Apiarihub Demo',
            'password' => 'password123',
        ]);

        $apiaryNorth = Apiary::updateOrCreate([
            'user_id' => $user->id,
            'name' => 'Rucher Nord',
        ], [
            'latitude' => 43.604652,
            'longitude' => 1.444209,
            'notes' => 'Site principal.',
        ]);

        $apiarySouth = Apiary::updateOrCreate([
            'user_id' => $user->id,
            'name' => 'Rucher Sud',
        ], [
            'latitude' => 43.296482,
            'longitude' => 5.369780,
            'notes' => 'Site secondaire.',
        ]);

        $hiveA = Hive::updateOrCreate([
            'user_id' => $user->id,
            'name' => 'Ruche Alpha',
        ], [
            'apiary_id' => $apiaryNorth->id,
            'apiary' => $apiaryNorth->name,
            'latitude' => 43.604652,
            'longitude' => 1.444209,
            'status' => 'active',
            'notes' => 'Colonie forte, surveillance varroa.',
        ]);

        $hiveB = Hive::updateOrCreate([
            'user_id' => $user->id,
            'name' => 'Ruche Beta',
        ], [
            'apiary_id' => $apiarySouth->id,
            'apiary' => $apiarySouth->name,
            'latitude' => 43.296482,
            'longitude' => 5.369780,
            'status' => 'maintenance',
            'notes' => 'Essaim récent, nourrissement en cours.',
        ]);

        $readings = [
            [
                'hive_id' => $hiveA->id,
                'weight_kg' => 36.50,
                'temperature_c' => 31.20,
                'humidity_percent' => 62.00,
                'activity_index' => 74,
                'recorded_at' => CarbonImmutable::parse('2026-02-08 08:00:00', 'UTC'),
            ],
            [
                'hive_id' => $hiveA->id,
                'weight_kg' => 36.80,
                'temperature_c' => 30.80,
                'humidity_percent' => 61.00,
                'activity_index' => 70,
                'recorded_at' => CarbonImmutable::parse('2026-02-09 08:00:00', 'UTC'),
            ],
            [
                'hive_id' => $hiveB->id,
                'weight_kg' => 24.30,
                'temperature_c' => 29.40,
                'humidity_percent' => 66.00,
                'activity_index' => 55,
                'recorded_at' => CarbonImmutable::parse('2026-02-09 09:00:00', 'UTC'),
            ],
        ];

        foreach ($readings as $reading) {
            Reading::updateOrCreate([
                'hive_id' => $reading['hive_id'],
                'recorded_at' => $reading['recorded_at'],
            ], $reading);
        }

        $actions = [
            [
                'hive_id' => $hiveA->id,
                'type' => 'visite',
                'description' => 'Controle du couvain et ajout de hausse.',
                'performed_at' => CarbonImmutable::parse('2026-02-07 10:30:00', 'UTC'),
            ],
            [
                'hive_id' => $hiveB->id,
                'type' => 'nourrissement',
                'description' => 'Sirop 50/50 ajoute en soiree.',
                'performed_at' => CarbonImmutable::parse('2026-02-08 18:00:00', 'UTC'),
            ],
        ];

        foreach ($actions as $action) {
            HiveAction::updateOrCreate([
                'hive_id' => $action['hive_id'],
                'type' => $action['type'],
                'performed_at' => $action['performed_at'],
            ], $action);
        }
    }
}

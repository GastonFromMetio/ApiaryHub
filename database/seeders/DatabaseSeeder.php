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
            'email' => 'demo@apiaryhub.local',
        ], [
            'name' => 'Apiaryhub Demo',
            'password' => 'password123',
            'is_admin' => false,
            'email_verified_at' => now(),
        ]);

        User::updateOrCreate([
            'email' => 'gastonolonde@gmail.com',
        ], [
            'name' => 'ApiaryHub Admin',
            'password' => 'password123',
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        // Keep demo seed deterministic: reset previous demo data.
        $user->hives()->delete();
        $user->apiaries()->delete();

        $apiaryMain = Apiary::create([
            'user_id' => $user->id,
            'name' => 'Le Rucher Des Beestioles',
            'latitude' => 49.091567,
            'longitude' => 3.287739,
            'notes' => 'Site principal.',
        ]);

        $hiveA = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryMain->id,
            'apiary' => $apiaryMain->name,
            'name' => 'Ruche Alpha',
            'latitude' => 49.091567,
            'longitude' => 3.287739,
            'status' => 'active',
            'notes' => 'Colonie forte, surveillance varroa.',
        ]);

        $hiveB = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryMain->id,
            'apiary' => $apiaryMain->name,
            'name' => 'Ruche Beta',
            'latitude' => 49.091607,
            'longitude' => 3.287779,
            'status' => 'maintenance',
            'notes' => 'Essaim recent, nourrissement en cours.',
        ]);

        $hiveC = Hive::create([
            'user_id' => $user->id,
            'apiary_id' => $apiaryMain->id,
            'apiary' => $apiaryMain->name,
            'name' => 'Ruche Gamma',
            'latitude' => 49.091527,
            'longitude' => 3.287699,
            'status' => 'active',
            'notes' => 'Nouvelle colonie en observation.',
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
                'hive_id' => $hiveC->id,
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
            [
                'hive_id' => $hiveC->id,
                'type' => 'controle',
                'description' => 'Verification des cadres de rive.',
                'performed_at' => CarbonImmutable::parse('2026-02-09 11:30:00', 'UTC'),
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

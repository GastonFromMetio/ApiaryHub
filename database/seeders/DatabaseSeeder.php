<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('SEED_ADMIN_EMAIL', 'admin@apiaryhub.local')],
            [
                'name' => env('SEED_ADMIN_NAME', 'ApiaryHub Admin'),
                'password' => env('SEED_ADMIN_PASSWORD', 'password123'),
                'email_verified_at' => now(),
                'is_admin' => true,
                'remember_token' => Str::random(10),
            ]
        );
    }
}

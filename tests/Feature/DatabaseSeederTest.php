<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_only_the_admin_account(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', 1);

        $admin = User::query()->sole();

        $this->assertSame('ApiaryHub Admin', $admin->name);
        $this->assertSame('admin@apiaryhub.local', $admin->email);
        $this->assertTrue($admin->is_admin);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertTrue(Hash::check('password123', $admin->password));
    }

    public function test_database_seeder_is_idempotent(): void
    {
        $this->seed();
        $this->seed();

        $this->assertDatabaseCount('users', 1);
        $this->assertTrue(User::query()->sole()->is_admin);
    }
}

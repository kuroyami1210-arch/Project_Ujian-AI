<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Demo',
                'password' => 'password',
                'role' => UserRole::Admin,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        User::firstOrCreate(
            ['email' => 'guru@example.com'],
            [
                'name' => 'Guru Demo',
                'password' => 'password',
                'role' => UserRole::Guru,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        User::firstOrCreate(
            ['email' => 'siswa@example.com'],
            [
                'name' => 'Siswa Demo',
                'password' => 'password',
                'role' => UserRole::Siswa,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        $this->call(ExamSeeder::class);
    }
}

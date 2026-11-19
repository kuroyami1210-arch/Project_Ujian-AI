<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_siswa_is_redirected_to_siswa_dashboard()
    {
        $user = User::factory()->create(['role' => UserRole::Siswa]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect('/siswa');
    }

    public function test_guru_is_redirected_to_guru_dashboard()
    {
        $user = User::factory()->create(['role' => UserRole::Guru]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect('/guru');
    }

    public function test_admin_is_redirected_to_account_management()
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect('/admin/akun');
    }
}

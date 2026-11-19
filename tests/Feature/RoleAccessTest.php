<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\ExamSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => UserRole::Admin]);
    }

    private function siswa(): User
    {
        return User::factory()->create(['role' => UserRole::Siswa]);
    }

    private function guru(): User
    {
        return User::factory()->create(['role' => UserRole::Guru]);
    }

    public function test_siswa_cannot_visit_guru_pages()
    {
        $this->actingAs($this->siswa());

        $this->get('/guru')->assertForbidden();
        $this->get('/guru/rekap')->assertForbidden();
        $this->get('/admin/akun')->assertForbidden();
    }

    public function test_guru_cannot_visit_siswa_pages()
    {
        $this->actingAs($this->guru());

        $this->get('/siswa')->assertForbidden();
        $this->get('/ujian')->assertForbidden();
        $this->get('/hasil')->assertForbidden();
    }

    public function test_guests_are_redirected_to_login()
    {
        $this->get('/guru')->assertRedirect(route('login'));
        $this->get('/siswa')->assertRedirect(route('login'));
        $this->get('/ujian')->assertRedirect(route('login'));
        $this->get('/hasil')->assertRedirect(route('login'));
    }

    public function test_siswa_can_join_exam_with_valid_token()
    {
        $this->seed(ExamSeeder::class);
        $this->actingAs($this->siswa());

        $response = $this->post('/siswa/masuk', ['token' => '483921']);
        $response->assertRedirect('/ujian');
    }

    public function test_siswa_cannot_join_with_invalid_token()
    {
        $this->seed(ExamSeeder::class);
        $this->actingAs($this->siswa());

        $response = $this->post('/siswa/masuk', ['token' => 'SALAH-0000']);
        $response->assertSessionHasErrors('token');
    }

    public function test_submit_is_scored_server_side()
    {
        $this->seed(ExamSeeder::class);
        $siswa = $this->siswa();
        $this->actingAs($siswa);

        $this->post('/siswa/masuk', ['token' => '483921']);

        // Kunci jawaban bank soal: [1, 1, 2, 2, 2] → 3 benar = 60
        $response = $this->post('/ujian/kumpulkan', [
            'answers' => [0 => 1, 1 => 1, 2 => 2, 3 => 0, 4 => 0],
        ]);
        $response->assertRedirect('/hasil');

        $this->assertDatabaseHas('exam_attempts', [
            'user_id' => $siswa->id,
            'score' => 60,
            'correct_count' => 3,
            'wrong_count' => 2,
            'passed' => false,
        ]);
    }

    public function test_guru_cannot_visit_admin_pages()
    {
        $this->actingAs($this->guru());

        $this->get('/admin/akun')->assertForbidden();
    }

    public function test_guru_cannot_create_accounts()
    {
        $this->actingAs($this->guru());

        $response = $this->post('/admin/akun', [
            'name' => 'Guru Ilegal',
            'email' => 'ilegal@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'guru',
        ]);
        $response->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'ilegal@example.com']);
    }

    public function test_admin_can_create_guru_account()
    {
        $this->actingAs($this->admin());

        $response = $this->post('/admin/akun', [
            'name' => 'Guru Baru',
            'email' => 'guru.baru@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'guru',
        ]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'guru.baru@example.com',
            'role' => UserRole::Guru,
        ]);
    }

    public function test_admin_can_create_admin_account()
    {
        $this->actingAs($this->admin());

        $response = $this->post('/admin/akun', [
            'name' => 'Admin Baru',
            'email' => 'admin.baru@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'admin.baru@example.com',
            'role' => UserRole::Admin,
        ]);
    }

    public function test_admin_cannot_create_siswa_account()
    {
        $this->actingAs($this->admin());

        $response = $this->post('/admin/akun', [
            'name' => 'Siswa Ilegal',
            'email' => 'siswa.ilegal@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'siswa',
        ]);
        $response->assertSessionHasErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'siswa.ilegal@example.com']);
    }

    public function test_admin_cannot_delete_themselves()
    {
        $admin = $this->admin();
        $this->actingAs($admin);

        $response = $this->delete("/admin/akun/{$admin->id}");
        $response->assertForbidden();

        $this->assertNotSoftDeleted('users', ['id' => $admin->id]);
    }

    public function test_admin_can_move_account_to_trash()
    {
        $admin = $this->admin();
        $other = $this->admin();
        $this->actingAs($admin);

        $response = $this->delete("/admin/akun/{$other->id}");
        $response->assertRedirect();

        $this->assertSoftDeleted('users', ['id' => $other->id]);
    }

    public function test_inactive_user_is_logged_out()
    {
        $user = User::factory()->create([
            'role' => UserRole::Guru,
            'is_active' => false,
        ]);
        $this->actingAs($user);

        $response = $this->get('/guru');
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_new_registrations_default_to_siswa()
    {
        $response = $this->post('/register', [
            'name' => 'Siswa Pendaftar',
            'email' => 'pendaftar@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'guru',
        ]);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'pendaftar@example.com',
            'role' => UserRole::Siswa,
        ]);
    }
}

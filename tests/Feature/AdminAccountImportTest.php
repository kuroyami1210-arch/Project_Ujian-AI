<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\ExamSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Tests\TestCase;

class AdminAccountImportTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => UserRole::Admin]);
    }

    private function guru(): User
    {
        return User::factory()->create(['role' => UserRole::Guru]);
    }

    private function csv(string $content, string $name = 'data-guru.csv'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, $content);
    }

    /**
     * @param  array<int, array<int, int|string>>  $rows
     */
    private function xlsx(array $rows): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'guru-xlsx-');

        $writer = new XlsxWriter;
        $writer->openToFile($path);

        foreach ($rows as $row) {
            $writer->addRow(Row::fromValues($row));
        }

        $writer->close();

        $file = UploadedFile::fake()->createWithContent(
            'data-guru.xlsx',
            (string) file_get_contents($path),
        );
        unlink($path);

        return $file;
    }

    public function test_admin_bisa_mengimpor_guru_dari_csv(): void
    {
        $this->actingAs($this->admin());

        $csv = implode("\n", [
            'nama,email,tanggal lahir',
            'Budi Santoso,budi.santoso@sekolah.id,17/05/1985',
            'Siti Aminah,siti.aminah@sekolah.id,1990-11-02',
        ]);

        $response = $this->post('/admin/akun/import', ['file' => $this->csv($csv)]);
        $response->assertRedirect();
        $this->assertStringContainsString('2 akun guru', (string) session('status'));

        $budi = User::where('email', 'budi.santoso@sekolah.id')->firstOrFail();
        $this->assertSame(UserRole::Guru, $budi->role);
        $this->assertTrue((bool) $budi->is_active);
        $this->assertNotNull($budi->email_verified_at);
        $this->assertTrue(Hash::check('17051985', $budi->password));

        $siti = User::where('email', 'siti.aminah@sekolah.id')->firstOrFail();
        $this->assertSame('Siti Aminah', $siti->name);
        $this->assertTrue(Hash::check('02111990', $siti->password));
    }

    public function test_import_melewati_baris_bermasalah(): void
    {
        User::factory()->create(['email' => 'sudah@ada.id']);
        $this->actingAs($this->admin());

        $csv = implode("\n", [
            'nama,email,tanggal lahir',
            'Guru Baru,guru.baru@sekolah.id,17/05/1985',
            'Tanpa Email,,17/05/1985',
            'Email Rusak,bukan-email,17/05/1985',
            'Tanggal Rusak,tanggal.rusak@sekolah.id,32/13/2020',
            'Duplikat File,guru.baru@sekolah.id,17/05/1985',
            'Sudah Terdaftar,sudah@ada.id,17/05/1985',
        ]);

        $this->post('/admin/akun/import', ['file' => $this->csv($csv)])
            ->assertRedirect();

        $this->assertSame(1, User::where('email', 'guru.baru@sekolah.id')->count());
        $this->assertDatabaseMissing('users', ['email' => 'bukan-email']);
        $this->assertDatabaseMissing('users', ['email' => 'tanggal.rusak@sekolah.id']);

        $errors = session('import_errors');
        $this->assertCount(5, $errors);
        $this->assertStringContainsString('email tidak valid', $errors[0]);
        $this->assertStringContainsString('email tidak valid', $errors[1]);
        $this->assertStringContainsString('tanggal lahir tidak dikenali', $errors[2]);
        $this->assertStringContainsString('sudah terdaftar', $errors[3]);
        $this->assertStringContainsString('sudah terdaftar', $errors[4]);
        $this->assertStringContainsString('1 akun guru', (string) session('status'));
    }

    public function test_admin_bisa_mengimpor_guru_dari_xlsx(): void
    {
        $this->actingAs($this->admin());

        $serial = (new \DateTime('1985-05-17'))
            ->diff(new \DateTime('1899-12-30'))
            ->days;

        $file = $this->xlsx([
            ['nama', 'email', 'tanggal lahir'],
            ['Rina Wijaya', 'rina.wijaya@sekolah.id', '17/05/1985'],
            ['Guru Serial', 'guru.serial@sekolah.id', $serial],
        ]);

        $this->post('/admin/akun/import', ['file' => $file])
            ->assertRedirect();

        $rina = User::where('email', 'rina.wijaya@sekolah.id')->firstOrFail();
        $this->assertSame(UserRole::Guru, $rina->role);
        $this->assertTrue(Hash::check('17051985', $rina->password));

        // Sel Excel (angka) juga dibaca: serial → 17/05/1985 → 17051985.
        $serialUser = User::where('email', 'guru.serial@sekolah.id')->firstOrFail();
        $this->assertTrue(Hash::check('17051985', $serialUser->password));
    }

    public function test_import_menolak_file_dengan_kolom_salah(): void
    {
        $this->actingAs($this->admin());

        $csv = "no,nama lengkap\n1,Budi\n";
        $response = $this->post('/admin/akun/import', ['file' => $this->csv($csv)]);

        $response->assertSessionHasErrors('file');
        $this->assertStringContainsString(
            'Format file tidak sesuai',
            (string) session('errors')->first('file'),
        );
        $this->assertSame(0, User::where('role', UserRole::Guru)->count());
    }

    public function test_import_menolak_format_file_lain(): void
    {
        $this->actingAs($this->admin());

        $file = UploadedFile::fake()->createWithContent('berkas.php', '<?php echo 1;');

        $this->post('/admin/akun/import', ['file' => $file])
            ->assertSessionHasErrors('file');
    }

    public function test_guru_tidak_bisa_mengimpor_akun(): void
    {
        $this->actingAs($this->guru());

        $csv = "nama,email,tanggal lahir\nBudi,budi@sekolah.id,17/05/1985\n";
        $this->post('/admin/akun/import', ['file' => $this->csv($csv)])
            ->assertForbidden();

        $this->assertSame(1, User::where('role', UserRole::Guru)->count());
    }

    public function test_template_csv_bisa_diunduh(): void
    {
        $this->actingAs($this->admin());

        $response = $this->get('/admin/akun/template/csv');
        $response->assertOk()->assertDownload('template-data-guru.csv');
        $this->assertStringContainsString(
            'nama,email,tanggal lahir',
            $response->streamedContent(),
        );
    }

    public function test_template_xlsx_bisa_diunduh(): void
    {
        $this->actingAs($this->admin());

        $response = $this->get('/admin/akun/template/xlsx');
        $response->assertOk()->assertDownload('template-data-guru.xlsx');
        $this->assertStringStartsWith('PK', $response->streamedContent());
    }

    public function test_guru_tidak_bisa_unduh_template(): void
    {
        $this->actingAs($this->guru());

        $this->get('/admin/akun/template/csv')->assertForbidden();
    }

    public function test_akun_yang_dihapus_masuk_daftar_sampah(): void
    {
        $admin = $this->admin();
        $target = $this->guru();
        $this->actingAs($admin);

        $this->delete("/admin/akun/{$target->id}")->assertRedirect();
        $this->assertSoftDeleted('users', ['id' => $target->id]);

        $this->get('/admin/akun')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/akun')
                ->where('accounts.0.id', $admin->id)
                ->where('trashed.0.id', $target->id));
    }

    public function test_hapus_massal_memindahkan_banyak_akun_ke_sampah(): void
    {
        $admin = $this->admin();
        $a = $this->guru();
        $b = $this->guru();
        $this->actingAs($admin);

        $this->post('/admin/akun/hapus-massal', [
            'ids' => [$a->id, $b->id, $admin->id],
        ])->assertRedirect();

        $this->assertSoftDeleted('users', ['id' => $a->id]);
        $this->assertSoftDeleted('users', ['id' => $b->id]);
        $this->assertNotSoftDeleted('users', ['id' => $admin->id]);
    }

    public function test_hapus_massal_wajib_mengisi_ids(): void
    {
        $this->actingAs($this->admin());

        $this->post('/admin/akun/hapus-massal', [])
            ->assertSessionHasErrors('ids');
    }

    public function test_akun_bisa_dipulihkan_dari_sampah(): void
    {
        $admin = $this->admin();
        $target = $this->guru();
        $target->delete();
        $this->actingAs($admin);

        $this->patch("/admin/akun/{$target->id}/pulihkan")->assertRedirect();

        $this->assertNotSoftDeleted('users', ['id' => $target->id]);
        $this->get('/admin/akun')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('accounts.1.id', $target->id)
                ->where('trashed', []));
    }

    public function test_akun_tanpa_ujian_bisa_dihapus_permanen(): void
    {
        $admin = $this->admin();
        $target = $this->guru();
        $target->delete();
        $this->actingAs($admin);

        $this->delete("/admin/akun/{$target->id}/permanen")->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_penghapusan_permanen_diblokir_bila_masih_punya_ujian(): void
    {
        $target = $this->guru();
        $admin = $this->admin();
        $this->seed(ExamSeeder::class);
        $target->delete();
        $this->actingAs($admin);

        $this->delete("/admin/akun/{$target->id}/permanen")
            ->assertSessionHasErrors('trashed');

        $this->assertDatabaseHas('users', ['id' => $target->id]);
        $this->assertDatabaseHas('exams', ['guru_id' => $target->id]);
    }

    public function test_guru_tidak_bisa_mengelola_sampah(): void
    {
        $guru = $this->guru();
        $target = $this->guru();
        $this->actingAs($guru);

        $this->delete("/admin/akun/{$target->id}")->assertForbidden();
        $this->post('/admin/akun/hapus-massal', ['ids' => [$target->id]])->assertForbidden();
    }

    public function test_rute_status_akun_sudah_dihapus(): void
    {
        $admin = $this->admin();
        $other = $this->admin();
        $this->actingAs($admin);

        $this->patch("/admin/akun/{$other->id}/status")->assertNotFound();
        $this->assertNotSoftDeleted('users', ['id' => $other->id]);
        $this->assertTrue((bool) $other->fresh()->is_active);
    }
}

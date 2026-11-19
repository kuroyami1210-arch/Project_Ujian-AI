<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuruExamFlowTest extends TestCase
{
    use RefreshDatabase;

    private function guru(): User
    {
        return User::factory()->create(['role' => UserRole::Guru]);
    }

    /**
     * @param  array<string, mixed>  $override
     * @return array<string, mixed>
     */
    private function payload(array $override = []): array
    {
        return array_merge([
            'topic' => 'Penerapan Hukum Newton dalam kehidupan sehari-hari',
            'grade_level' => 'Kelas 10 SMA',
            'question_quantities' => [
                'Pilihan Ganda' => 4,
                'Benar Salah' => 2,
            ],
        ], $override);
    }

    public function test_generate_soal_diarahkan_ke_halaman_edit()
    {
        $this->actingAs($this->guru());

        $response = $this->post('/guru/soal', $this->payload());

        $exam = Exam::firstOrFail();
        $response->assertRedirect(route('guru.exams.edit', $exam));

        $this->assertMatchesRegularExpression('/^\d{6}$/', $exam->token);
        $this->assertSame(6, $exam->questions()->count());
        $this->assertSame(6, $exam->jumlah_soal);
        $this->assertSame(
            ['Pilihan Ganda', 'Benar Salah'],
            $exam->question_types,
        );
        $this->assertSame(
            4,
            $exam->questions()->where('type', 'Pilihan Ganda')->count(),
        );
        $this->assertSame(
            2,
            $exam->questions()->where('type', 'Benar Salah')->count(),
        );
    }

    public function test_tipe_soal_wajib_dipilih()
    {
        $this->actingAs($this->guru());

        $response = $this->post(
            '/guru/soal',
            $this->payload(['question_quantities' => []]),
        );

        $response->assertSessionHasErrors('question_quantities');
        $this->assertSame(0, Exam::count());
    }

    public function test_jumlah_soal_per_tipe_dibatasi()
    {
        $this->actingAs($this->guru());

        $response = $this->post(
            '/guru/soal',
            $this->payload(['question_quantities' => ['Pilihan Ganda' => 0]]),
        );

        $response->assertSessionHasErrors('question_quantities.Pilihan Ganda');

        $response = $this->post(
            '/guru/soal',
            $this->payload([
                'question_quantities' => ['Pilihan Ganda' => 51],
            ]),
        );

        $response->assertSessionHasErrors('question_quantities.Pilihan Ganda');
    }

    public function test_guru_bisa_mengedit_soal_per_kartu()
    {
        $this->actingAs($this->guru());

        $this->post('/guru/soal', $this->payload());
        $exam = Exam::firstOrFail();
        $question = $exam->questions()->where('type', 'Pilihan Ganda')->firstOrFail();

        $this->put("/guru/soal/{$exam->id}/{$question->id}", [
            'type' => 'Pilihan Ganda Kompleks',
            'question' => 'Pilih semua pernyataan yang benar tentang Hukum Newton!',
            'options' => ['Pernyataan A', 'Pernyataan B', 'Pernyataan C'],
            'correct_answers' => [0, 2],
        ])->assertSessionHas('status');

        $fresh = $question->fresh();
        $this->assertSame('Pilihan Ganda Kompleks', $fresh->type);
        $this->assertSame([0, 2], $fresh->correctIndexes());
        $this->assertSame(['Pernyataan A', 'Pernyataan B', 'Pernyataan C'], $fresh->options);
        // Ringkasan ujian ikut menyesuaikan (1 kompleks + 3 PG + 2 BS).
        $this->assertSame(
            ['Pilihan Ganda Kompleks', 'Pilihan Ganda', 'Benar Salah'],
            $exam->fresh()->question_types,
        );
    }

    public function test_ubah_soal_menjadi_uraian_tanpa_opsi()
    {
        $this->actingAs($this->guru());

        $this->post('/guru/soal', $this->payload());
        $exam = Exam::firstOrFail();
        $question = $exam->questions()->firstOrFail();

        $this->put("/guru/soal/{$exam->id}/{$question->id}", [
            'type' => 'Uraian',
            'question' => 'Jelaskan secara singkat mengapa benda memiliki gaya inersia.',
            'options' => [],
            'correct_answers' => [],
        ])->assertSessionHas('status');

        $fresh = $question->fresh();
        $this->assertSame('Uraian', $fresh->type);
        $this->assertSame([], $fresh->options);
        $this->assertSame([], $fresh->correctIndexes());
        $this->assertSame([], $fresh->correct_answers);
    }

    public function test_edit_soal_wajib_punya_kunci_jawaban()
    {
        $this->actingAs($this->guru());

        $this->post('/guru/soal', $this->payload());
        $exam = Exam::firstOrFail();
        $question = $exam->questions()->firstOrFail();

        $this->put("/guru/soal/{$exam->id}/{$question->id}", [
            'type' => 'Pilihan Ganda',
            'question' => 'Pertanyaan tanpa kunci jawaban yang benar?',
            'options' => ['Opsi A', 'Opsi B'],
            'correct_answers' => [5],
        ])->assertSessionHasErrors('correct_answers');
    }

    public function test_guru_bisa_mengatur_durasi()
    {
        $this->actingAs($this->guru());

        $this->post('/guru/soal', $this->payload(['duration_minutes' => 45]))
            ->assertSessionHasNoErrors();

        $this->assertSame(45, Exam::firstOrFail()->duration_minutes);

        $this->post('/guru/soal', $this->payload(['duration_minutes' => 3]))
            ->assertSessionHasErrors('duration_minutes');

        $this->assertSame(1, Exam::count());
    }

    public function test_halaman_generate_soal_bisa_dibuka()
    {
        $this->actingAs($this->guru());

        $this->get('/guru/generate')->assertOk();
    }

    public function test_halaman_edit_dan_kode_hanya_untuk_pemilik()
    {
        $owner = $this->guru();
        $other = $this->guru();
        $this->actingAs($owner);

        $this->post('/guru/soal', $this->payload());
        $exam = Exam::firstOrFail();

        $this->get(route('guru.exams.edit', $exam))->assertOk();
        $this->get(route('guru.exams.code', $exam))->assertOk();

        $this->actingAs($other);
        $this->get(route('guru.exams.edit', $exam))->assertForbidden();
        $this->get(route('guru.exams.code', $exam))->assertForbidden();
    }
}

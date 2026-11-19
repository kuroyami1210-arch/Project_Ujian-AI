<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportGuruRequest;
use App\Http\Requests\Admin\ResetAccountPasswordRequest;
use App\Http\Requests\Admin\StoreAccountRequest;
use App\Models\User;
use App\Support\GuruAccountImporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = User::whereIn('role', [UserRole::Admin, UserRole::Guru])
            ->orderBy('role')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $trashed = User::onlyTrashed()
            ->whereIn('role', [UserRole::Admin, UserRole::Guru])
            ->orderBy('deleted_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'deleted_at']);

        return Inertia::render('admin/akun', [
            'accounts' => $accounts,
            'trashed' => $trashed,
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $role = UserRole::from($validated['role']);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $role,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return back()->with('status', "Akun {$role->label()} {$validated['email']} berhasil dibuat.");
    }

    /**
     * Buat akun guru massal dari file CSV/XLSX (kolom: nama, email, tanggal lahir).
     * Password tiap akun = tanggal lahir format DDMMYYYY.
     */
    public function import(ImportGuruRequest $request): RedirectResponse
    {
        try {
            $result = GuruAccountImporter::import($request->file('file'));
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['file' => $e->getMessage()]);
        }

        $status = "Berhasil membuat {$result['created']} akun guru.";

        if ($result['skipped'] !== []) {
            $status .= ' '.count($result['skipped']).' baris dilewati.';
        }

        return back()->with([
            'status' => $status,
            'import_errors' => $result['skipped'],
        ]);
    }

    /**
     * Unduh template file data guru.
     */
    public function template(string $format): BaseResponse
    {
        $rows = [
            ['nama', 'email', 'tanggal lahir'],
            ['Budi Santoso', 'budi.santoso@sekolah.id', '17/05/1985'],
            ['Siti Aminah', 'siti.aminah@sekolah.id', '02/11/1990'],
        ];

        if ($format === 'xlsx') {
            $path = tempnam(sys_get_temp_dir(), 'template-guru-');

            $writer = new XlsxWriter;
            $writer->openToFile($path);

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues($row));
            }

            $writer->close();

            return response()
                ->download($path, 'template-data-guru.xlsx')
                ->deleteFileAfterSend(true);
        }

        $lines = array_map(
            fn (array $row) => implode(',', $row),
            $rows,
        );

        return response()
            ->streamDownload(
                fn () => print (implode("\n", $lines)."\n"),
                'template-data-guru.csv',
                ['Content-Type' => 'text/csv; charset=UTF-8'],
            );
    }

    /**
     * Pindahkan akun ke sampah (soft delete) — bisa dipulihkan.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeManageable($user);
        abort_if($user->id === request()->user()->id, 403, 'Tidak dapat menghapus akun sendiri.');

        $user->delete();

        return back()->with('status', "Akun {$user->email} dipindahkan ke sampah.");
    }

    /**
     * Hapus massal (soft delete) banyak akun sekaligus.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
        ], [], ['ids' => 'pilihan akun']);

        $users = User::whereIn('id', $validated['ids'])
            ->whereIn('role', [UserRole::Admin, UserRole::Guru])
            ->whereKeyNot(request()->user()->id)
            ->get();

        $count = $users->count();
        $users->each->delete();

        return back()->with('status', "{$count} akun dipindahkan ke sampah.");
    }

    /**
     * Pulihkan akun dari sampah.
     */
    public function restore(User $user): RedirectResponse
    {
        $this->authorizeManageable($user);

        $user->restore();

        return back()->with('status', "Akun {$user->email} dipulihkan dari sampah.");
    }

    /**
     * Hapus permanen — data ujian ikut terhapus (FK cascade), jadi diblokir bila masih ada.
     */
    public function forceDestroy(User $user): RedirectResponse
    {
        $this->authorizeManageable($user);

        if ($user->exams()->exists()) {
            return back()->withErrors([
                'trashed' => "Akun {$user->email} masih punya data ujian. Hapus ujiannya dulu sebelum menghapus permanen.",
            ]);
        }

        $user->forceDelete();

        return back()->with('status', "Akun {$user->email} dihapus permanen.");
    }

    public function resetPassword(ResetAccountPasswordRequest $request, User $user): RedirectResponse
    {
        $this->authorizeManageable($user);

        $user->update(['password' => $request->validated()['password']]);

        return back()->with('status', "Password {$user->email} berhasil direset.");
    }

    private function authorizeManageable(User $user): void
    {
        abort_unless(in_array($user->role, [UserRole::Admin, UserRole::Guru], true), 403);
    }
}

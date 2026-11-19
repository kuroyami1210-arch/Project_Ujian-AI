<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;

/**
 * Salin data guru dari file CSV/XLSX menjadi akun login (role Guru).
 *
 * Kolom wajib: nama, email, tanggal lahir.
 * Password akun = tanggal lahir dalam format DDMMYYYY (contoh: 17/05/1985 → 17051985).
 */
class GuruAccountImporter
{
    /**
     * @return array{created: int, skipped: array<int, string>}
     */
    public static function import(UploadedFile $file): array
    {
        $rows = self::rows($file);
        $header = array_map(
            [self::class, 'normalize'],
            array_values(array_shift($rows) ?? []),
        );
        $columns = self::columnMap($header);

        $created = 0;
        $skipped = [];
        $seen = [];

        foreach (array_values($rows) as $i => $row) {
            $excelRow = $i + 2; // baris 1 = header
            $cells = array_map(
                fn ($cell) => is_string($cell) ? trim($cell) : $cell,
                array_values($row),
            );

            if (self::isEmptyRow($cells)) {
                continue;
            }

            $name = self::text($cells[$columns['nama']] ?? null);
            $email = mb_strtolower(self::text($cells[$columns['email']] ?? null));
            $dob = self::parseDob($cells[$columns['tanggal_lahir']] ?? null);

            if ($name === '') {
                $skipped[] = "Baris {$excelRow}: nama kosong.";

                continue;
            }

            if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
                $skipped[] = "Baris {$excelRow}: email tidak valid.".($email !== '' ? " ({$email})" : '');

                continue;
            }

            if ($dob === null) {
                $skipped[] = "Baris {$excelRow}: tanggal lahir tidak dikenali (pakai format 17/05/1985).";

                continue;
            }

            if (isset($seen[$email]) || User::where('email', $email)->exists()) {
                $skipped[] = "Baris {$excelRow}: email {$email} sudah terdaftar.";

                continue;
            }

            User::create([
                'name' => $name,
                'email' => $email,
                'password' => $dob, // cast 'hashed' meng-hash otomatis
                'role' => UserRole::Guru,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $seen[$email] = true;
            $created++;
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    private static function rows(UploadedFile $file): array
    {
        return str_ends_with(strtolower($file->getClientOriginalName()), '.xlsx')
            ? self::xlsxRows($file)
            : self::csvRows($file);
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    private static function csvRows(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            throw new InvalidArgumentException('File tidak bisa dibaca.');
        }

        // Excel berbahasa Indonesia memakai ';' sebagai pemisah kolom.
        $first = (string) fgets($handle);
        $delimiter = substr_count($first, ';') > substr_count($first, ',') ? ';' : ',';
        rewind($handle);

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter, '"', '\\')) !== false) {
            $rows[] = array_map(
                fn ($cell) => is_string($cell) ? self::clean($cell) : '',
                array_pad($row, 3, ''),
            );
        }

        fclose($handle);

        return $rows;
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    private static function xlsxRows(UploadedFile $file): array
    {
        $reader = new XlsxReader;
        $reader->open($file->getRealPath());

        $rows = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $rows[] = array_pad($row->toArray(), 3, '');
            }

            break; // hanya lembar pertama
        }

        $reader->close();

        return $rows;
    }

    /**
     * Petakan nama kolom ke indeks. Mendukung variasi penulisan header.
     *
     * @param  array<int, string>  $header
     * @return array{nama: int, email: int, tanggal_lahir: int}
     */
    private static function columnMap(array $header): array
    {
        $aliases = [
            'nama' => ['nama', 'name'],
            'email' => ['email', 'e-mail', 'surel'],
            'tanggal_lahir' => [
                'tanggal lahir',
                'tgl lahir',
                'ttl',
                'dob',
                'date of birth',
            ],
        ];

        $map = ['nama' => null, 'email' => null, 'tanggal_lahir' => null];

        foreach ($header as $i => $label) {
            foreach (array_keys($map) as $key) {
                if ($map[$key] === null && in_array($label, $aliases[$key], true)) {
                    $map[$key] = $i;
                }
            }
        }

        $missing = array_keys(array_filter($map, fn ($index) => $index === null));

        if ($missing !== []) {
            throw new InvalidArgumentException(
                'Format file tidak sesuai — kolom wajib tidak ditemukan: '
                .implode(', ', $missing).'. Gunakan header: nama, email, tanggal lahir.',
            );
        }

        return $map;
    }

    /**
     * Ubah tanggal lahir apa pun menjadi password DDMMYYYY.
     */
    private static function parseDob(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->format('dmY');
        }

        // Sel Excel tersimpan sebagai angka (serial sejak 1899-12-30).
        if (is_int($value) || is_float($value)) {
            $serial = (int) round($value);

            if ($serial < 1 || $serial > 80000) {
                return null;
            }

            $date = (new Carbon('1899-12-30'))->addDays($serial);

            return self::plausibleYear($date) ? $date->format('dmY') : null;
        }

        $text = self::text($value);

        if ($text === '') {
            return null;
        }

        foreach (['d/m/Y', 'd-m-Y', 'd.m.Y', 'Y-m-d', 'j F Y', 'd M Y'] as $format) {
            try {
                $date = Carbon::createFromFormat($format, $text);
            } catch (\Throwable) {
                continue;
            }

            if ($date instanceof Carbon && $date->format($format) === $text && self::plausibleYear($date)) {
                return $date->format('dmY');
            }
        }

        return null;
    }

    private static function plausibleYear(Carbon $date): bool
    {
        $year = (int) $date->format('Y');

        return $year >= 1900 && $year <= 2100;
    }

    /**
     * @param  array<int, mixed>  $cells
     */
    private static function isEmptyRow(array $cells): bool
    {
        foreach ($cells as $cell) {
            if (self::text($cell) !== '') {
                return false;
            }
        }

        return true;
    }

    private static function text(mixed $value): string
    {
        return is_string($value) || is_numeric($value) ? trim((string) $value) : '';
    }

    private static function normalize(mixed $label): string
    {
        $label = self::clean(self::text($label));
        $label = mb_strtolower($label);
        $label = str_replace(['_', '-'], ' ', $label);

        return trim(preg_replace('/\s+/', ' ', $label) ?? $label);
    }

    private static function clean(string $value): string
    {
        if (str_starts_with($value, "\xEF\xBB\xBF")) {
            $value = substr($value, 3);
        }

        return trim($value);
    }
}

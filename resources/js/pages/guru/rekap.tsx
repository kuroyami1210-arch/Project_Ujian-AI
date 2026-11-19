import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import {
    btn,
    card,
    ExamFonts,
    fontBody,
    fontDisplay,
} from '@/components/exam/ui';
import type { BreadcrumbItem } from '@/types';

type ExamOption = {
    id: number;
    title: string;
    token: string;
    status: string;
    attempts_count?: number;
    created_at: string;
};

type ScoreRow = {
    no: number;
    nama: string;
    kelas: string;
    benar: number;
    salah: number;
    nilai: number;
    status: string;
};

type Props = {
    exams: ExamOption[];
    selectedExam: ExamOption | null;
    rows: ScoreRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rekap Nilai',
        href: '/guru/rekap',
    },
];

function PassChip({ passed, label }: { passed: boolean; label: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                passed
                    ? 'bg-[#E4F7F0] text-[#07694A]'
                    : 'bg-[#FDEAEF] text-[#9C1B3C]'
            }`}
        >
            {label}
        </span>
    );
}

function ScoreBar({ value, passed }: { value: number; passed: boolean }) {
    const w = Math.max(0, Math.min(100, value));
    return (
        <div className="flex items-center gap-3">
            <div
                className="h-2.5 w-24 overflow-hidden rounded-full bg-[#F1ECFF]"
                aria-hidden="true"
            >
                <div
                    className={`h-full rounded-full ${passed ? 'bg-[#0E9F72]' : 'bg-[#D8325A]'}`}
                    style={{ width: `${w}%` }}
                />
            </div>
            <span
                className={`${fontDisplay} w-9 text-lg font-extrabold tabular-nums`}
            >
                {value}
            </span>
        </div>
    );
}

export default function Rekap({ exams, selectedExam, rows }: Props) {
    const { status } = usePage().props;

    const handleSelect = (examId: string) => {
        if (!examId) return;
        router.get('/guru/rekap', { exam_id: examId }, { preserveState: true });
    };

    const count = rows.length;
    const avg = count
        ? Math.round((rows.reduce((s, r) => s + r.nilai, 0) / count) * 10) / 10
        : 0;
    const top = count ? Math.max(...rows.map((r) => r.nilai)) : 0;
    const low = count ? Math.min(...rows.map((r) => r.nilai)) : 0;
    const passedCount = rows.filter((r) => r.status === 'Lulus').length;

    const tiles = [
        { label: 'Peserta', value: count, tone: 'bg-[#F1ECFF] text-[#5B34E6]' },
        { label: 'Rata-rata', value: avg, tone: 'bg-[#E8F2FD] text-[#1E7FE0]' },
        { label: 'Tertinggi', value: top, tone: 'bg-[#E4F7F0] text-[#07694A]' },
        { label: 'Terendah', value: low, tone: 'bg-[#FDEAEF] text-[#9C1B3C]' },
        {
            label: 'Lulus',
            value: count ? `${Math.round((passedCount / count) * 100)}%` : '—',
            tone: 'bg-[#FFF3CC] text-[#7A5600]',
        },
    ];

    return (
        <>
            <Head title="Rekap Nilai" />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-screen bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <div className="mx-auto max-w-[1180px] space-y-6 px-4 py-6 md:px-8 md:py-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <Link
                                href="/guru"
                                className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#5B34E6] hover:underline"
                            >
                                <ArrowLeft className="size-4" />
                                Dashboard guru
                            </Link>
                            <h1
                                className={`${fontDisplay} text-3xl font-extrabold tracking-tight md:text-4xl`}
                            >
                                Rekap nilai siswa
                            </h1>
                            <p className="mt-1 text-[15px] text-[#6B6590]">
                                Hasil ujian per sesi, bisa diekspor ke Excel
                                (CSV).
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {exams.length > 1 && (
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="exam-select"
                                        className="text-[13px] font-bold text-[#4A4170]"
                                    >
                                        Sesi ujian
                                    </label>
                                    <select
                                        id="exam-select"
                                        value={selectedExam?.id ?? ''}
                                        onChange={(e) =>
                                            handleSelect(e.target.value)
                                        }
                                        className="h-12 min-w-64 rounded-2xl border-2 border-[#DDD4FF] bg-white px-4 text-sm font-semibold outline-none focus:border-[#5B34E6] focus:ring-4 focus:ring-[#5B34E6]/15"
                                    >
                                        {exams.map((exam) => (
                                            <option
                                                key={exam.id}
                                                value={exam.id}
                                            >
                                                {exam.title} — {exam.token} (
                                                {exam.attempts_count ?? 0}{' '}
                                                jawaban)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {selectedExam && rows.length > 0 && (
                                <a
                                    href={`/guru/rekap/export?exam_id=${selectedExam.id}`}
                                    className={`${btn.mint} h-12 whitespace-nowrap sm:mt-6`}
                                >
                                    <FileSpreadsheet className="size-4" />
                                    <span>Export Excel</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {typeof status === 'string' && status && (
                        <div
                            role="status"
                            className="rounded-2xl bg-[#E4F7F0] px-4 py-3 text-sm font-semibold text-[#07694A]"
                        >
                            {status}
                        </div>
                    )}

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {tiles.map((t) => (
                            <div key={t.label} className={`${card} p-4`}>
                                <dt className="text-[13px] font-bold text-[#6B6590]">
                                    {t.label}
                                </dt>
                                <dd
                                    className={`${fontDisplay} mt-1 inline-block rounded-xl px-2.5 py-0.5 text-3xl font-extrabold tabular-nums ${t.tone}`}
                                >
                                    {t.value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <section className={`${card} overflow-hidden`}>
                        <div className="flex items-center justify-between gap-3 px-6 py-5">
                            <h2
                                className={`${fontDisplay} text-xl font-extrabold`}
                            >
                                Daftar nilai
                            </h2>
                            {selectedExam && (
                                <p className="text-sm text-[#6B6590]">
                                    Kode{' '}
                                    <span
                                        className={`${fontDisplay} font-extrabold tracking-wider text-[#1B1340]`}
                                    >
                                        {selectedExam.token}
                                    </span>
                                </p>
                            )}
                        </div>

                        {rows.length === 0 ? (
                            <div className="border-t-2 border-[#F1ECFF] px-6 py-14 text-center">
                                <p className="font-bold">
                                    Belum ada jawaban masuk
                                </p>
                                <p className="mt-1 text-sm text-[#6B6590]">
                                    Nilai siswa muncul di sini setelah mereka
                                    mengumpulkan ujian.
                                </p>
                            </div>
                        ) : (
                            <>
                                <table className="hidden w-full text-left text-sm md:table">
                                    <thead className="border-y-2 border-[#F1ECFF] bg-[#FAF8FF] text-[13px] font-bold text-[#6B6590]">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="w-16 px-6 py-3"
                                            >
                                                No
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3"
                                            >
                                                Nama
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3"
                                            >
                                                Kelas
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-center"
                                            >
                                                Benar
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-center"
                                            >
                                                Salah
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3"
                                            >
                                                Nilai
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right"
                                            >
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-[#F1ECFF]">
                                        {rows.map((r) => {
                                            const passed = r.status === 'Lulus';
                                            return (
                                                <tr
                                                    key={r.no}
                                                    className="transition hover:bg-[#FAF8FF]"
                                                >
                                                    <td className="px-6 py-3 text-[#6B6590] tabular-nums">
                                                        {r.no}
                                                    </td>
                                                    <td className="px-3 py-3 font-bold whitespace-nowrap">
                                                        {r.nama}
                                                    </td>
                                                    <td className="px-3 py-3 text-[#4A4170]">
                                                        {r.kelas}
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-semibold text-[#3A1FB0] tabular-nums">
                                                        {r.benar}
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-semibold text-[#9C1B3C] tabular-nums">
                                                        {r.salah}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <ScoreBar
                                                            value={r.nilai}
                                                            passed={passed}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <PassChip
                                                            passed={passed}
                                                            label={r.status}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <ul className="divide-y-2 divide-[#F1ECFF] border-t-2 border-[#F1ECFF] md:hidden">
                                    {rows.map((r) => {
                                        const passed = r.status === 'Lulus';
                                        return (
                                            <li
                                                key={r.no}
                                                className="flex items-center gap-3 p-4"
                                            >
                                                <span
                                                    className={`${fontDisplay} grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold tabular-nums ${passed ? 'bg-[#E4F7F0] text-[#07694A]' : 'bg-[#FDEAEF] text-[#9C1B3C]'}`}
                                                >
                                                    {r.nilai}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-bold">
                                                        {r.no}. {r.nama}
                                                    </p>
                                                    <p className="text-[13px] text-[#6B6590]">
                                                        {r.kelas} · {r.benar}{' '}
                                                        benar · {r.salah} salah
                                                    </p>
                                                </div>
                                                <PassChip
                                                    passed={passed}
                                                    label={r.status}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

Rekap.layout = {
    breadcrumbs,
};

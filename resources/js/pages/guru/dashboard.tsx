import { Head, Link, usePage } from '@inertiajs/react';
import { ClipboardList, Clock, Sparkles, Trophy, Users } from 'lucide-react';
import {
    btn,
    card,
    ExamFonts,
    fontBody,
    fontDisplay,
} from '@/components/exam/ui';
import type { BreadcrumbItem } from '@/types';

type ExamSummary = {
    id: number;
    title: string;
    token: string;
    status: string;
    grade_level: string;
    duration_minutes: number;
    questions_count?: number;
    attempts_count?: number;
    created_at: string;
};

type Props = {
    activeExam: ExamSummary | null;
    recentExams: ExamSummary[];
    stats: {
        totalExams: number;
        totalAttempts: number;
        avgScore: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Guru',
        href: '/guru',
    },
];

function StatusChip({ status }: { status: string }) {
    if (status === 'active') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4F7F0] px-3 py-1 text-xs font-bold text-[#07694A]">
                <span className="size-1.5 rounded-full bg-[#0E9F72]" />
                Aktif
            </span>
        );
    }
    if (status === 'draft') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3CC] px-3 py-1 text-xs font-bold text-[#7A5600]">
                <span className="size-1.5 rounded-full bg-[#E0A100]" />
                Draf
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEEAF8] px-3 py-1 text-xs font-bold text-[#5A5280]">
            <span className="size-1.5 rounded-full bg-[#9A92BD]" />
            Ditutup
        </span>
    );
}

export default function GuruDashboard({ recentExams, stats }: Props) {
    const { status, auth } = usePage().props as {
        status?: unknown;
        auth?: { user?: { name?: string } };
    };
    const firstName = auth?.user?.name?.trim().split(/\s+/)[0] ?? '';

    const statTiles = [
        {
            label: 'Total sesi',
            value: stats.totalExams,
            Icon: ClipboardList,
            chip: 'bg-[#F1ECFF] text-[#5B34E6]',
        },
        {
            label: 'Jawaban masuk',
            value: stats.totalAttempts,
            Icon: Users,
            chip: 'bg-[#E8F2FD] text-[#1E7FE0]',
        },
        {
            label: 'Rata-rata nilai',
            value: stats.avgScore,
            Icon: Trophy,
            chip: 'bg-[#FFF3CC] text-[#7A5600]',
        },
    ];

    return (
        <>
            <Head title="Dashboard Guru" />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-screen bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <div className="mx-auto max-w-none space-y-6 px-4 py-6 md:px-8 md:py-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1
                                className={`${fontDisplay} text-3xl font-extrabold tracking-tight md:text-4xl`}
                            >
                                {firstName
                                    ? `Halo, ${firstName}`
                                    : 'Dashboard Guru'}
                            </h1>
                            <p className="mt-1 text-[15px] text-[#6B6590]">
                                Pantau sesi ujian dan jawaban siswa, atau mulai
                                generate soal baru.
                            </p>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-[#5B34E6] shadow-[inset_0_0_0_2px_#DDD4FF]">
                            <span className="size-2 rounded-full bg-[#5B34E6]" />
                            Paket sekolah terverifikasi
                        </span>
                    </div>

                    {typeof status === 'string' && status && (
                        <div
                            role="status"
                            className="rounded-2xl bg-[#E4F7F0] px-4 py-3 text-sm font-semibold text-[#07694A]"
                        >
                            {status}
                        </div>
                    )}

                    {/* Pintu ke halaman generate soal */}
                    <section className="relative overflow-hidden rounded-[2rem] bg-[#5B34E6] p-6 text-white shadow-[0_6px_0_0_#07694A] md:p-8">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-12 -right-10 size-44 rotate-12 rounded-[3rem] bg-[#6B46F0]"
                        />
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute top-24 -right-3 size-9 rounded-full bg-[#FFC933]"
                        />
                        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2
                                    className={`${fontDisplay} max-w-xl text-[1.75rem] leading-[1.1] font-extrabold md:text-4xl`}
                                >
                                    Tulis topiknya, AI yang menyusun soalnya.
                                </h2>
                                <p className="mt-2 max-w-lg text-sm text-white/80">
                                    Atur tipe, jumlah soal, dan durasi ujian di
                                    halaman generate soal, lalu bagikan kode 6
                                    angka ke siswa.
                                </p>
                            </div>
                            <Link
                                href="/guru/generate"
                                className={`${btn.sun} h-12 shrink-0 px-6 text-base`}
                            >
                                <Sparkles className="size-5" />
                                <span>Buka Generate Soal</span>
                            </Link>
                        </div>
                    </section>

                    {/* Statistik */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {statTiles.map(({ label, value, Icon, chip }) => (
                            <div
                                key={label}
                                className={`${card} flex items-center gap-4 p-5`}
                            >
                                <span
                                    className={`grid size-12 shrink-0 place-items-center rounded-2xl ${chip}`}
                                >
                                    <Icon className="size-6" />
                                </span>
                                <div>
                                    <p
                                        className={`${fontDisplay} text-3xl leading-none font-extrabold tabular-nums`}
                                    >
                                        {value}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-[#6B6590]">
                                        {label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Riwayat sesi */}
                    {recentExams.length > 0 && (
                        <section className={`${card} overflow-hidden`}>
                            <div className="flex items-center justify-between px-6 py-5">
                                <h2
                                    className={`${fontDisplay} text-xl font-extrabold`}
                                >
                                    Sesi terakhir
                                </h2>
                                <Link
                                    href="/guru/rekap"
                                    className="text-sm font-bold text-[#5B34E6] hover:underline"
                                >
                                    Lihat semua rekap
                                </Link>
                            </div>

                            {/* Tabel (layar lebar) */}
                            <table className="hidden w-full text-left text-sm md:table">
                                <thead className="border-y-2 border-[#F1ECFF] bg-[#FAF8FF] text-[13px] font-bold text-[#6B6590]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Sesi
                                        </th>
                                        <th scope="col" className="px-3 py-3">
                                            Kode
                                        </th>
                                        <th scope="col" className="px-3 py-3">
                                            Durasi
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3 text-center"
                                        >
                                            Jawaban
                                        </th>
                                        <th scope="col" className="px-3 py-3">
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right"
                                        >
                                            <span className="sr-only">
                                                Aksi
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-[#F1ECFF]">
                                    {recentExams.map((exam) => (
                                        <tr
                                            key={exam.id}
                                            className="transition hover:bg-[#FAF8FF]"
                                        >
                                            <td className="px-6 py-3.5">
                                                <p className="font-bold">
                                                    {exam.title}
                                                </p>
                                                <p className="text-[13px] text-[#6B6590]">
                                                    {exam.grade_level}
                                                </p>
                                            </td>
                                            <td
                                                className={`${fontDisplay} px-3 py-3.5 text-base font-extrabold tracking-wider`}
                                            >
                                                {exam.token}
                                            </td>
                                            <td className="px-3 py-3.5 text-[#4A4170]">
                                                {exam.duration_minutes} menit
                                            </td>
                                            <td className="px-3 py-3.5 text-center font-bold tabular-nums">
                                                {exam.attempts_count ?? 0}
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <StatusChip
                                                    status={exam.status}
                                                />
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                {exam.status === 'draft' ? (
                                                    <Link
                                                        href={`/guru/soal/${exam.id}/edit`}
                                                        className={`${btn.primary} h-10 px-4`}
                                                    >
                                                        Edit soal
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`/guru/rekap?exam_id=${exam.id}`}
                                                        className={`${btn.ghost} h-10 px-4`}
                                                    >
                                                        Rekap
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Kartu (HP) */}
                            <ul className="divide-y-2 divide-[#F1ECFF] border-t-2 border-[#F1ECFF] md:hidden">
                                {recentExams.map((exam) => (
                                    <li key={exam.id} className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-bold">
                                                    {exam.title}
                                                </p>
                                                <p className="text-[13px] text-[#6B6590]">
                                                    {exam.grade_level}
                                                </p>
                                            </div>
                                            <StatusChip status={exam.status} />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="flex items-center gap-3 text-[13px] font-semibold text-[#4A4170]">
                                                <span
                                                    className={`${fontDisplay} text-base font-extrabold tracking-wider text-[#1B1340]`}
                                                >
                                                    {exam.token}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="size-3.5" />
                                                    {exam.duration_minutes} mnt
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="size-3.5" />
                                                    {exam.attempts_count ?? 0}
                                                </span>
                                            </p>
                                            {exam.status === 'draft' ? (
                                                <Link
                                                    href={`/guru/soal/${exam.id}/edit`}
                                                    className={`${btn.primary} h-10 px-4`}
                                                >
                                                    Edit soal
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/guru/rekap?exam_id=${exam.id}`}
                                                    className={`${btn.ghost} h-10 px-4`}
                                                >
                                                    Rekap
                                                </Link>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

GuruDashboard.layout = {
    breadcrumbs,
};

import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Copy, Play, Users } from 'lucide-react';
import { useState } from 'react';
import {
    btn,
    card,
    ExamFonts,
    fontBody,
    fontDisplay,
} from '@/components/exam/ui';

type Props = {
    exam: {
        id: number;
        title: string;
        token: string;
        status: string;
        grade_level: string;
        jumlah_soal: number;
        question_types: string[];
        duration_minutes: number;
        questions_count: number;
    };
};

export default function ExamKode({ exam }: Props) {
    const { status: flash } = usePage().props as { status?: string };
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(exam.token);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard tidak tersedia — kode tetap terbaca di layar
        }
    };

    const handleOpen = () => {
        router.post(`/guru/soal/${exam.id}/buka`);
    };

    const meta = [
        { k: 'Kelas', v: exam.grade_level.replace(' SMA', '') },
        { k: 'Jumlah soal', v: `${exam.questions_count}/${exam.jumlah_soal}` },
        { k: 'Durasi', v: `${exam.duration_minutes} mnt` },
    ];

    return (
        <>
            <Head title={`Kode ${exam.token} — Dashboard Guru`} />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-screen bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-8 md:py-12">
                    <Link
                        href="/guru"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#5B34E6] hover:underline"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke dashboard
                    </Link>

                    {typeof flash === 'string' && flash && (
                        <p
                            role="status"
                            className="rounded-2xl bg-[#E4F7F0] px-4 py-3 text-sm font-semibold text-[#07694A]"
                        >
                            {flash}
                        </p>
                    )}

                    <div className={`${card} p-6 text-center md:p-10`}>
                        <h1
                            className={`${fontDisplay} text-2xl font-extrabold tracking-tight md:text-3xl`}
                        >
                            Bagikan kode ini ke siswa
                        </h1>
                        <p className="mt-1.5 text-[15px] text-[#6B6590]">
                            {exam.title}
                        </p>

                        <p className="mt-6 text-sm font-semibold text-[#6B6590]">
                            Kode ruang ujian
                        </p>
                        <p
                            className={`${fontDisplay} mt-2 text-[3.25rem] leading-none font-extrabold tracking-[0.18em] break-all text-[#1B1340] md:text-[4.5rem]`}
                        >
                            {exam.token}
                        </p>
                        <p className="mt-3 text-sm text-[#6B6590]">
                            6 angka — siswa mengetiknya di halaman masuk siswa.
                        </p>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`${btn.sun} mt-6 h-14 w-full text-base`}
                        >
                            {copied ? (
                                <Check className="size-5" strokeWidth={3} />
                            ) : (
                                <Copy className="size-5" />
                            )}
                            <span aria-live="polite">
                                {copied ? 'Kode tersalin' : 'Salin kode'}
                            </span>
                        </button>

                        <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
                            {meta.map((m) => (
                                <div
                                    key={m.k}
                                    className="rounded-2xl bg-[#F4F1FF] px-2 py-2.5"
                                >
                                    <dd
                                        className={`${fontDisplay} text-base font-extrabold`}
                                    >
                                        {m.v}
                                    </dd>
                                    <dt className="text-xs font-semibold text-[#6B6590]">
                                        {m.k}
                                    </dt>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-4 rounded-2xl bg-[#F4F1FF] px-4 py-3 text-left">
                            <p className="text-xs font-bold text-[#6B6590]">
                                Tipe soal
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {exam.question_types.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5B34E6] shadow-[inset_0_0_0_2px_#DDD4FF]"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            {exam.status !== 'active' ? (
                                <button
                                    type="button"
                                    onClick={handleOpen}
                                    className={`${btn.primary} h-14 w-full text-base`}
                                >
                                    <Play className="size-4 fill-current" />
                                    <span>Buka ruang ujian</span>
                                </button>
                            ) : (
                                <p className="flex items-center justify-center gap-2 rounded-2xl bg-[#E4F7F0] px-4 py-3.5 text-sm font-bold text-[#07694A]">
                                    <Users className="size-4" />
                                    Ruang ujian sedang aktif
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

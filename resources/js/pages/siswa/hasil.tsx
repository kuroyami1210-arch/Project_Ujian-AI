import { Head, Link } from '@inertiajs/react';
import { Check, ChevronDown, Clock, Home, X } from 'lucide-react';
import { useState } from 'react';
import { btn, ExamFonts, fontBody, fontDisplay } from '@/components/exam/ui';

type ReviewItem = {
    order: number;
    type: string;
    question: string;
    options: string[];
    correct_answers: number[];
    user_answer: number | number[] | string | null;
    is_correct: boolean | null;
};

type Props = {
    exam: {
        title: string;
        token: string;
    };
    result: {
        score: number;
        correct: number;
        wrong: number;
        accuracy: number;
        passed: boolean;
        total: number;
        feedback: string;
    };
    review: ReviewItem[];
};

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export default function Hasil({ exam, result, review }: Props) {
    const [filter, setFilter] = useState<'all' | 'wrong'>('all');
    const visible =
        filter === 'wrong'
            ? review.filter((r) => r.is_correct === false)
            : review;
    const score = Math.max(0, Math.min(100, result.score));

    return (
        <>
            <Head title={`Hasil — ${exam.title}`} />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-dvh bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <div className="mx-auto max-w-5xl md:grid md:grid-cols-[21rem_minmax(0,1fr)] md:items-start md:gap-6 md:p-6">
                    {/* Ringkasan nilai */}
                    <section className="bg-[#5B34E6] px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-8 text-center text-white md:sticky md:top-6 md:rounded-[2rem] md:px-6 md:pt-8 md:shadow-[0_6px_0_0_#3A1FB0]">
                        <p className="truncate text-sm font-semibold text-white/80">
                            {exam.title}
                        </p>

                        <div className="relative mx-auto my-5 size-44">
                            <svg
                                viewBox="0 0 120 120"
                                className="size-full -rotate-90"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="60"
                                    cy="60"
                                    r={RADIUS}
                                    fill="none"
                                    stroke="#3A1FB0"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r={RADIUS}
                                    fill="none"
                                    stroke="#FFC933"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={CIRC}
                                    strokeDashoffset={CIRC * (1 - score / 100)}
                                />
                            </svg>
                            <div className="absolute inset-0 grid place-content-center">
                                <p
                                    className={`${fontDisplay} text-6xl leading-none font-extrabold tabular-nums`}
                                    aria-label={`Nilai ${result.score} dari 100`}
                                >
                                    {result.score}
                                </p>
                                <p className="text-sm font-semibold text-white/70">
                                    dari 100
                                </p>
                            </div>
                        </div>

                        <p
                            className={`mx-auto inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
                                result.passed
                                    ? 'bg-[#FFC933] text-[#1B1340]'
                                    : 'bg-white text-[#D8325A]'
                            }`}
                        >
                            {result.passed
                                ? 'Kompetensi tercapai (lulus KKM)'
                                : 'Belum mencapai KKM — perlu remedial'}
                        </p>

                        <dl className="mt-6 grid grid-cols-3 gap-2.5">
                            {[
                                { label: 'Benar', value: result.correct },
                                { label: 'Salah', value: result.wrong },
                                {
                                    label: 'Akurasi',
                                    value: `${result.accuracy}%`,
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-2xl bg-white/12 px-2 py-3"
                                >
                                    <dd
                                        className={`${fontDisplay} text-2xl font-extrabold`}
                                    >
                                        {s.value}
                                    </dd>
                                    <dt className="text-xs font-semibold text-white/75">
                                        {s.label}
                                    </dt>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-6 hidden md:block">
                            <Link
                                href="/siswa"
                                className={`${btn.sun} h-12 w-full`}
                            >
                                <Home className="size-4" />
                                <span>Kembali ke beranda</span>
                            </Link>
                        </div>
                    </section>

                    <div className="min-w-0 space-y-5 px-4 pt-5 pb-28 md:p-0">
                        {/* Catatan AI */}
                        <section className="rounded-3xl border-2 border-[#FFE29A] bg-[#FFF8E1] p-5">
                            <h2
                                className={`${fontDisplay} mb-1.5 text-lg font-extrabold`}
                            >
                                Catatan dari AI
                            </h2>
                            <p className="text-[15px] leading-relaxed text-[#4A3B00]">
                                {result.feedback}
                            </p>
                        </section>

                        {/* Pembahasan per soal */}
                        <section>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2
                                    className={`${fontDisplay} text-xl font-extrabold`}
                                >
                                    Pembahasan
                                </h2>
                                <div
                                    className="inline-flex rounded-full bg-white p-1 text-[13px] font-bold shadow-[inset_0_0_0_2px_#E7E0FF]"
                                    role="tablist"
                                    aria-label="Filter soal"
                                >
                                    {(
                                        [
                                            ['all', `Semua (${review.length})`],
                                            [
                                                'wrong',
                                                `Salah (${result.wrong})`,
                                            ],
                                        ] as const
                                    ).map(([key, label]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            role="tab"
                                            aria-selected={filter === key}
                                            onClick={() => setFilter(key)}
                                            className={`min-h-9 rounded-full px-3.5 transition ${
                                                filter === key
                                                    ? 'bg-[#5B34E6] text-white'
                                                    : 'text-[#6B6590]'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {visible.length === 0 ? (
                                <p className="rounded-3xl border-2 border-dashed border-[#DDD4FF] p-8 text-center text-sm font-medium text-[#6B6590]">
                                    Tidak ada jawaban salah. Kerja bagus!
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {visible.map((item) => {
                                        const isEssay = item.type === 'Uraian';
                                        const letter = (idx: number) =>
                                            `${String.fromCharCode(65 + idx)}. `;
                                        const correctLabel =
                                            item.correct_answers
                                                .map(
                                                    (idx: number) =>
                                                        `${letter(idx)}${item.options[idx] ?? ''}`,
                                                )
                                                .join(' · ');
                                        const givenIndexes = Array.isArray(
                                            item.user_answer,
                                        )
                                            ? (item.user_answer as number[])
                                            : null;
                                        const hasAnswer = isEssay
                                            ? typeof item.user_answer ===
                                                  'string' &&
                                              item.user_answer.trim() !== ''
                                            : givenIndexes
                                              ? givenIndexes.length > 0
                                              : item.user_answer !== null;
                                        const userLabel = isEssay
                                            ? hasAnswer
                                                ? String(item.user_answer)
                                                : 'Tidak dijawab'
                                            : givenIndexes
                                              ? givenIndexes
                                                    .map(
                                                        (idx: number) =>
                                                            `${letter(idx)}${item.options[idx] ?? ''}`,
                                                    )
                                                    .join(' · ')
                                              : hasAnswer
                                                ? `${letter(item.user_answer as number)}${item.options[item.user_answer as number] ?? ''}`
                                                : 'Tidak dijawab';
                                        return (
                                            <li key={item.order}>
                                                <details
                                                    open={!item.is_correct}
                                                    className="group rounded-3xl border-2 border-[#E7E0FF] bg-white shadow-[0_3px_0_0_#E7E0FF]"
                                                >
                                                    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
                                                        <span
                                                            className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${
                                                                item.is_correct ===
                                                                null
                                                                    ? 'bg-[#8F7BE8]'
                                                                    : item.is_correct
                                                                      ? 'bg-[#0E9F72]'
                                                                      : 'bg-[#D8325A]'
                                                            }`}
                                                        >
                                                            {item.is_correct ===
                                                            null ? (
                                                                <Clock
                                                                    className="size-5"
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                />
                                                            ) : item.is_correct ? (
                                                                <Check
                                                                    className="size-5"
                                                                    strokeWidth={
                                                                        3.5
                                                                    }
                                                                />
                                                            ) : (
                                                                <X
                                                                    className="size-5"
                                                                    strokeWidth={
                                                                        3.5
                                                                    }
                                                                />
                                                            )}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-[13px] font-bold text-[#6B6590]">
                                                                Soal{' '}
                                                                {item.order + 1}{' '}
                                                                ·{' '}
                                                                {item.is_correct ===
                                                                null
                                                                    ? 'Menunggu penilaian'
                                                                    : item.is_correct
                                                                      ? 'Benar'
                                                                      : 'Salah'}
                                                            </span>
                                                            <span className="block truncate text-[15px] font-semibold group-open:hidden">
                                                                {item.question}
                                                            </span>
                                                        </span>
                                                        <ChevronDown className="size-5 shrink-0 text-[#8F7BE8] transition group-open:rotate-180" />
                                                    </summary>
                                                    <div className="space-y-2.5 border-t-2 border-[#F1ECFF] p-4 pt-3.5 text-[15px]">
                                                        <p className="leading-relaxed font-semibold">
                                                            {item.question}
                                                        </p>
                                                        {item.is_correct !==
                                                            true && (
                                                            <p className="rounded-xl bg-[#FDEAEF] px-3.5 py-2.5 text-[#9C1B3C]">
                                                                <span className="block text-xs font-bold">
                                                                    Jawabanmu
                                                                </span>
                                                                {userLabel}
                                                            </p>
                                                        )}
                                                        {isEssay ? (
                                                            <p className="rounded-xl bg-[#EFF6FE] px-3.5 py-2.5 text-[#0F55A3]">
                                                                <span className="block text-xs font-bold">
                                                                    Penilaian
                                                                </span>
                                                                Soal uraian
                                                                dinilai manual
                                                                oleh guru.
                                                            </p>
                                                        ) : (
                                                            <p className="rounded-xl bg-[#E4F7F0] px-3.5 py-2.5 text-[#07694A]">
                                                                <span className="block text-xs font-bold">
                                                                    Jawaban
                                                                    benar
                                                                </span>
                                                                {correctLabel}
                                                            </p>
                                                        )}
                                                    </div>
                                                </details>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>
                </div>

                <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#E7E0FF] bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
                    <Link href="/siswa" className={`${btn.ink} h-12 w-full`}>
                        <Home className="size-4" />
                        <span>Kembali ke beranda</span>
                    </Link>
                </div>
            </div>
        </>
    );
}

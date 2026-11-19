import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bookmark,
    Check,
    ChevronLeft,
    Clock,
    LayoutGrid,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    btn,
    card,
    ExamFonts,
    fontBody,
    fontDisplay,
    optionTone,
} from '@/components/exam/ui';

type ExamInfo = {
    id: number;
    title: string;
    token: string;
    duration_minutes: number;
    total: number;
};

type ExamQuestion = {
    id: number;
    order: number;
    type: string;
    question: string;
    options: string[];
};

type Answer = number | number[] | string;

const TYPE_LABEL: Record<string, string> = {
    'Pilihan Ganda': 'Satu jawaban benar',
    'Pilihan Ganda Kompleks': 'Centang semua yang benar',
    'Benar Salah': 'Pilih benar atau salah',
    Uraian: 'Tulis jawabanmu',
};

type Props = {
    exam: ExamInfo;
    questions: ExamQuestion[];
};

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Ujian({ exam, questions }: Props) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<number, Answer>
    >({});
    const [doubtfulQuestions, setDoubtfulQuestions] = useState<
        Record<number, boolean>
    >({});
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showPalette, setShowPalette] = useState(false);
    const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
    const [submitting, setSubmitting] = useState(false);

    const submittedRef = useRef(false);
    const payloadRef = useRef({
        answers: selectedAnswers,
        doubtful: doubtfulQuestions,
    });

    useEffect(() => {
        payloadRef.current = {
            answers: selectedAnswers,
            doubtful: doubtfulQuestions,
        };
    }, [selectedAnswers, doubtfulQuestions]);

    const submit = (
        answers: Record<number, Answer>,
        doubtful: Record<number, boolean>,
    ) => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        setSubmitting(true);
        router.post('/ujian/kumpulkan', { answers, doubtful });
    };

    useEffect(() => {
        const id = window.setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            const { answers, doubtful } = payloadRef.current;
            submit(answers, doubtful);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // Esc menutup panel yang terbuka
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowPalette(false);
                setShowSubmitModal(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    if (questions.length === 0) {
        return (
            <>
                <Head title="Ujian" />
                <ExamFonts />
                <div
                    className={`${fontBody} flex min-h-dvh items-center justify-center bg-[#F4F1FF] px-6`}
                >
                    <p className="text-center text-sm text-[#6B6590]">
                        Soal belum tersedia untuk sesi ini.
                    </p>
                </div>
            </>
        );
    }

    const q = questions[currentIdx];
    const isDoubtful = !!doubtfulQuestions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const isEssay = q.type === 'Uraian';
    const isComplex = q.type === 'Pilihan Ganda Kompleks';

    const handleSelectOption = (optIdx: number) => {
        setSelectedAnswers((prev) => {
            if (!isComplex) {
                return { ...prev, [currentIdx]: optIdx };
            }

            const current = Array.isArray(prev[currentIdx])
                ? (prev[currentIdx] as number[])
                : [];

            return {
                ...prev,
                [currentIdx]: current.includes(optIdx)
                    ? current.filter((i) => i !== optIdx)
                    : [...current, optIdx].sort((a, b) => a - b),
            };
        });
    };

    const handleEssay = (value: string) => {
        setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: value }));
    };

    const toggleDoubtful = () => {
        setDoubtfulQuestions((prev) => ({
            ...prev,
            [currentIdx]: !prev[currentIdx],
        }));
    };

    const hasAnswer = (i: number): boolean => {
        const answer = selectedAnswers[i];

        if (answer === undefined || answer === null) return false;
        if (Array.isArray(answer)) return answer.length > 0;
        if (typeof answer === 'string') return answer.trim() !== '';

        return true;
    };

    const totalAnswered = questions.filter((_, i) => hasAnswer(i)).length;
    const totalDoubtful =
        Object.values(doubtfulQuestions).filter(Boolean).length;
    const totalUnanswered = questions.length - totalAnswered;
    const progress = Math.round((totalAnswered / questions.length) * 100);
    const lowTime = timeLeft < 300;

    const goTo = (i: number) => {
        setCurrentIdx(i);
        setShowPalette(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPalette = () => (
        <>
            <div className="grid grid-cols-5 gap-2.5">
                {questions.map((item, i) => {
                    const isAns = hasAnswer(i);
                    const isRag = !!doubtfulQuestions[i];
                    const isCurr = currentIdx === i;

                    let style = 'border-[#DDD4FF] bg-white text-[#4A4170]';
                    if (isRag)
                        style = 'border-[#FFC933] bg-[#FFC933] text-[#1B1340]';
                    else if (isAns)
                        style = 'border-[#5B34E6] bg-[#5B34E6] text-white';

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Ke soal ${i + 1}${isAns ? ', sudah dijawab' : ', belum dijawab'}${isRag ? ', ragu-ragu' : ''}`}
                            aria-current={isCurr ? 'true' : undefined}
                            className={`${fontDisplay} grid aspect-square min-h-11 place-items-center rounded-xl border-2 text-base font-extrabold transition ${style} ${
                                isCurr
                                    ? 'outline-[3px] outline-offset-2 outline-[#1B1340]'
                                    : ''
                            }`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
            <ul className="mt-5 grid gap-2 border-t-2 border-[#F1ECFF] pt-4 text-[13px] font-medium text-[#4A4170]">
                <li className="flex items-center gap-2.5">
                    <span className="size-4 rounded-md bg-[#5B34E6]" /> Terjawab
                </li>
                <li className="flex items-center gap-2.5">
                    <span className="size-4 rounded-md bg-[#FFC933]" />{' '}
                    Ragu-ragu
                </li>
                <li className="flex items-center gap-2.5">
                    <span className="size-4 rounded-md border-2 border-[#DDD4FF] bg-white" />{' '}
                    Belum dijawab
                </li>
            </ul>
        </>
    );

    return (
        <>
            <Head title={`Ujian — ${exam.title}`} />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-dvh bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                {/* Bar atas: judul, waktu, progres jawaban */}
                <header className="sticky top-0 z-30 bg-[#5B34E6] pt-[env(safe-area-inset-top)] text-white shadow-[0_3px_0_0_#3A1FB0]">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-white/80">
                                {exam.title}
                            </p>
                            <p
                                className={`${fontDisplay} text-lg leading-tight font-extrabold`}
                            >
                                Soal {currentIdx + 1}
                                <span className="font-semibold text-white/70">
                                    {' '}
                                    / {questions.length}
                                </span>
                            </p>
                        </div>
                        <div
                            className={`${fontDisplay} flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-lg font-extrabold tabular-nums ${
                                lowTime
                                    ? 'bg-[#D8325A] text-white'
                                    : 'bg-[#FFC933] text-[#1B1340]'
                            }`}
                            role="timer"
                            aria-label={`Sisa waktu ${formatTime(timeLeft)}`}
                        >
                            <Clock className="size-5" aria-hidden="true" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <div
                        className="h-1.5 bg-[#3A1FB0]"
                        role="progressbar"
                        aria-label="Soal terjawab"
                        aria-valuemin={0}
                        aria-valuemax={questions.length}
                        aria-valuenow={totalAnswered}
                    >
                        <div
                            className="h-full rounded-r-full bg-[#FFC933] transition-[width] duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </header>

                <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-5 pb-32 md:grid-cols-[1fr_17.5rem] md:items-start md:px-6 md:pt-8 md:pb-10">
                    <div className="space-y-4">
                        <div
                            className={`${card} p-5 select-none md:p-8`}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                        >
                            <p className="mb-3 inline-flex rounded-full bg-[#F1ECFF] px-3 py-1 text-xs font-bold text-[#5B34E6]">
                                Soal {currentIdx + 1} ·{' '}
                                {TYPE_LABEL[q.type] ?? q.type}
                            </p>
                            <p className="text-[1.125rem] leading-relaxed font-semibold md:text-xl">
                                {q.question}
                            </p>
                        </div>

                        {isEssay ? (
                            <div className={`${card} p-5 md:p-8`}>
                                <label
                                    htmlFor="essay-answer"
                                    className="mb-2 block text-sm font-bold text-[#6B6590]"
                                >
                                    Jawabanmu
                                </label>
                                <textarea
                                    id="essay-answer"
                                    rows={6}
                                    value={
                                        typeof selectedAnswers[currentIdx] ===
                                        'string'
                                            ? (selectedAnswers[
                                                  currentIdx
                                              ] as string)
                                            : ''
                                    }
                                    onChange={(e) =>
                                        handleEssay(e.target.value)
                                    }
                                    placeholder="Tulis jawabanmu di sini..."
                                    className="w-full resize-y rounded-2xl border-2 border-[#E7E0FF] bg-white p-4 text-[15px] leading-relaxed transition outline-none placeholder:text-[#9A92BD] focus:border-[#5B34E6] focus:ring-4 focus:ring-[#5B34E6]/15"
                                />
                                <p className="mt-2 text-xs text-[#6B6590]">
                                    Jawaban uraian belum dinilai otomatis — guru
                                    yang menilai.
                                </p>
                            </div>
                        ) : (
                            <div
                                className="grid gap-3 lg:grid-cols-2"
                                role="group"
                                aria-label="Pilihan jawaban"
                            >
                                {q.options.map(
                                    (option: string, idx: number) => {
                                        const picked =
                                            selectedAnswers[currentIdx];
                                        const isSelected = isComplex
                                            ? Array.isArray(picked) &&
                                              picked.includes(idx)
                                            : picked === idx;
                                        const tone =
                                            optionTone[idx % optionTone.length];
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectOption(idx)
                                                }
                                                aria-pressed={isSelected}
                                                onCopy={(e) =>
                                                    e.preventDefault()
                                                }
                                                className={`flex min-h-16 w-full items-center gap-3.5 rounded-2xl border-2 p-3 text-left text-[15px] leading-snug font-semibold transition select-none active:translate-y-[2px] ${
                                                    isSelected
                                                        ? `${tone.border} ${tone.tint} ${tone.ring}`
                                                        : 'border-[#E7E0FF] bg-white shadow-[0_3px_0_0_#E7E0FF] hover:border-[#C9BBFF]'
                                                }`}
                                            >
                                                <span
                                                    className={`${fontDisplay} grid size-10 shrink-0 place-items-center rounded-xl text-lg font-extrabold text-white ${tone.bg}`}
                                                >
                                                    {isSelected ? (
                                                        <Check
                                                            className="size-5"
                                                            strokeWidth={3.5}
                                                        />
                                                    ) : isComplex ? (
                                                        <span
                                                            aria-hidden="true"
                                                            className="size-4 rounded-[6px] border-2 border-white/90"
                                                        />
                                                    ) : (
                                                        String.fromCharCode(
                                                            65 + idx,
                                                        )
                                                    )}
                                                </span>
                                                <span className="py-1">
                                                    {option}
                                                </span>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        )}

                        {/* Navigasi: menempel di bawah layar pada HP */}
                        <nav
                            aria-label="Navigasi soal"
                            className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#E7E0FF] bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:pt-2 md:backdrop-blur-none"
                        >
                            <div className="mx-auto flex max-w-5xl items-center gap-2">
                                <button
                                    type="button"
                                    disabled={currentIdx === 0}
                                    onClick={() => goTo(currentIdx - 1)}
                                    aria-label="Soal sebelumnya"
                                    className={`${btn.ghost} size-12 shrink-0 !p-0 md:h-12 md:w-auto md:!px-5`}
                                >
                                    <ChevronLeft className="size-5" />
                                    <span className="hidden md:inline">
                                        Sebelumnya
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPalette(true)}
                                    aria-label="Buka daftar soal"
                                    className={`${btn.ghost} size-12 shrink-0 !p-0 md:hidden`}
                                >
                                    <LayoutGrid className="size-5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleDoubtful}
                                    aria-pressed={isDoubtful}
                                    aria-label={
                                        isDoubtful
                                            ? 'Hapus tanda ragu-ragu'
                                            : 'Tandai ragu-ragu'
                                    }
                                    className={`size-12 shrink-0 !p-0 md:h-12 md:w-auto md:!px-4 ${
                                        isDoubtful
                                            ? `${btn.sun}`
                                            : `${btn.ghost} hover:!border-[#FFC933] hover:!bg-[#FFF8E1]`
                                    }`}
                                >
                                    <Bookmark
                                        className={`size-5 ${isDoubtful ? 'fill-current' : ''}`}
                                    />
                                    <span className="hidden md:inline">
                                        {isDoubtful
                                            ? 'Ditandai ragu-ragu'
                                            : 'Tandai ragu-ragu'}
                                    </span>
                                </button>

                                {isLast ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowSubmitModal(true)}
                                        className={`${btn.mint} h-12 min-w-0 flex-1 md:ml-auto md:flex-none md:px-8`}
                                    >
                                        Selesai & kumpulkan
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => goTo(currentIdx + 1)}
                                        className={`${btn.primary} h-12 min-w-0 flex-1 md:ml-auto md:flex-none md:px-8`}
                                    >
                                        Selanjutnya
                                    </button>
                                )}
                            </div>
                        </nav>
                    </div>

                    {/* Daftar soal: kolom samping di layar lebar */}
                    <aside
                        className={`${card} hidden p-5 md:sticky md:top-28 md:block`}
                    >
                        <div className="mb-4 flex items-baseline justify-between">
                            <h2
                                className={`${fontDisplay} text-lg font-extrabold`}
                            >
                                Daftar soal
                            </h2>
                            <span className="text-[13px] font-semibold text-[#6B6590]">
                                {totalAnswered}/{questions.length} terjawab
                            </span>
                        </div>
                        {renderPalette()}
                        <button
                            type="button"
                            onClick={() => setShowSubmitModal(true)}
                            className={`${btn.ghost} mt-5 w-full`}
                        >
                            Kumpulkan sekarang
                        </button>
                    </aside>
                </div>

                {/* Bottom sheet daftar soal (HP) */}
                {showPalette && (
                    <div
                        className="fixed inset-0 z-40 flex items-end md:hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Daftar soal"
                    >
                        <button
                            type="button"
                            aria-label="Tutup daftar soal"
                            onClick={() => setShowPalette(false)}
                            className="absolute inset-0 bg-[#1B1340]/60"
                        />
                        <div className="relative max-h-[80dvh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                            <div
                                className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#DDD4FF]"
                                aria-hidden="true"
                            />
                            <div className="mb-4 flex items-baseline justify-between">
                                <h2
                                    className={`${fontDisplay} text-xl font-extrabold`}
                                >
                                    Daftar soal
                                </h2>
                                <span className="text-sm font-semibold text-[#6B6590]">
                                    {totalAnswered}/{questions.length} terjawab
                                </span>
                            </div>
                            {renderPalette()}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPalette(false);
                                    setShowSubmitModal(true);
                                }}
                                className={`${btn.mint} mt-5 h-12 w-full`}
                            >
                                Kumpulkan sekarang
                            </button>
                        </div>
                    </div>
                )}

                {/* Konfirmasi kumpulkan */}
                {showSubmitModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="submit-title"
                    >
                        <button
                            type="button"
                            aria-label="Tutup dialog tinjauan"
                            onClick={() => setShowSubmitModal(false)}
                            className="absolute inset-0 bg-[#1B1340]/60"
                        />
                        <div className="relative w-full max-w-md space-y-5 rounded-t-[2rem] bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[2rem] sm:pb-6">
                            <div className="flex items-center justify-between">
                                <h3
                                    id="submit-title"
                                    className={`${fontDisplay} text-xl font-extrabold`}
                                >
                                    Kumpulkan jawaban?
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="grid size-10 place-items-center rounded-full text-[#6B6590] hover:bg-[#F4F1FF]"
                                    aria-label="Tutup dialog tinjauan"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="rounded-2xl bg-[#F1ECFF] p-4">
                                    <p
                                        className={`${fontDisplay} text-3xl font-extrabold text-[#5B34E6]`}
                                    >
                                        {totalAnswered}
                                        <span className="text-lg text-[#8F7BE8]">
                                            /{questions.length}
                                        </span>
                                    </p>
                                    <p className="text-[13px] font-semibold text-[#4A4170]">
                                        Terjawab
                                    </p>
                                </div>
                                <div
                                    className={`rounded-2xl p-4 ${totalDoubtful > 0 ? 'bg-[#FFF3CC]' : 'bg-[#F4F1FF]'}`}
                                >
                                    <p
                                        className={`${fontDisplay} text-3xl font-extrabold ${totalDoubtful > 0 ? 'text-[#7A5600]' : 'text-[#6B6590]'}`}
                                    >
                                        {totalDoubtful}
                                    </p>
                                    <p className="text-[13px] font-semibold text-[#4A4170]">
                                        Ragu-ragu
                                    </p>
                                </div>
                            </div>

                            {(totalDoubtful > 0 || totalUnanswered > 0) && (
                                <div className="flex items-start gap-2.5 rounded-2xl bg-[#FFF3CC] p-3.5 text-[13px] leading-snug font-medium text-[#7A5600]">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                    <span>
                                        {totalUnanswered > 0 &&
                                            `${totalUnanswered} soal belum dijawab. `}
                                        {totalDoubtful > 0 &&
                                            'Masih ada soal bertanda ragu-ragu. '}
                                        Pastikan jawabanmu sudah final sebelum
                                        mengumpulkan.
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className={`${btn.ghost} h-12`}
                                >
                                    Periksa lagi
                                </button>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() =>
                                        submit(
                                            selectedAnswers,
                                            doubtfulQuestions,
                                        )
                                    }
                                    className={`${btn.primary} h-12`}
                                >
                                    {submitting
                                        ? 'Mengumpulkan...'
                                        : 'Ya, kumpulkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

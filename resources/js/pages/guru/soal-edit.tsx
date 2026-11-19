import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    PencilLine,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    btn,
    card,
    ExamFonts,
    fontBody,
    fontDisplay,
} from '@/components/exam/ui';

type EditQuestion = {
    id: number;
    order: number;
    type: string;
    question: string;
    options: string[];
    correct_answers: number[];
};

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
    };
    questions: EditQuestion[];
};

const TYPE_BADGE: Record<string, string> = {
    'Pilihan Ganda': 'bg-[#F1ECFF] text-[#5B34E6]',
    'Pilihan Ganda Kompleks': 'bg-[#E8F2FD] text-[#0F55A3]',
    'Benar Salah': 'bg-[#E4F7F0] text-[#07694A]',
    Uraian: 'bg-[#FFF3CC] text-[#7A5600]',
};

const TYPE_OPTIONS = [
    'Pilihan Ganda',
    'Pilihan Ganda Kompleks',
    'Benar Salah',
    'Uraian',
];

/** Opsi bawaan per tipe saat guru mengganti tipe soal. */
function defaultOptionsFor(type: string, current: string[]): string[] {
    if (type === 'Benar Salah') return ['Benar', 'Salah'];
    if (type === 'Uraian') return [];

    const isBoolPair =
        current.length === 2 &&
        current[0] === 'Benar' &&
        current[1] === 'Salah';

    if (current.length >= 2 && !isBoolPair) return current;

    return ['', '', '', ''];
}

function QuestionCard({
    examId,
    initial,
    index,
}: {
    examId: number;
    initial: EditQuestion;
    index: number;
}) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<EditQuestion>(initial);

    const isEssay = draft.type === 'Uraian';
    const isMultiple = draft.type === 'Pilihan Ganda Kompleks';

    const changeType = (type: string) => {
        setDraft({
            ...draft,
            type,
            options: defaultOptionsFor(type, draft.options),
            correct_answers: [],
        });
    };

    const setOption = (idx: number, value: string) => {
        const options = [...draft.options];
        options[idx] = value;
        setDraft({ ...draft, options });
    };

    const addOption = () => {
        if (draft.options.length >= 8) return;
        setDraft({ ...draft, options: [...draft.options, ''] });
    };

    const removeOption = (idx: number) => {
        if (draft.options.length <= 2) return;

        const options = draft.options.filter((_, i) => i !== idx);
        const correct = draft.correct_answers
            .filter((i) => i !== idx)
            .map((i) => (i > idx ? i - 1 : i))
            .sort((a, b) => a - b);

        setDraft({ ...draft, options, correct_answers: correct });
    };

    const toggleCorrect = (idx: number) => {
        if (!isMultiple) {
            setDraft({ ...draft, correct_answers: [idx] });
            return;
        }

        const selected = draft.correct_answers.includes(idx);
        setDraft({
            ...draft,
            correct_answers: (selected
                ? draft.correct_answers.filter((i) => i !== idx)
                : [...draft.correct_answers, idx]
            ).sort((a, b) => a - b),
        });
    };

    const save = () => {
        // Buang opsi kosong & petakan ulang indeks jawaban benar.
        const pairs = draft.options
            .map((text, from) => ({ text: text.trim(), from }))
            .filter((p) => p.text !== '');
        const indexMap: Record<number, number> = {};
        pairs.forEach((p, to) => {
            indexMap[p.from] = to;
        });
        const options = pairs.map((p) => p.text);
        const correct = draft.correct_answers
            .filter((i) => i in indexMap)
            .map((i) => indexMap[i])
            .sort((a, b) => a - b);

        if (!isEssay && options.length < 2) {
            setError('Pilihan jawaban butuh minimal 2 opsi yang terisi.');
            return;
        }
        if (!isEssay && correct.length === 0) {
            setError('Tandai dulu jawaban yang benar.');
            return;
        }
        if (draft.question.trim().length < 5) {
            setError('Isi pertanyaan soal minimal 5 karakter.');
            return;
        }

        setSaving(true);
        setError(null);

        router.put(
            `/guru/soal/${examId}/${initial.id}`,
            {
                type: draft.type,
                question: draft.question.trim(),
                options,
                correct_answers: correct,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setEditing(false);
                },
                onError: (errs) => {
                    setSaving(false);
                    setError(
                        errs.question ??
                            errs.options ??
                            errs.correct_answers ??
                            errs.type ??
                            Object.values(errs)[0] ??
                            'Gagal menyimpan soal.',
                    );
                },
            },
        );
    };

    return (
        <li className={`${card} p-5 md:p-6`}>
            <div className="flex items-center justify-between gap-3">
                <span
                    className={`${fontDisplay} grid size-9 shrink-0 place-items-center rounded-xl bg-[#FFC933] text-base font-extrabold text-[#1B1340] shadow-[0_3px_0_0_#C99200]`}
                >
                    {index + 1}
                </span>

                {editing ? (
                    <span className="rounded-full bg-[#FFF3CC] px-3 py-1 text-xs font-bold text-[#7A5600]">
                        Mode edit
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setDraft(initial);
                            setError(null);
                            setEditing(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFF] px-3 py-1 text-xs font-bold text-[#5B34E6] transition hover:bg-[#E7E0FF]"
                    >
                        <PencilLine className="size-3.5" />
                        Edit
                    </button>
                )}
            </div>

            {editing ? (
                <div className="mt-4 space-y-4">
                    <div>
                        <label
                            htmlFor={`type-${initial.id}`}
                            className="mb-1.5 block text-sm font-bold text-[#6B6590]"
                        >
                            Tipe soal
                        </label>
                        <select
                            id={`type-${initial.id}`}
                            value={draft.type}
                            onChange={(e) => changeType(e.target.value)}
                            className="w-full rounded-2xl border-2 border-[#E7E0FF] bg-white px-4 py-3 text-[15px] font-semibold text-[#1B1340] transition outline-none focus:border-[#5B34E6] focus:ring-4 focus:ring-[#5B34E6]/15"
                        >
                            {TYPE_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor={`question-${initial.id}`}
                            className="mb-1.5 block text-sm font-bold text-[#6B6590]"
                        >
                            Pertanyaan
                        </label>
                        <textarea
                            id={`question-${initial.id}`}
                            rows={3}
                            value={draft.question}
                            onChange={(e) =>
                                setDraft({ ...draft, question: e.target.value })
                            }
                            className="w-full resize-y rounded-2xl border-2 border-[#E7E0FF] bg-white p-4 text-[15px] leading-relaxed transition outline-none focus:border-[#5B34E6] focus:ring-4 focus:ring-[#5B34E6]/15"
                        />
                    </div>

                    {isEssay ? (
                        <p className="rounded-2xl border-2 border-dashed border-[#DDD4FF] bg-[#FAF8FF] px-4 py-3 text-sm font-semibold text-[#6B6590]">
                            Soal uraian — siswa menulis jawaban bebas, tanpa
                            pilihan opsi.
                        </p>
                    ) : (
                        <div>
                            <p className="mb-1.5 text-sm font-bold text-[#6B6590]">
                                Pilihan jawaban &amp; kunci
                            </p>
                            <ul className="space-y-2">
                                {draft.options.map((option, idx) => {
                                    const isKey =
                                        draft.correct_answers.includes(idx);

                                    return (
                                        <li key={idx} className="flex gap-2">
                                            <input
                                                type={
                                                    isMultiple
                                                        ? 'checkbox'
                                                        : 'radio'
                                                }
                                                checked={isKey}
                                                onChange={() =>
                                                    toggleCorrect(idx)
                                                }
                                                aria-label={`Tandai opsi ${String.fromCharCode(65 + idx)} sebagai jawaban benar`}
                                                className="mt-3 size-4 shrink-0 accent-[#0E9F72]"
                                            />
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) =>
                                                    setOption(
                                                        idx,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                                                className={`flex-1 rounded-2xl border-2 bg-white px-3.5 py-2.5 text-[15px] transition outline-none focus:ring-4 ${
                                                    isKey
                                                        ? 'border-[#0E9F72] bg-[#E4F7F0] focus:border-[#0E9F72] focus:ring-[#0E9F72]/15'
                                                        : 'border-[#E7E0FF] focus:border-[#5B34E6] focus:ring-[#5B34E6]/15'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                aria-label={`Hapus opsi ${String.fromCharCode(65 + idx)}`}
                                                disabled={
                                                    draft.options.length <= 2
                                                }
                                                onClick={() =>
                                                    removeOption(idx)
                                                }
                                                className="grid size-11 shrink-0 place-items-center rounded-2xl text-[#D8325A] transition hover:bg-[#FDEAEF] disabled:opacity-30"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                            {draft.options.length < 8 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFF] px-3.5 py-1.5 text-xs font-bold text-[#5B34E6] transition hover:bg-[#E7E0FF]"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah opsi
                                </button>
                            )}
                            <p className="mt-1.5 text-xs text-[#6B6590]">
                                {isMultiple
                                    ? 'Centang semua jawaban yang benar.'
                                    : 'Pilih satu jawaban benar.'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="rounded-2xl bg-[#FDEAEF] px-4 py-2.5 text-sm font-semibold text-[#9C1B3C]"
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => setEditing(false)}
                            className={`${btn.ghost} h-12 flex-1`}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={save}
                            className={`${btn.primary} h-12 flex-1`}
                        >
                            <Check className="size-4" strokeWidth={3} />
                            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${TYPE_BADGE[initial.type] ?? 'bg-[#F1ECFF] text-[#5B34E6]'}`}
                        >
                            {initial.type}
                        </span>
                        <span className="text-xs font-semibold text-[#6B6590]">
                            {initial.options.length > 0
                                ? `${initial.options.length} opsi`
                                : 'Jawaban bebas'}
                        </span>
                    </div>

                    <p className="mt-3 text-[15px] leading-relaxed font-semibold">
                        {initial.question}
                    </p>

                    {initial.options.length > 0 ? (
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {initial.options.map((option, idx) => {
                                const isKey =
                                    initial.correct_answers.includes(idx);

                                return (
                                    <li
                                        key={idx}
                                        className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2 text-sm font-semibold ${
                                            isKey
                                                ? 'border-[#0E9F72] bg-[#E4F7F0] text-[#07694A]'
                                                : 'border-[#E7E0FF] bg-white text-[#4A4170]'
                                        }`}
                                    >
                                        <span
                                            className={`${fontDisplay} grid size-6 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                                                isKey
                                                    ? 'bg-[#0E9F72] text-white'
                                                    : 'bg-[#F4F1FF] text-[#5B34E6]'
                                            }`}
                                        >
                                            {isKey ? (
                                                <Check
                                                    className="size-3.5"
                                                    strokeWidth={3.5}
                                                />
                                            ) : (
                                                String.fromCharCode(65 + idx)
                                            )}
                                        </span>
                                        {option}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="mt-3 rounded-2xl border-2 border-dashed border-[#DDD4FF] bg-[#FAF8FF] px-4 py-3 text-sm font-semibold text-[#6B6590]">
                            Soal uraian — jawaban bebas dari siswa.
                        </p>
                    )}
                </>
            )}
        </li>
    );
}

export default function ExamEdit({ exam, questions }: Props) {
    const { status } = usePage().props as { status?: unknown };

    const meta = [
        { k: 'Kelas', v: exam.grade_level.replace(' SMA', '') },
        { k: 'Jumlah soal', v: String(questions.length) },
        { k: 'Durasi', v: `${exam.duration_minutes} mnt` },
    ];

    return (
        <>
            <Head title={`Edit Soal — ${exam.title}`} />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-screen bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <div className="mx-auto max-w-5xl space-y-5 px-4 py-8 pb-12 md:px-8 md:py-12">
                    <Link
                        href="/guru"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#5B34E6] hover:underline"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke dashboard
                    </Link>

                    {typeof status === 'string' && status && (
                        <p
                            role="status"
                            className="rounded-2xl bg-[#E4F7F0] px-4 py-3 text-sm font-semibold text-[#07694A]"
                        >
                            {status}
                        </p>
                    )}

                    <div className={`${card} p-6 md:p-8`}>
                        <h1
                            className={`${fontDisplay} text-2xl font-extrabold tracking-tight md:text-3xl`}
                        >
                            Periksa &amp; edit soal sebelum dibagikan
                        </h1>
                        <p className="mt-1.5 text-[15px] text-[#6B6590]">
                            {exam.title}
                        </p>

                        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
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

                        <div className="mt-4 flex flex-wrap gap-1.5">
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

                    <ul className="space-y-3">
                        {questions.map((q, i) => (
                            <QuestionCard
                                key={q.id}
                                examId={exam.id}
                                initial={q}
                                index={i}
                            />
                        ))}
                    </ul>

                    {/* Section finish — terpisah, tepat di bawah semua soal */}
                    <section
                        className={`${card} flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8`}
                    >
                        <div>
                            <h2
                                className={`${fontDisplay} text-lg font-extrabold md:text-xl`}
                            >
                                Selesaikan &amp; bagikan
                            </h2>
                            <p className="mt-1 text-sm text-[#6B6590]">
                                Sudah semua soal sesuai? Tekan finish untuk
                                mendapatkan kode 6 angka.
                            </p>
                        </div>
                        <Link
                            href={`/guru/soal/${exam.id}/kode`}
                            className={`${btn.primary} h-12 shrink-0 px-6 text-base`}
                        >
                            <span>Finish</span>
                            <ArrowRight className="size-5" />
                        </Link>
                    </section>
                </div>
            </div>
        </>
    );
}

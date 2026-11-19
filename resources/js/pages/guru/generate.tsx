import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import InputError from '@/components/input-error';
import { btn, ExamFonts, fontBody, fontDisplay } from '@/components/exam/ui';
import { Spinner } from '@/components/ui/spinner';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Generate Soal',
        href: '/guru/generate',
    },
];

const gradeOptions = ['Kelas 10 SMA', 'Kelas 11 SMA', 'Kelas 12 SMA'];
const questionTypes = [
    {
        value: 'Pilihan Ganda',
        hint: 'Satu jawaban benar dari 4 opsi.',
    },
    {
        value: 'Pilihan Ganda Kompleks',
        hint: 'Centang semua pernyataan yang benar.',
    },
    {
        value: 'Benar Salah',
        hint: 'Hanya dua pilihan: benar atau salah.',
    },
    {
        value: 'Uraian',
        hint: 'Siswa menulis jawaban bebas.',
    },
];
const durationPresets = [15, 30, 45, 60, 90, 120];

export default function GenerateSoalPage() {
    const { status } = usePage().props as { status?: unknown };

    const { data, setData, post, processing, errors } = useForm({
        topic: '',
        grade_level: gradeOptions[0],
        question_quantities: {} as Record<string, number>,
        duration_minutes: 30,
    });

    const totalSoal = Object.values(data.question_quantities).reduce(
        (sum, n) => sum + n,
        0,
    );

    const toggleType = (value: string) => {
        const next = { ...data.question_quantities };

        if (value in next) {
            delete next[value];
        } else {
            next[value] = 5;
        }

        setData('question_quantities', next);
    };

    const setCount = (value: string, count: number) => {
        setData('question_quantities', {
            ...data.question_quantities,
            [value]: Math.max(1, Math.min(50, count)),
        });
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        // Server mengalihkan ke halaman edit soal.
        post('/guru/soal');
    };

    return (
        <>
            <Head title="Generate Soal" />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-screen bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <div className="mx-auto max-w-none space-y-6 px-4 py-6 md:px-8 md:py-10">
                    <div>
                        <Link
                            href="/guru"
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#5B34E6] hover:underline"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali ke dashboard
                        </Link>
                        <h1
                            className={`${fontDisplay} mt-1.5 text-3xl font-extrabold tracking-tight md:text-4xl`}
                        >
                            Generate Soal
                        </h1>
                        <p className="mt-1 text-[15px] text-[#6B6590]">
                            Tulis materinya, atur tipe, jumlah, dan durasi — AI
                            yang menyusun soalnya.
                        </p>
                    </div>

                    {typeof status === 'string' && status && (
                        <div
                            role="status"
                            className="rounded-2xl bg-[#E4F7F0] px-4 py-3 text-sm font-semibold text-[#07694A]"
                        >
                            {status}
                        </div>
                    )}

                    {/* Pembuat soal AI — elemen utama halaman */}
                    <section className="relative overflow-hidden rounded-[2rem] bg-[#5B34E6] p-6 text-white shadow-[0_6px_0_0_#07694A] md:p-8">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-12 -right-10 size-44 rotate-12 rounded-[3rem] bg-[#6B46F0]"
                        />
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute top-24 -right-3 size-9 rounded-full bg-[#FFC933]"
                        />
                        <div className="relative">
                            <h2
                                className={`${fontDisplay} max-w-md text-[1.75rem] leading-[1.1] font-extrabold md:text-4xl`}
                            >
                                Tulis topiknya, AI yang menyusun soalnya.
                            </h2>

                            <form
                                onSubmit={handleGenerate}
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="topic"
                                        className="mb-2 block text-sm font-bold text-white/90"
                                    >
                                        Topik atau rangkuman materi
                                    </label>
                                    <textarea
                                        id="topic"
                                        value={data.topic}
                                        onChange={(e) =>
                                            setData('topic', e.target.value)
                                        }
                                        placeholder="Contoh: Penerapan Hukum Termodinamika I dan II dalam siklus Carnot..."
                                        rows={4}
                                        className="w-full resize-none rounded-2xl border-2 border-transparent bg-white px-4 py-3.5 text-[15px] leading-relaxed text-[#1B1340] transition outline-none placeholder:text-[#9A92BD] focus:border-[#FFC933] focus:ring-4 focus:ring-[#FFC933]/30"
                                    />
                                    <InputError message={errors.topic} />
                                </div>

                                <fieldset>
                                    <legend className="mb-2 text-sm font-bold text-white/90">
                                        Tingkat kelas
                                    </legend>
                                    <div className="flex flex-wrap gap-2">
                                        {gradeOptions.map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                aria-pressed={
                                                    data.grade_level === g
                                                }
                                                onClick={() =>
                                                    setData('grade_level', g)
                                                }
                                                className={`min-h-10 rounded-full px-4 text-sm font-bold transition focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC933] ${
                                                    data.grade_level === g
                                                        ? 'bg-[#FFC933] text-[#1B1340]'
                                                        : 'bg-white/15 text-white hover:bg-white/25'
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.grade_level} />
                                </fieldset>

                                <fieldset>
                                    <legend className="mb-2 text-sm font-bold text-white/90">
                                        Tipe soal &amp; jumlah soal
                                    </legend>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                        {questionTypes.map((t) => {
                                            const checked =
                                                t.value in
                                                data.question_quantities;
                                            const count =
                                                data.question_quantities[
                                                    t.value
                                                ] ?? 0;

                                            return (
                                                <div
                                                    key={t.value}
                                                    className={`rounded-2xl border-2 p-3 transition ${
                                                        checked
                                                            ? 'border-[#FFC933] bg-white/20'
                                                            : 'border-white/20 bg-white/10'
                                                    }`}
                                                >
                                                    <label className="flex cursor-pointer items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() =>
                                                                toggleType(
                                                                    t.value,
                                                                )
                                                            }
                                                            className="mt-0.5 size-5 shrink-0 accent-[#FFC933]"
                                                        />
                                                        <span>
                                                            <span className="block text-sm font-bold">
                                                                {t.value}
                                                            </span>
                                                            <span className="block text-xs text-white/75">
                                                                {t.hint}
                                                            </span>
                                                        </span>
                                                    </label>

                                                    {checked && (
                                                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 p-1">
                                                            <button
                                                                type="button"
                                                                aria-label={`Kurangi jumlah ${t.value}`}
                                                                disabled={
                                                                    count <= 1
                                                                }
                                                                onClick={() =>
                                                                    setCount(
                                                                        t.value,
                                                                        count -
                                                                            1,
                                                                    )
                                                                }
                                                                className="grid size-8 place-items-center rounded-lg bg-white text-lg font-bold text-[#5B34E6] transition hover:bg-[#F4F1FF] disabled:opacity-40"
                                                            >
                                                                −
                                                            </button>
                                                            <span
                                                                className={`${fontDisplay} flex-1 text-center text-base font-extrabold tabular-nums`}
                                                            >
                                                                {count}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                aria-label={`Tambah jumlah ${t.value}`}
                                                                disabled={
                                                                    count >= 50
                                                                }
                                                                onClick={() =>
                                                                    setCount(
                                                                        t.value,
                                                                        count +
                                                                            1,
                                                                    )
                                                                }
                                                                className="grid size-8 place-items-center rounded-lg bg-white text-lg font-bold text-[#5B34E6] transition hover:bg-[#F4F1FF] disabled:opacity-40"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-2 text-xs text-white/75">
                                        {totalSoal > 0
                                            ? `Total ${totalSoal} soal. Centang tipe lalu atur jumlahnya (1-50 per tipe).`
                                            : 'Centang tipe soal, lalu atur jumlahnya (1-50 per tipe).'}
                                    </p>
                                    <InputError
                                        message={
                                            errors.question_quantities ??
                                            Object.entries(errors).find(
                                                ([key]) =>
                                                    key.startsWith(
                                                        'question_quantities.',
                                                    ),
                                            )?.[1]
                                        }
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend className="mb-2 text-sm font-bold text-white/90">
                                        Durasi ujian
                                    </legend>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {durationPresets.map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                aria-pressed={
                                                    data.duration_minutes === n
                                                }
                                                onClick={() =>
                                                    setData(
                                                        'duration_minutes',
                                                        n,
                                                    )
                                                }
                                                className={`min-h-10 rounded-full px-4 text-sm font-bold transition focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC933] ${
                                                    data.duration_minutes === n
                                                        ? 'bg-[#FFC933] text-[#1B1340]'
                                                        : 'bg-white/15 text-white hover:bg-white/25'
                                                }`}
                                            >
                                                {n} mnt
                                            </button>
                                        ))}
                                        <label
                                            htmlFor="duration_minutes"
                                            className="ml-1 text-sm font-bold text-white/90"
                                        >
                                            Atau isi sendiri:
                                        </label>
                                        <input
                                            id="duration_minutes"
                                            type="number"
                                            min={5}
                                            max={180}
                                            inputMode="numeric"
                                            value={data.duration_minutes}
                                            onChange={(e) =>
                                                setData(
                                                    'duration_minutes',
                                                    Number(e.target.value),
                                                )
                                            }
                                            onBlur={() =>
                                                setData(
                                                    'duration_minutes',
                                                    Math.min(
                                                        180,
                                                        Math.max(
                                                            5,
                                                            data.duration_minutes ||
                                                                30,
                                                        ),
                                                    ),
                                                )
                                            }
                                            className="w-24 rounded-2xl border-2 border-transparent bg-white px-4 py-2.5 text-[15px] font-bold text-[#1B1340] transition outline-none focus:border-[#FFC933] focus:ring-4 focus:ring-[#FFC933]/30"
                                        />
                                        <span className="text-sm font-bold text-white/75">
                                            menit
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-xs text-white/75">
                                        5-180 menit. Siswa menerima waktu sesuai
                                        durasi ini.
                                    </p>
                                    <InputError
                                        message={errors.duration_minutes}
                                    />
                                </fieldset>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`${btn.sun} h-14 w-full text-base sm:w-auto sm:px-8`}
                                >
                                    {processing ? (
                                        <Spinner />
                                    ) : (
                                        <Sparkles className="size-5" />
                                    )}
                                    <span>
                                        {processing
                                            ? 'Menyusun soal...'
                                            : 'Generate soal'}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

GenerateSoalPage.layout = {
    breadcrumbs,
};

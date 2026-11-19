import { Head, Link, usePage } from '@inertiajs/react';
import { Check, ClipboardList, Smartphone, Sparkles } from 'lucide-react';
import {
    Brand,
    btn,
    ExamFonts,
    fontBody,
    fontDisplay,
    optionTone,
} from '@/components/exam/ui';
import { dashboard, login, register } from '@/routes';

const demoOptions = [
    'Energi dalam sistem tertutup selalu tetap',
    'Entropi sistem terisolasi tidak pernah turun',
    'Kalor mengalir dari dingin ke panas',
    'Usaha selalu sama dengan kalor',
];

export default function Welcome() {
    const { auth } = usePage().props;

    const features = [
        {
            Icon: Sparkles,
            tone: 'bg-[#FFC933] text-[#1B1340]',
            title: 'Soal siap dari satu topik',
            body: 'Tempel materi, pilih kelas, dan AI menyusun soal pilihan ganda lengkap dengan kunci jawaban.',
        },
        {
            Icon: Smartphone,
            tone: 'bg-[#1E7FE0] text-white',
            title: 'Siswa ujian dari HP',
            body: 'Cukup masukkan kode 6 angka. Timer, daftar soal, dan tanda ragu-ragu ada dalam satu layar.',
        },
        {
            Icon: ClipboardList,
            tone: 'bg-[#0E9F72] text-white',
            title: 'Nilai langsung terekap',
            body: 'Hasil masuk otomatis ke rekap kelas dan bisa diunduh sebagai file Excel.',
        },
    ];

    return (
        <>
            <Head title="ExIA — Ujian online dengan soal dari AI" />
            <ExamFonts />
            <div
                className={`${fontBody} min-h-dvh bg-[#F4F1FF] text-[#1B1340] antialiased`}
            >
                <section className="overflow-hidden bg-[#5B34E6] text-white">
                    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5 md:px-8 md:pt-7">
                        <Brand />
                        <nav
                            className="flex items-center gap-2"
                            aria-label="Akun"
                        >
                            {auth.user ? (
                                <Link href={dashboard()} className={btn.sun}>
                                    Buka dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-2xl px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className={`${btn.sun} hidden sm:inline-flex`}
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-12 pb-16 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20 lg:pb-24">
                        <div>
                            <h1
                                className={`${fontDisplay} text-[2.6rem] leading-[1.02] font-extrabold tracking-tight md:text-6xl`}
                            >
                                Ujian online yang soalnya disusun AI.
                            </h1>
                            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/85">
                                Guru cukup menulis topik. Siswa mengerjakan
                                lewat HP dengan kode 6 angka. Nilai langsung
                                terekap.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className={`${btn.sun} h-14 px-8 text-base`}
                                    >
                                        Lanjut ke dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className={`${btn.sun} h-14 px-8 text-base`}
                                        >
                                            Masuk dengan akun
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex h-14 items-center rounded-2xl border-2 border-white/40 px-7 text-base font-bold hover:bg-white/10"
                                        >
                                            Buat akun
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Contoh layar ujian siswa */}
                        <div
                            className="mx-auto w-full max-w-[19rem] rotate-2 rounded-[2.5rem] bg-[#1B1340] p-2.5 shadow-[0_10px_0_0_#3A1FB0]"
                            aria-hidden="true"
                        >
                            <div className="overflow-hidden rounded-[2rem] bg-[#F4F1FF] text-[#1B1340]">
                                <div className="flex items-center justify-between bg-[#5B34E6] px-4 py-3 text-white">
                                    <p
                                        className={`${fontDisplay} font-extrabold`}
                                    >
                                        Soal 7
                                        <span className="text-white/70">
                                            {' '}
                                            / 20
                                        </span>
                                    </p>
                                    <span
                                        className={`${fontDisplay} rounded-xl bg-[#FFC933] px-2.5 py-1 text-sm font-extrabold text-[#1B1340]`}
                                    >
                                        42:15
                                    </span>
                                </div>
                                <div className="h-1.5 bg-[#3A1FB0]">
                                    <div className="h-full w-[35%] bg-[#FFC933]" />
                                </div>
                                <div className="space-y-2.5 p-3.5">
                                    <p className="rounded-2xl border-2 border-[#E7E0FF] bg-white p-3.5 text-[13px] leading-snug font-semibold">
                                        Pertanyaan yang akan tentang Hukum
                                        Termodinamika II adalah...
                                    </p>
                                    {demoOptions.map((o, i) => (
                                        <div
                                            key={o}
                                            className={`flex items-center gap-2.5 rounded-2xl border-2 p-2 text-[12px] leading-snug font-semibold ${
                                                i === 1
                                                    ? `${optionTone[i].border} ${optionTone[i].tint}`
                                                    : 'border-[#E7E0FF] bg-white'
                                            }`}
                                        >
                                            <span
                                                className={`${fontDisplay} grid size-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold text-white ${optionTone[i].bg}`}
                                            >
                                                {i === 1 ? (
                                                    <Check
                                                        className="size-4"
                                                        strokeWidth={3.5}
                                                    />
                                                ) : (
                                                    String.fromCharCode(65 + i)
                                                )}
                                            </span>
                                            {o}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
                    <h2
                        className={`${fontDisplay} max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl`}
                    >
                        Dari materi sampai nilai, tanpa ribet.
                    </h2>
                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                        {features.map(({ Icon, tone, title, body }) => (
                            <article
                                key={title}
                                className="rounded-3xl border-2 border-[#E7E0FF] bg-white p-6 shadow-[0_4px_0_0_#E7E0FF]"
                            >
                                <span
                                    className={`grid size-12 place-items-center rounded-2xl ${tone}`}
                                >
                                    <Icon className="size-6" />
                                </span>
                                <h3
                                    className={`${fontDisplay} mt-5 text-xl font-extrabold`}
                                >
                                    {title}
                                </h3>
                                <p className="mt-2 leading-relaxed text-[#4A4170]">
                                    {body}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <footer className="border-t-2 border-[#E7E0FF] px-5 py-8 text-center text-sm text-[#6B6590]">
                    <Brand tone="dark" />
                </footer>
            </div>
        </>
    );
}

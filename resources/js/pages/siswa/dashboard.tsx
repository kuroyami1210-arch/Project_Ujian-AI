import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    Brand,
    btn,
    ExamFonts,
    fontBody,
    fontDisplay,
} from '@/components/exam/ui';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';

type Props = {
    hasActiveExam: boolean;
};

export default function SiswaDashboard({ hasActiveExam }: Props) {
    const { auth } = usePage().props as { auth?: { user?: { name?: string } } };
    const fullName = auth?.user?.name?.trim() ?? '';
    const firstName = fullName.split(/\s+/)[0] || 'Siswa';
    const initial = firstName.charAt(0).toUpperCase();

    return (
        <>
            <Head title="Dashboard Siswa" />
            <ExamFonts />
            <div
                className={`${fontBody} relative flex min-h-dvh flex-col overflow-hidden bg-[#5B34E6] text-white antialiased`}
            >
                {/* Bentuk dekoratif — hanya mengisi ruang kosong di atas kartu */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                >
                    <span className="absolute -top-10 -right-8 size-40 rotate-12 rounded-[2.5rem] bg-[#6B46F0]" />
                    <span className="absolute top-72 -left-12 size-28 rounded-full bg-[#FFC933] opacity-95" />
                    <span className="absolute top-24 right-14 size-6 rounded-full bg-[#FF6B8B]" />
                    <span className="absolute top-64 right-6 size-12 -rotate-12 rounded-2xl bg-[#1E7FE0]" />
                </div>

                <header className="relative flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:pt-8">
                    <Brand />
                    <div className="flex items-center gap-2">
                        <Link
                            href={logout()}
                            as="button"
                            onClick={() => router.flushAll()}
                            className="min-h-10 rounded-full px-4 text-sm font-bold text-white/90 transition hover:bg-white/10 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC933]"
                        >
                            Keluar
                        </Link>
                        <span
                            className={`${fontDisplay} grid size-10 place-items-center rounded-full bg-white text-base font-extrabold text-[#5B34E6]`}
                            title={fullName || undefined}
                            aria-label={
                                fullName
                                    ? `Masuk sebagai ${fullName}`
                                    : 'Akun siswa'
                            }
                        >
                            {initial}
                        </span>
                    </div>
                </header>

                <section className="relative px-5 pt-10 pb-10 md:pb-6 md:text-center">
                    <h1
                        className={`${fontDisplay} text-[2.1rem] leading-[1.05] font-extrabold tracking-tight md:text-5xl`}
                    >
                        Halo, {firstName}.
                        <br />
                        Siap mengerjakan?
                    </h1>
                    <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-white/85 md:mx-auto md:max-w-sm">
                        Masukkan kode dari pengawas untuk membuka soal.
                    </p>
                </section>

                {/* Kartu token: menempel di bawah pada HP (dekat jempol), melayang di tengah pada layar lebar */}
                <main className="relative mt-auto w-full md:mx-auto md:mt-0 md:mb-auto md:max-w-md md:px-5">
                    <div className="rounded-t-[2rem] bg-white px-5 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[#1B1340] shadow-[0_-6px_0_0_rgba(0,0,0,0.12)] md:rounded-[2rem] md:p-8 md:shadow-[0_8px_0_0_rgba(0,0,0,0.18)]">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2
                                className={`${fontDisplay} text-xl font-extrabold`}
                            >
                                Masuk ruang ujian
                            </h2>
                            <span
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                    hasActiveExam
                                        ? 'bg-[#E4F7F0] text-[#07694A]'
                                        : 'bg-[#FFF3CC] text-[#7A5600]'
                                }`}
                            >
                                <span
                                    className={`size-2 rounded-full ${hasActiveExam ? 'bg-[#0E9F72]' : 'bg-[#E0A100]'}`}
                                />
                                {hasActiveExam
                                    ? 'Ruang terbuka'
                                    : 'Belum dibuka'}
                            </span>
                        </div>

                        <Form
                            action="/siswa/masuk"
                            method="post"
                            className="space-y-4"
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div>
                                        <label
                                            htmlFor="exam-token"
                                            className="mb-2 block text-sm font-semibold text-[#4A4170]"
                                        >
                                            Kode ujian
                                        </label>
                                        <input
                                            id="exam-token"
                                            type="text"
                                            name="token"
                                            placeholder="483921"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck={false}
                                            autoFocus
                                            required
                                            aria-describedby="token-hint"
                                            className={`${fontDisplay} h-16 w-full rounded-2xl border-2 border-[#DDD4FF] bg-[#F4F1FF] px-4 text-center text-3xl font-extrabold tracking-[0.12em] text-[#1B1340] transition outline-none placeholder:text-[#B8AEE0] focus:border-[#5B34E6] focus:bg-white focus:ring-4 focus:ring-[#5B34E6]/15`}
                                        />
                                        <p
                                            id="token-hint"
                                            className="mt-2 text-center text-[13px] text-[#6B6590]"
                                        >
                                            6 angka dari layar pengawas.
                                        </p>
                                        <div className="mt-1 text-center">
                                            <InputError
                                                message={errors.token}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || !hasActiveExam}
                                        className={`${btn.primary} h-14 w-full text-base`}
                                    >
                                        {processing && <Spinner />}
                                        <span>Mulai ujian</span>
                                        <ArrowRight className="size-5" />
                                    </button>

                                    {!hasActiveExam && (
                                        <p className="rounded-2xl bg-[#FFF3CC] px-4 py-3 text-center text-[13px] leading-snug font-medium text-[#7A5600]">
                                            Belum ada ruang ujian yang dibuka.
                                            Tunggu pengawas membuka sesi.
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}

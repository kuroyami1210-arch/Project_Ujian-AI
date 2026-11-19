import { Head } from '@inertiajs/react';

/**
 * Sistem desain bersama ExIA (siswa, guru, welcome).
 * Warna: ungu tinta #5B34E6, kuning kunyit #FFC933, latar #F4F1FF, tinta #1B1340.
 * Semua class ditulis utuh agar terbaca oleh scanner Tailwind.
 */

export const fontDisplay =
    "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
export const fontBody = "font-['Figtree',ui-sans-serif,system-ui,sans-serif]";

/** Pasang di setiap halaman: memuat Bricolage Grotesque + Figtree. */
export function ExamFonts() {
    return (
        <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
            />
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&display=swap"
            />
        </Head>
    );
}

const focus =
    'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC933] focus-visible:ring-2 focus-visible:ring-[#1B1340]';

/** Tombol bergaya "timbul" — menekan menurunkan tombol 3px. */
export const btn = {
    primary: `inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5B34E6] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#3A1FB0] transition hover:bg-[#6B46F0] active:translate-y-[3px] active:shadow-[0_1px_0_0_#3A1FB0] disabled:pointer-events-none disabled:opacity-50 ${focus}`,
    sun: `inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFC933] px-5 py-3 text-sm font-bold text-[#1B1340] shadow-[0_4px_0_0_#C99200] transition hover:bg-[#FFD24F] active:translate-y-[3px] active:shadow-[0_1px_0_0_#C99200] disabled:pointer-events-none disabled:opacity-50 ${focus}`,
    mint: `inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0E9F72] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#07694A] transition hover:bg-[#12B183] active:translate-y-[3px] active:shadow-[0_1px_0_0_#07694A] disabled:pointer-events-none disabled:opacity-50 ${focus}`,
    ghost: `inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#DDD4FF] bg-white px-4 py-3 text-sm font-bold text-[#1B1340] transition hover:border-[#5B34E6] hover:bg-[#F4F1FF] active:translate-y-px disabled:pointer-events-none disabled:opacity-40 ${focus}`,
    ink: `inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B1340] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#000] transition hover:bg-[#2B2060] active:translate-y-[3px] active:shadow-[0_1px_0_0_#000] disabled:pointer-events-none disabled:opacity-50 ${focus}`,
};

/** Kartu putih bergaris lilac, bayangan keras tipis. */
export const card =
    'rounded-3xl border-2 border-[#E7E0FF] bg-white shadow-[0_4px_0_0_#E7E0FF]';

export function Brand({
    tone = 'light',
    className = '',
}: {
    tone?: 'light' | 'dark';
    className?: string;
}) {
    const text = tone === 'light' ? 'text-white' : 'text-[#1B1340]';
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-[10px] bg-[#FFC933] shadow-[0_3px_0_0_#C99200]"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="#1B1340"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
            </span>
            <span
                className={`${fontDisplay} text-xl font-extrabold tracking-tight ${text}`}
            >
                ExIA
            </span>
        </span>
    );
}

/** Warna 4 pilihan jawaban: A ungu, B biru, C hijau, D merah muda. */
export const optionTone = [
    {
        bg: 'bg-[#5B34E6]',
        border: 'border-[#5B34E6]',
        tint: 'bg-[#F1ECFF]',
        ring: 'shadow-[0_4px_0_0_#3A1FB0]',
    },
    {
        bg: 'bg-[#1E7FE0]',
        border: 'border-[#1E7FE0]',
        tint: 'bg-[#E8F2FD]',
        ring: 'shadow-[0_4px_0_0_#0F55A3]',
    },
    {
        bg: 'bg-[#0E9F72]',
        border: 'border-[#0E9F72]',
        tint: 'bg-[#E4F7F0]',
        ring: 'shadow-[0_4px_0_0_#07694A]',
    },
    {
        bg: 'bg-[#D8325A]',
        border: 'border-[#D8325A]',
        tint: 'bg-[#FDEAEF]',
        ring: 'shadow-[0_4px_0_0_#9C1B3C]',
    },
] as const;

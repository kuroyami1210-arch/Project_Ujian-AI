import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/**
 * Layout login/daftar bertema ExIA.
 * HP: header ungu, formulir naik sebagai kartu dari bawah.
 * Layar lebar: dua kolom — sisi ungu berisi merek, sisi putih berisi formulir.
 */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#5B34E6] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(28rem,34rem)]">
            {/* Sisi merek */}
            <div className="relative px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                >
                    <span className="absolute -top-10 -right-10 size-40 rotate-12 rounded-[2.5rem] bg-[#6B46F0]" />
                    <span className="absolute top-24 right-16 size-5 rounded-full bg-[#FF6B8B] lg:top-auto lg:right-24 lg:bottom-40 lg:size-8" />
                    <span className="absolute hidden size-52 rounded-full bg-[#FFC933] lg:-bottom-16 lg:-left-16 lg:block" />
                    <span className="absolute hidden size-16 -rotate-12 rounded-2xl bg-[#1E7FE0] lg:bottom-56 lg:left-40 lg:block" />
                </div>

                <Link
                    href={home()}
                    className="relative inline-flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight"
                >
                    <span className="grid size-10 place-items-center rounded-xl bg-[#FFC933] text-[#1B1340] shadow-[0_3px_0_0_#C99200]">
                        <AppLogoIcon className="size-6" />
                    </span>
                    ExIA
                </Link>

                <p className="relative mt-8 hidden max-w-md font-display text-5xl leading-[1.05] font-extrabold tracking-tight lg:block">
                    Ujian online yang soalnya disusun AI.
                </p>
            </div>

            {/* Sisi formulir */}
            <main className="relative flex flex-1 flex-col justify-start rounded-t-[2rem] bg-background px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-6px_0_0_rgba(0,0,0,0.12)] md:px-10 lg:justify-center lg:rounded-none lg:px-12 lg:shadow-none">
                <div className="mx-auto w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="space-y-2">
                            <h1 className="font-display text-3xl font-extrabold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-[15px] text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

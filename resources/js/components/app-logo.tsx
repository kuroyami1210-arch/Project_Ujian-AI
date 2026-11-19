import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_3px_0_0_#C99200]">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate font-display text-xl leading-tight font-extrabold tracking-tight">
                    {name}
                </span>
            </div>
        </>
    );
}

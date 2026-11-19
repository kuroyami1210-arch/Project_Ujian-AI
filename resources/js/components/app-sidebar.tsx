import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    Sparkles,
    TableProperties,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const guruNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/guru',
        icon: LayoutGrid,
    },
    {
        title: 'Generate Soal',
        href: '/guru/generate',
        icon: Sparkles,
    },
    {
        title: 'Rekap Nilai',
        href: '/guru/rekap',
        icon: TableProperties,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Kelola Akun',
        href: '/admin/akun',
        icon: Users,
    },
];

const siswaNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/siswa',
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repositori',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Dokumentasi',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;
    const items =
        role === 'admin'
            ? adminNavItems
            : role === 'guru'
              ? guruNavItems
              : siswaNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

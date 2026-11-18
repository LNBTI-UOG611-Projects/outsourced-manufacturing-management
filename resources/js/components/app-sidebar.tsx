import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import type { CSSProperties } from 'react';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';

/* Blue sidebar theme. Set on the panel itself so it also applies inside the
   mobile drawer, which renders outside the page layout. */
const sidebarTheme = {
    '--sidebar': '#1d4ed8',
    '--sidebar-foreground': '#eff6ff',
    '--sidebar-primary': '#ef4444',
    '--sidebar-primary-foreground': '#ffffff',
    '--sidebar-accent': 'rgba(255, 255, 255, 0.14)',
    '--sidebar-accent-foreground': '#ffffff',
    '--sidebar-border': 'rgba(255, 255, 255, 0.18)',
    '--sidebar-ring': '#ffffff',
} as CSSProperties;

export function AppSidebar() {
    const { url } = usePage();
    const { setOpenMobile } = useSidebar();
    const dashboardRoute = dashboard();
    const isDashboard = url.split('?')[0] === dashboardRoute.url;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <div
                style={sidebarTheme}
                className="flex h-full min-h-0 flex-col bg-blue-700 text-blue-50"
            >
                <SidebarHeader className="border-b border-white/15">
                    <div className="flex min-h-12 items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                        <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-lg bg-red-500 text-xs font-bold text-white shadow-sm shadow-blue-900/30"
                        >
                            AB
                        </span>
                        <span className="truncate text-sm font-semibold tracking-wide text-white group-data-[collapsible=icon]:sr-only">
                            AMSEF BRIDEPORT
                        </span>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isDashboard}
                                        tooltip="Dashboard"
                                        className="h-10 rounded-lg text-blue-50 transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:font-semibold data-[active=true]:text-blue-700 data-[active=true]:hover:bg-white data-[active=true]:hover:text-blue-700"
                                    >
                                        <Link
                                            href={dashboardRoute}
                                            aria-current={
                                                isDashboard ? 'page' : undefined
                                            }
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <LayoutGrid aria-hidden="true" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-white/15">
                    <NavUser />
                </SidebarFooter>
            </div>
        </Sidebar>
    );
}

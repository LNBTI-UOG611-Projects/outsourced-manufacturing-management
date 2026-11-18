import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) {
        return null;
    }

    return (
        <SidebarMenu className="border-t-0">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group /* Avatar circle red, initials white */ /* Force icon inside trigger to blue */ rounded-xl border border-slate-200/80 bg-white font-bold text-blue-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-blue-50/70 hover:text-blue-800 focus-visible:ring-4 focus-visible:ring-blue-600/15 focus-visible:outline-none active:bg-blue-50 data-[state=open]:border-slate-300 data-[state=open]:bg-blue-50/80 data-[state=open]:text-blue-800 [&_.rounded-full]:!bg-red-600 [&_.rounded-full]:!text-white [&_[data-slot=avatar]]:!bg-red-600 [&_[data-slot=avatar]]:!text-white [&_span]:font-bold [&_span]:text-blue-700 group-hover:[&_span]:text-blue-800 [&_span.flex]:!bg-red-600 [&_span.flex]:!text-white [&_span:last-child]:font-semibold [&_span:last-child]:text-blue-700/80 [&_svg]:!text-blue-700"
                            data-test="sidebar-menu-button"
                        >
                            <div className="flex flex-1 items-center gap-2.5 text-left">
                                <UserInfo user={auth.user} />
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-blue-700 transition-colors group-hover:text-blue-800" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="/* Force all icons in dropdown to blue */ /* Avatar inside the dropdown popover */ w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-2xl border border-slate-200/80 bg-white p-1.5 font-bold text-blue-700 shadow-xl shadow-slate-900/5 [&_*[role=separator]]:my-1 [&_*[role=separator]]:h-px [&_*[role=separator]]:border-0 [&_*[role=separator]]:bg-slate-100 [&_.rounded-full]:!bg-red-600 [&_.rounded-full]:!text-white [&_[data-slot=avatar]]:!bg-red-600 [&_[data-slot=avatar]]:!text-white [&_a]:rounded-xl [&_a]:font-bold [&_a]:text-blue-700 [&_a:focus]:bg-blue-50/80 [&_a:focus]:text-blue-800 [&_a:hover]:bg-blue-50/80 [&_a:hover]:text-blue-800 [&_button]:rounded-xl [&_button]:font-bold [&_button]:text-blue-700 [&_button:focus]:bg-blue-50/80 [&_button:focus]:text-blue-800 [&_button:hover]:bg-blue-50/80 [&_button:hover]:text-blue-800 [&_div[role=menuitem]]:rounded-xl [&_div[role=menuitem]]:font-bold [&_div[role=menuitem]]:text-blue-700 [&_div[role=menuitem][data-highlighted]]:bg-blue-50/80 [&_div[role=menuitem][data-highlighted]]:text-blue-800 [&_span]:font-bold [&_span]:text-blue-700 [&_span.flex]:!bg-red-600 [&_span.flex]:!font-bold [&_span.flex]:!text-white [&_svg]:!text-blue-700"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

import { SidebarTrigger } from '@/components/ui/sidebar';

export default function DashboardTitle({ title }: { title: string }) {
    return (
        <div className="flex w-full items-center gap-3 bg-red-600 px-6 py-4 shadow-sm">
            <SidebarTrigger className="shrink-0 text-white hover:bg-red-700 hover:text-white focus-visible:ring-4 focus-visible:ring-white/25" />
            <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
    );
}

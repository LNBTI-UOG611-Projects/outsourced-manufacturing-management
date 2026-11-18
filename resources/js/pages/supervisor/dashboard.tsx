import { Head } from '@inertiajs/react';
import DashboardTitle from '@/components/dashboard-title';

export default function DriverDashboard() {
    return (
        <main className="min-h-dvh w-full space-y-6 bg-white p-6 text-black">
            <Head title="Supervisor Dashboard" />
            <DashboardTitle title="Supervisor Dashboard" />
            <p className="text-base text-black">
                Test page for the Supervisor role.
            </p>
        </main>
    );
}

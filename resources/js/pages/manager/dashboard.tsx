import { Head } from '@inertiajs/react';
import DashboardTitle from '@/components/dashboard-title';

export default function DriverDashboard() {
    return (
        <main className="min-h-dvh w-full space-y-6 bg-white p-6 text-black">
            <Head title="Manager Dashboard" />
            <DashboardTitle title="Manager Dashboard" />
            <p className="text-base text-black">
                Test page for the Manager role.
            </p>
        </main>
    );
}

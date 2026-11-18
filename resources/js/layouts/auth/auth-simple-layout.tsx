import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main
            aria-labelledby="auth-title"
            className="grid min-h-dvh place-items-center bg-white px-5 py-10 text-slate-900 sm:bg-gradient-to-br sm:from-slate-50 sm:via-blue-50/60 sm:to-red-50/50 sm:px-6 md:px-8"
        >
            <div className="relative w-full max-w-md overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200/80 sm:p-7 sm:shadow-xl sm:shadow-slate-900/5 md:p-10">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 hidden h-1 bg-gradient-to-r from-blue-600 to-red-500 sm:block"
                />

                <header className="mb-8 space-y-2 text-center">
                    <h1
                        id="auth-title"
                        className="text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:text-3xl"
                    >
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm leading-relaxed text-balance text-slate-500 sm:text-base">
                            {description}
                        </p>
                    )}
                </header>

                {children}
            </div>
        </main>
    );
}

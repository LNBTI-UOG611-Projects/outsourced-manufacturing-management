import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    return (
        <>
            <Head title="Confirm your password" />

            <form
                className="space-y-5"
                onSubmit={(event) => {
                    event.preventDefault();

                    post('/user/confirm-password', {
                        onFinish: () => reset('password'),
                    });
                }}
            >
                <div className="grid gap-2">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Current password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={
                            errors.password ? 'password-error' : undefined
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-600/15 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/15"
                        required
                    />
                    {errors.password && (
                        <p
                            id="password-error"
                            role="alert"
                            className="text-sm text-red-600"
                        >
                            {errors.password}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="h-12 w-full rounded-xl bg-blue-600 px-4 text-base font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 focus-visible:outline-none active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {processing ? 'Confirming…' : 'Confirm password'}
                </button>
            </form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm your password',
    description: 'Enter your current password to continue.',
};
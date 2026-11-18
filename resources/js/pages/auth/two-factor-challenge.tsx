import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function TwoFactorChallenge() {
    const [usingRecoveryCode, setUsingRecoveryCode] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            code: '',
            recovery_code: '',
        });

    const field = usingRecoveryCode ? 'recovery_code' : 'code';
    const label = usingRecoveryCode ? 'Recovery code' : 'Authenticator code';
    const error = errors[field] ?? errors.code ?? errors.recovery_code;

    return (
        <>
            <Head title="Two-factor authentication" />

            {/* The layout draws the card and the title. This line changes with
                the mode, so it lives here and is pulled up under the title. */}
            <p className="-mt-6 mb-6 text-center text-sm leading-relaxed text-balance text-slate-500 sm:text-base">
                {usingRecoveryCode
                    ? 'Enter one of your unused recovery codes.'
                    : 'Enter the 6-digit code from your authenticator app.'}
            </p>

            <form
                className="space-y-5"
                onSubmit={(event) => {
                    event.preventDefault();

                    post('/two-factor-challenge', {
                        onFinish: () => reset(),
                    });
                }}
            >
                <div className="grid gap-2">
                    <label
                        htmlFor="two-factor-code"
                        className="block text-sm font-medium text-slate-700"
                    >
                        {label}
                    </label>

                    <input
                        id="two-factor-code"
                        name={field}
                        type="text"
                        inputMode={usingRecoveryCode ? 'text' : 'numeric'}
                        autoComplete={
                            usingRecoveryCode ? 'off' : 'one-time-code'
                        }
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder={
                            usingRecoveryCode ? 'Enter recovery code' : '000000'
                        }
                        maxLength={usingRecoveryCode ? undefined : 6}
                        pattern={usingRecoveryCode ? undefined : '[0-9]{6}'}
                        value={data[field]}
                        onChange={(event) => setData(field, event.target.value)}
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error ? 'two-factor-code-error' : undefined
                        }
                        className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-600/15 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/15 ${usingRecoveryCode
                                ? ''
                                : 'text-center text-xl font-medium tracking-[0.4em]'
                            }`}
                        required
                    />

                    {error && (
                        <p
                            id="two-factor-code-error"
                            role="alert"
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="h-12 w-full rounded-xl bg-blue-600 px-4 text-base font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 focus-visible:outline-none active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {processing ? 'Verifying…' : 'Verify and sign in'}
                </button>

                <div className="flex justify-center">
                    <button
                        type="button"
                        disabled={processing}
                        className="inline-flex min-h-11 items-center rounded px-2 text-sm font-medium text-blue-600 no-underline transition-colors hover:text-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                            reset();
                            clearErrors();
                            setUsingRecoveryCode((current) => !current);
                        }}
                    >
                        {usingRecoveryCode
                            ? 'Use an authenticator code'
                            : 'Use a recovery code'}
                    </button>
                </div>
            </form>
        </>
    );
}

TwoFactorChallenge.layout = {
    title: 'Verify your sign-in',
};
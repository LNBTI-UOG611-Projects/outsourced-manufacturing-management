import { Form, Head } from '@inertiajs/react';
import { useState, type PropsWithChildren } from 'react';
import ForgotPasswordDialog from '../../components/forgot-password-dialog';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const fieldClass =
    'h-12 rounded-xl border-slate-200 bg-slate-50 text-base text-slate-900 shadow-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-600/15 aria-invalid:border-red-500 aria-invalid:ring-red-500/15 md:text-base';

function LoginLayout({ children }: PropsWithChildren) {
    return (
        <main
            aria-labelledby="login-title"
            className="grid min-h-dvh place-items-center bg-white px-5 py-10 text-slate-900 sm:bg-gradient-to-br sm:from-slate-50 sm:via-blue-50/60 sm:to-red-50/50 sm:px-8"
        >
            <div className="relative w-full max-w-md overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200/80 sm:p-8 sm:shadow-xl sm:shadow-slate-900/5 md:p-10">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 hidden h-1 bg-gradient-to-r from-blue-600 to-red-500 sm:block"
                />
                {children}
            </div>
        </main>
    );
}

export default function Login({ status, canResetPassword }: Props) {
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    return (
        <>
            <Head title="Sign in" />

            <header className="mb-8 space-y-2 text-center">
                <h1
                    id="login-title"
                    className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                >
                    Sign in
                </h1>
                <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Enter your email address and password to continue.
                </p>
            </header>

            {status && (
                <p
                    role="status"
                    className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
                >
                    {status}
                </p>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                autoComplete="off"
                className="space-y-5"
            >
                {({ processing, errors }) => {
                    const invalidCredentials =
                        errors.email ===
                        'These credentials do not match our records.';
                    const emailError = invalidCredentials
                        ? undefined
                        : errors.email;

                    return (
                        <>
                            {invalidCredentials && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    We couldn’t sign you in. Check your email
                                    and password, then try again.
                                </p>
                            )}

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="name@example.com"
                                    aria-invalid={Boolean(emailError)}
                                    aria-describedby={
                                        emailError ? 'email-error' : undefined
                                    }
                                    className={fieldClass}
                                />
                                {emailError && (
                                    <p
                                        id="email-error"
                                        role="alert"
                                        className="text-sm text-red-600"
                                    >
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Enter your password"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : undefined
                                    }
                                    className={fieldClass}
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

                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                <div className="flex min-h-11 items-center gap-2.5">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        className="size-5 rounded border-slate-300 focus-visible:ring-4 focus-visible:ring-blue-600/15 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="inline-flex min-h-11 cursor-pointer items-center text-sm font-normal text-slate-700"
                                    >
                                        Remember me
                                    </Label>
                                </div>

                                {canResetPassword && (
                                    <button
                                        type="button"
                                        aria-haspopup="dialog"
                                        aria-controls={
                                            showForgotPassword
                                                ? 'forgot-password-dialog'
                                                : undefined
                                        }
                                        onClick={() =>
                                            setShowForgotPassword(true)
                                        }
                                        className="inline-flex min-h-11 items-center rounded text-sm font-medium text-blue-600 no-underline hover:text-blue-700 hover:no-underline focus-visible:ring-4 focus-visible:ring-blue-600/15 focus-visible:outline-none"
                                    >
                                        Forgot your password?
                                    </button>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                data-test="login-button"
                                className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                {processing ? 'Signing in…' : 'Sign in'}
                            </Button>
                        </>
                    );
                }}
            </Form>

            {canResetPassword && showForgotPassword && (
                <ForgotPasswordDialog
                    onClose={() => setShowForgotPassword(false)}
                />
            )}
        </>
    );
}

Login.layout = [LoginLayout];
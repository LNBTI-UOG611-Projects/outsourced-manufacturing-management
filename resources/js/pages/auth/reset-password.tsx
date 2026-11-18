import { Form, Head } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

/* Same field styling as the login page */
const fieldClass =
    'h-12 rounded-xl border-slate-200 bg-slate-50 text-base text-slate-900 shadow-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-600/15 aria-invalid:border-red-500 aria-invalid:ring-red-500/15 md:text-base';

/* Locked (read-only) email: slightly darker, no hover/focus highlight */
const readOnlyFieldClass =
    'h-12 cursor-default rounded-xl border-slate-200 bg-slate-100 text-base text-slate-600 shadow-none focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-400/15 md:text-base';

function ResetLayout({ children }: PropsWithChildren) {
    return (
        <main
            aria-labelledby="reset-title"
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

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Reset password" />

            <header className="mb-8 space-y-2 text-center">
                <h1
                    id="reset-title"
                    className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                >
                    Reset password
                </h1>
                <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    Please enter your new password below
                </p>
            </header>

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-medium text-slate-700"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className={readOnlyFieldClass}
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="text-sm text-red-600"
                            />
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
                                autoComplete="new-password"
                                className={fieldClass}
                                autoFocus
                                placeholder="Password"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password}
                                className="text-sm text-red-600"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-sm font-medium text-slate-700"
                            >
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className={fieldClass}
                                placeholder="Confirm password"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="text-sm text-red-600"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-1 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = [ResetLayout];

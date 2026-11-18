import { Form } from '@inertiajs/react';
import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { email } from '@/routes/password';

type Props = {
    onClose: () => void;
};

/* Same field styling as the login page */
const fieldClass =
    'h-12 rounded-xl border-slate-200 bg-slate-50 text-base text-slate-900 shadow-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-600/15 aria-invalid:border-red-500 aria-invalid:ring-red-500/15 md:text-base';

export default function ForgotPasswordDialog({ onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (dialog && !dialog.open) {
            dialog.showModal();
            emailRef.current?.focus();
        }
    }, []);

    return (
        <dialog
            id="forgot-password-dialog"
            ref={dialogRef}
            onClose={onClose}
            aria-labelledby="forgot-password-title"
            aria-describedby="forgot-password-description"
            className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/10 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
        >
            {/* Accent line, matches the login card */}
            <div
                aria-hidden="true"
                className="h-1 bg-gradient-to-r from-blue-600 to-red-500"
            />

            <div className="p-5 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <h2
                            id="forgot-password-title"
                            className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
                        >
                            Forgot your password?
                        </h2>
                        <p
                            id="forgot-password-description"
                            className="text-sm leading-relaxed text-slate-500 sm:text-base"
                        >
                            Enter your email address and we’ll send you a link
                            to reset your password.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        aria-label="Close password reset dialog"
                        className="-mt-2 -mr-2 size-11 shrink-0 rounded-full bg-transparent text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-blue-600/15"
                        onClick={() => dialogRef.current?.close()}
                    >
                        <X aria-hidden="true" className="size-5" />
                    </Button>
                </div>

                <Form
                    {...email.form()}
                    errorBag="forgotPassword"
                    onSuccess={() => dialogRef.current?.close()}
                    autoComplete="off"
                    className="mt-6 space-y-5 sm:mt-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="forgot-password-email"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="forgot-password-email"
                                    ref={emailRef}
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="name@example.com"
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email
                                            ? 'forgot-password-email-error'
                                            : undefined
                                    }
                                    className={fieldClass}
                                />
                                {errors.email && (
                                    <div
                                        id="forgot-password-email-error"
                                        role="alert"
                                        className="text-sm text-red-600"
                                    >
                                        <InputError message={errors.email} />
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && (
                                    <LoaderCircle
                                        aria-hidden="true"
                                        className="size-4 animate-spin"
                                    />
                                )}
                                {processing ? 'Sending…' : 'Send reset link'}
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </dialog>
    );
}

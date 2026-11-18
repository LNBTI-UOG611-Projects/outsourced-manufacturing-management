import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <p
                    role="status"
                    className="mb-4 rounded-lg border bg-muted px-4 py-3 text-sm"
                >
                    {status}
                </p>
            )}

            <Form {...email.form()} className="space-y-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                placeholder="name@example.com"
                                required
                                aria-invalid={Boolean(errors.email)}
                                className="h-12 rounded-lg"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-12 w-full rounded-lg"
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? 'Sending…' : 'Send reset link'}
                        </Button>
                    </>
                )}
            </Form>

            <p className="mt-5 text-center text-sm">
                <TextLink href={login()}>Back to sign in</TextLink>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div
                    role="status"
                    className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm leading-relaxed font-medium text-blue-800"
                >
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="space-y-4 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto inline-flex min-h-11 items-center justify-center rounded px-2 text-sm font-medium text-red-600 no-underline transition-colors hover:text-red-700 hover:no-underline focus-visible:ring-4 focus-visible:ring-red-600/15 focus-visible:outline-none"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
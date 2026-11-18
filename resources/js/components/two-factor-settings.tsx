import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type TwoFactorStatus = 'disabled' | 'pending' | 'enabled';

type Props = {
    initialStatus: TwoFactorStatus;
};

const setupUrl = '/user/two-factor-authentication';

async function fortifyRequest(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: { code: string },
): Promise<Response> {
    const headers = new Headers({ Accept: 'application/json' });

    if (method !== 'GET') {
        const prefix = 'XSRF-TOKEN=';
        const cookie = document.cookie
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(prefix));

        if (cookie) {
            headers.set(
                'X-XSRF-TOKEN',
                decodeURIComponent(cookie.slice(prefix.length)),
            );
        }
    }

    const options: RequestInit = {
        method,
        headers,
        credentials: 'same-origin',
    };

    if (method !== 'GET' && body !== undefined) {
        headers.set('Content-Type', 'application/json');
        options.body = JSON.stringify(body);
    }

    const response = await fetch(path, options);

    if (response.status === 423) {
        throw new Error(
            'Confirm your password using the link below, then return to Security settings and try again.',
        );
    }

    if (
        response.status === 401 ||
        response.status === 419 ||
        response.redirected
    ) {
        throw new Error('Refresh this page or sign in again, then retry.');
    }

    if (response.status === 422) {
        const result: { errors?: { code?: string[] } } = await response.json();

        throw new Error(
            result.errors?.code?.[0] ??
                'Check the authenticator code and try again.',
        );
    }

    if (!response.ok) {
        throw new Error(
            `The request failed (${response.status}). Please try again.`,
        );
    }

    return response;
}

export default function TwoFactorSettings({ initialStatus }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [qrSvg, setQrSvg] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function run(action: () => Promise<void>) {
        setBusy(true);
        setError('');

        try {
            await action();
        } catch (problem) {
            setError(
                problem instanceof Error
                    ? problem.message
                    : 'Something went wrong. Please try again.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function loadQrCode() {
        const response = await fortifyRequest('/user/two-factor-qr-code');
        const result: { svg?: string } = await response.json();

        if (!result.svg) {
            throw new Error(
                'Could not load the QR code. Refresh and try again.',
            );
        }

        setQrSvg(result.svg);
    }

    async function enable() {
        await fortifyRequest(setupUrl, 'POST');
        setStatus('pending');
        await loadQrCode();
    }

    async function confirm() {
        await fortifyRequest(
            '/user/confirmed-two-factor-authentication',
            'POST',
            { code },
        );

        setStatus('enabled');
        setCode('');
        setQrSvg(null);
    }

    async function showRecoveryCodes() {
        const response = await fortifyRequest(
            '/user/two-factor-recovery-codes',
        );
        const codes: string[] = await response.json();

        setRecoveryCodes(codes);
    }

    async function disable() {
        await fortifyRequest(setupUrl, 'DELETE');

        setStatus('disabled');
        setQrSvg(null);
        setCode('');
        setRecoveryCodes([]);
    }

    return (
        <section className="space-y-4 border-t pt-6" aria-busy={busy}>
            <Heading
                variant="small"
                title="Two-factor authentication"
                description="Protect your account with a code from an authenticator app."
            />

            <p className="text-sm" role="status">
                {status === 'enabled'
                    ? 'Enabled'
                    : status === 'pending'
                      ? 'Setup incomplete'
                      : 'Disabled'}
            </p>

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}

            <a href="/user/confirm-password" className="text-sm underline">
                Confirm your password if prompted
            </a>

            {status === 'disabled' && (
                <div>
                    <Button
                        type="button"
                        disabled={busy}
                        onClick={() => void run(enable)}
                    >
                        Enable 2FA
                    </Button>
                </div>
            )}

            {status === 'pending' && (
                <div className="space-y-4">
                    {qrSvg ? (
                        <img
                            alt="Scan this QR code with your authenticator app"
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`}
                            className="h-40 w-40 rounded-md bg-white p-2"
                        />
                    ) : (
                        <Button
                            type="button"
                            disabled={busy}
                            onClick={() => void run(loadQrCode)}
                        >
                            Show setup QR code
                        </Button>
                    )}

                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void run(confirm);
                        }}
                    >
                        <Label htmlFor="two-factor-setup-code">
                            Authenticator code
                        </Label>

                        <input
                            id="two-factor-setup-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            required
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            className="block w-full max-w-xs rounded-md border bg-background p-2"
                        />

                        <Button type="submit" disabled={busy}>
                            Verify and enable 2FA
                        </Button>
                    </form>
                </div>
            )}

            {status === 'enabled' && (
                <div className="space-y-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                            if (recoveryCodes.length > 0) {
                                setRecoveryCodes([]);
                            } else {
                                void run(showRecoveryCodes);
                            }
                        }}
                    >
                        {recoveryCodes.length > 0
                            ? 'Hide recovery codes'
                            : 'Show recovery codes'}
                    </Button>

                    {recoveryCodes.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm">
                                Save these codes somewhere private.
                            </p>

                            <ul className="space-y-1 font-mono text-sm">
                                {recoveryCodes.map((recoveryCode) => (
                                    <li key={recoveryCode}>{recoveryCode}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {status !== 'disabled' && (
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void run(disable)}
                    >
                        {status === 'pending' ? 'Cancel setup' : 'Disable 2FA'}
                    </Button>
                </div>
            )}
        </section>
    );
}

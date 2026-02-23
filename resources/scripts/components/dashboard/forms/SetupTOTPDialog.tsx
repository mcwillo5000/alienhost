import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/elements/dialog';
import getTwoFactorTokenData, { TwoFactorTokenData } from '@/api/account/getTwoFactorTokenData';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import QRCode from 'qrcode.react';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import Spinner from '@/components/elements/Spinner';
import { Input } from '@/components/elements/inputs';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import enableAccountTwoFactor from '@/api/account/enableAccountTwoFactor';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';

interface Props {
    onTokens: (tokens: string[]) => void;
    open: boolean;
    onClose: () => void;
}

const ConfigureTwoFactorForm = ({ onTokens, open, onClose }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [value, setValue] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState<TwoFactorTokenData | null>(null);
    const { clearAndAddHttpError } = useFlashKey('account:two-step');
    const updateUserData = useStoreActions((actions: Actions<ApplicationStore>) => actions.user.updateUserData);

    useEffect(() => {
        getTwoFactorTokenData()
            .then(setToken)
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (submitting) return;

        setSubmitting(true);
        clearAndAddHttpError();
        enableAccountTwoFactor(value, password)
            .then((tokens) => {
                updateUserData({ useTotp: true });
                onTokens(tokens);
            })
            .catch((error) => {
                clearAndAddHttpError(error);
                setSubmitting(false);
            });
    };

    if (!open) {
        return null;
    }

    return (
        <form id={'enable-totp-form'} onSubmit={submit}>
            <FlashMessageRender byKey={'account:two-step'} className={'mt-4'} />
            <div 
                css={tw`flex items-center justify-center w-56 h-56 p-2 mx-auto mt-6 shadow rounded`}
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--theme-border)',
                }}
            >
                {!token ? (
                    <Spinner />
                ) : (
                    <QRCode 
                        renderAs={'svg'} 
                        value={token.image_url_data} 
                        css={tw`w-full h-full shadow-none`}
                        fgColor="#000000"
                        bgColor="#ffffff"
                    />
                )}
            </div>
            <CopyOnClick text={token?.secret}>
                <p className={'font-mono text-sm text-gray-100 text-center mt-2'}>
                    {token?.secret.match(/.{1,4}/g)!.join(' ') || 'Loading...'}
                </p>
            </CopyOnClick>
            <p id={'totp-code-description'} className={'mt-6'}>
                Scan the QR code above using the two-step authentication app of your choice. Then, enter the 6-digit
                code generated into the field below.
            </p>
            <Input.Text
                aria-labelledby={'totp-code-description'}
                variant={Input.Text.Variants.Loose}
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
                className={'mt-3'}
                placeholder={'000000'}
                type={'text'}
                inputMode={'numeric'}
                autoComplete={'one-time-code'}
                pattern={'\\d{6}'}
            />
            <label htmlFor={'totp-password'} className={'block mt-3'}>
                Account Password
            </label>
            <Input.Text
                variant={Input.Text.Variants.Loose}
                className={'mt-1'}
                type={'password'}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <div 
                css={tw`flex justify-end mt-6 space-x-2`}
            >
                <Button
                    type={'button'}
                    size={Options.Size.Compact}
                    onClick={onClose}
                    css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium transition-colors`}
                    style={{
                        backgroundColor: 'var(--theme-background-secondary)',
                        color: 'var(--theme-text-base)',
                        border: '1px solid var(--theme-border)',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    disabled={!token || value.length !== 6 || !password.length}
                    type={'submit'}
                    size={Options.Size.Compact}
                    form={'enable-totp-form'}
                    css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium transition-colors`}
                    style={{
                        backgroundColor: !token || value.length !== 6 || !password.length 
                            ? 'var(--theme-background-muted)' 
                            : 'var(--theme-primary)',
                        color: !token || value.length !== 6 || !password.length 
                            ? 'var(--theme-text-muted)' 
                            : 'var(--theme-text-inverted)',
                        cursor: !token || value.length !== 6 || !password.length ? 'not-allowed' : 'pointer',
                    }}
                >
                    {submitting && <Spinner css={tw`w-4 h-4 mr-2`} />}
                    Enable
                </Button>
            </div>
        </form>
    );
};

export default ConfigureTwoFactorForm;
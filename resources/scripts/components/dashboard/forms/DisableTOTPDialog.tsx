import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import { Input } from '@/components/elements/inputs';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import disableAccountTwoFactor from '@/api/account/disableAccountTwoFactor';
import { useFlashKey } from '@/plugins/useFlash';
import { useStoreActions } from '@/state/hooks';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

interface Props {
    open: boolean;
    onClose: () => void;
}

const DisableTOTPDialog = ({ open, onClose }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [password, setPassword] = useState('');
    const { clearAndAddHttpError } = useFlashKey('account:two-step');
    const updateUserData = useStoreActions((actions) => actions.user.updateUserData);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (submitting) return;

        setSubmitting(true);
        clearAndAddHttpError();
        disableAccountTwoFactor(password)
            .then(() => {
                updateUserData({ useTotp: false });
                onClose();
            })
            .catch(clearAndAddHttpError)
            .then(() => setSubmitting(false));
    };

    if (!open) {
        return null;
    }

    return (
        <div>
            <div css={tw`mb-4`}>
                <h3 
                    css={tw`text-lg font-semibold mb-2`}
                    style={{ color: 'var(--theme-text-base)' }}
                >
                    Disable Two-Step Verification
                </h3>
                <p 
                    css={tw`text-sm`}
                    style={{ color: 'var(--theme-text-muted)' }}
                >
                    Disabling two-step verification will make your account less secure.
                </p>
            </div>
            <form id={'disable-totp-form'} css={tw`mt-6`} onSubmit={submit}>
                <FlashMessageRender byKey={'account:two-step'} css={tw`-mt-2 mb-6`} />
                <label 
                    css={tw`block pb-1`} 
                    htmlFor={'totp-password'} 
                    style={{ color: 'var(--theme-text-base)' }}
                >
                    Password
                </label>
                <Input.Text
                    id={'totp-password'}
                    type={'password'}
                    variant={Input.Text.Variants.Loose}
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <div css={tw`flex justify-end mt-6 space-x-2`}>
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
                        type={'submit'} 
                        form={'disable-totp-form'} 
                        size={Options.Size.Compact}
                        disabled={submitting || !password.length}
                        css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium transition-colors`}
                        style={{
                            backgroundColor: submitting || !password.length 
                                ? 'var(--theme-background-muted)' 
                                : 'var(--theme-danger)',
                            color: submitting || !password.length 
                                ? 'var(--theme-text-muted)' 
                                : 'var(--theme-text-inverted)',
                            cursor: submitting || !password.length ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Disable
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DisableTOTPDialog;

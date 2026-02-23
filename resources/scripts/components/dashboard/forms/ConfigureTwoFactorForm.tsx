import React, { useEffect, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import FuturisticFormButton from '@/components/elements/rivion/FuturisticFormButton';
import SetupTOTPDialog from '@/components/dashboard/forms/SetupTOTPDialog';
import RecoveryTokensDialog from '@/components/dashboard/forms/RecoveryTokensDialog';
import DisableTOTPDialog from '@/components/dashboard/forms/DisableTOTPDialog';
import { useFlashKey } from '@/plugins/useFlash';
import { useTranslation } from 'react-i18next';

export default () => {
    const [tokens, setTokens] = useState<string[]>([]);
    const [visible, setVisible] = useState<'enable' | 'disable' | null>(null);
    const isEnabled = useStoreState((state: ApplicationStore) => state.user.data!.useTotp);
    const { clearAndAddHttpError } = useFlashKey('account:two-step');
    const { t } = useTranslation();

    useEffect(() => {
        return () => {
            clearAndAddHttpError();
        };
    }, [visible]);

    const onTokens = (tokens: string[]) => {
        setTokens(tokens);
        setVisible(null);
    };

    return (
        <div>
            <SetupTOTPDialog open={visible === 'enable'} onClose={() => setVisible(null)} onTokens={onTokens} />
            <RecoveryTokensDialog tokens={tokens} open={tokens.length > 0} onClose={() => setTokens([])} />
            <DisableTOTPDialog open={visible === 'disable'} onClose={() => setVisible(null)} />
            <p css={tw`text-sm`} style={{ color: 'var(--theme-text-muted)' }}>
                {isEnabled
                    ? t('account.twoFactor.enabled')
                    : t('account.twoFactor.button')}
            </p>
            <div css={tw`mt-4 text-right`}>
                {isEnabled ? (
                    <FuturisticFormButton variant="danger" onClick={() => setVisible('disable')}>
                        {t('account.twoFactor.disable.disable')}
                    </FuturisticFormButton>
                ) : (
                    <FuturisticFormButton onClick={() => setVisible('enable')}>
                        {t('account.twoFactor.setup.enable')}
                    </FuturisticFormButton>
                )}
            </div>
        </div>
    );
};

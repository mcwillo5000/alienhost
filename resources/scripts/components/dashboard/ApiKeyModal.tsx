import React from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { useTranslation } from 'react-i18next';

interface Props {
    apiKey: string;
    visible: boolean;
    onModalDismissed: () => void;
}

const ApiKeyModal = ({ apiKey, visible, onModalDismissed }: Props) => {
    const { t } = useTranslation();
    
    if (!visible) {
        return null;
    }

    return (
        <div>
            <h3 
                css={tw`mb-6 text-2xl`} 
                style={{ color: 'var(--theme-text-base)' }}
            >
                {t('account.api.modal.title')}
            </h3>
            <p 
                css={tw`text-sm mb-6`} 
                style={{ color: 'var(--theme-text-muted)' }}
            >
                {t('account.api.modal.description')}
            </p>
            <pre 
                css={tw`text-sm rounded py-2 px-4 font-mono`}
                style={{
                    background: 'var(--theme-background-secondary)',
                    border: '1px solid var(--theme-border)'
                }}
            >
                <CopyOnClick text={apiKey}>
                    <code 
                        css={tw`font-mono`} 
                        style={{ color: 'var(--theme-text-base)' }}
                    >
                        {apiKey}
                    </code>
                </CopyOnClick>
            </pre>
            <div css={tw`flex justify-end mt-6`}>
                <Button 
                    type={'button'} 
                    size={Options.Size.Compact}
                    onClick={() => onModalDismissed()}
                    css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium transition-colors`}
                    style={{
                        backgroundColor: 'var(--theme-primary)',
                        color: 'var(--theme-text-inverted)',
                    }}
                >
                    Close
                </Button>
            </div>
        </div>
    );
};

ApiKeyModal.displayName = 'ApiKeyModal';

export default ApiKeyModal;

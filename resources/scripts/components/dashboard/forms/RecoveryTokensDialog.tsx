import React from 'react';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { Alert } from '@/components/elements/alert';
import tw from 'twin.macro';

interface RecoveryTokenDialogProps {
    tokens: string[];
    open: boolean;
    onClose: () => void;
}

export default ({ tokens, open, onClose }: RecoveryTokenDialogProps) => {
    const grouped = [] as [string, string][];
    tokens.forEach((token, index) => {
        if (index % 2 === 0) {
            grouped.push([token, tokens[index + 1] || '']);
        }
    });

    if (!open) {
        return null;
    }

    return (
        <div>
            <div 
                css={tw`mb-4 text-center`}
            >
                <div 
                    css={tw`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3`}
                    style={{
                        backgroundColor: 'var(--theme-success)',
                    }}
                >
                    <svg 
                        css={tw`w-6 h-6`}
                        fill="white" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <h3 
                    css={tw`text-lg font-semibold mb-2`}
                    style={{ color: 'var(--theme-text-base)' }}
                >
                    Two-Step Authentication Enabled
                </h3>
                <p 
                    css={tw`text-sm`}
                    style={{ color: 'var(--theme-text-muted)' }}
                >
                    Store the codes below somewhere safe. If you lose access to your phone you can use these backup codes to sign in.
                </p>
            </div>
            <CopyOnClick text={tokens.join('\n')} showInNotification={false}>
                <pre 
                    css={tw`rounded p-2 mt-6`}
                    style={{
                        backgroundColor: 'var(--theme-background-secondary)',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text-base)'
                    }}
                >
                    {grouped.map((value) => (
                        <span key={value.join('_')} css={tw`block`}>
                            {value[0]}
                            <span css={tw`mx-2 selection:bg-transparent`}>&nbsp;</span>
                            {value[1]}
                            <span css={tw`selection:bg-transparent`}>&nbsp;</span>
                        </span>
                    ))}
                </pre>
            </CopyOnClick>
            <Alert 
                type={'danger'} 
                css={[
                    tw`mt-3`,
                    {
                        borderLeft: 'none',
                        borderLeftWidth: '0px',
                    }
                ]}
            >
                These codes will not be shown again.
            </Alert>
            <div css={tw`flex justify-end mt-6`}>
                <Button 
                    type={'button'}
                    size={Options.Size.Compact}
                    onClick={onClose}
                    css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium transition-colors`}
                    style={{
                        backgroundColor: 'var(--theme-primary)',
                        color: 'var(--theme-text-inverted)',
                    }}
                >
                    Done
                </Button>
            </div>
        </div>
    );
};

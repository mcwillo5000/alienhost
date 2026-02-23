import React from 'react';
import { Dialog, RenderDialogProps } from './';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';

type ConfirmationProps = Omit<RenderDialogProps, 'description' | 'children'> & {
    children: React.ReactNode;
    confirm?: string | undefined;
    onConfirmed: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default ({ confirm = 'Okay', children, onConfirmed, ...props }: ConfirmationProps) => {
    return (
        <Dialog {...props} description={typeof children === 'string' ? children : undefined}>
            {typeof children !== 'string' && children}
            <Dialog.Footer>
                <Button 
                    size={Options.Size.Compact}
                    onClick={props.onClose}
                    css={{
                        backgroundColor: 'var(--theme-background-secondary)',
                        color: 'var(--theme-text-base)',
                        border: '1px solid var(--theme-border)',
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    size={Options.Size.Compact}
                    onClick={onConfirmed}
                    css={{
                        backgroundColor: 'var(--theme-danger)',
                        color: 'var(--theme-text-inverted)',
                    }}
                >
                    {confirm}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};

import React from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export default ({ dark, className, children }: CodeProps) => (
    <code
        className={classNames('font-mono text-sm px-2 py-1 inline-block', className)}
        style={{
            backgroundColor: dark 
                ? 'var(--theme-background)' 
                : 'var(--theme-background-secondary)',
            color: 'var(--theme-text-base)',
            border: '1px solid var(--theme-border)',
            borderRadius: 0,
            clipPath: 'polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%)'
        }}
    >
        {children}
    </code>
);

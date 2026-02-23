import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div className={classNames(styles.stat_block, className)}>
                <div className={classNames(styles.status_bar, color || 'bg-gray-700')} />
                <div 
                    className={classNames(styles.icon)} 
                    style={{
                        backgroundColor: color ? undefined : 'var(--theme-background)',
                        border: '1px solid var(--theme-border)'
                    }}
                >
                    <Icon
                        icon={icon}
                        className={classNames({
                            'text-gray-100': !color || color === 'bg-gray-700',
                            'text-gray-50': color && color !== 'bg-gray-700',
                        })}
                        style={{color: 'var(--theme-primary)'}}
                    />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p 
                        className={'font-header leading-tight text-xs md:text-sm'}
                        style={{color: 'var(--theme-text-muted)', fontFamily: "'Orbitron', sans-serif"}}
                    >
                        {title}
                    </p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full font-semibold truncate'}
                        style={{ fontSize, color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};

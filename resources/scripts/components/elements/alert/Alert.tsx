import { CheckCircleIcon, ExclamationIcon, InformationCircleIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import { useBleeps } from '@/components/RivionBleepsProvider';

interface AlertProps {
    type: 'warning' | 'danger' | 'info' | 'success';
    className?: string;
    children: React.ReactNode;
}

const AlertContainer = styled.div<{ $type: string }>`
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    position: relative;
    font-family: 'Electrolize', sans-serif;
    color: var(--theme-text-base);
    clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
    
    ${({ $type }) => {
        const colors: Record<string, string> = {
            danger: '#ef4444',
            warning: '#eab308',
            info: '#3b82f6',
            success: '#22c55e'
        };
        const color = colors[$type] || colors.info;
        return `
            background-color: ${color}25;
            
            &::before {
                content: '';
                position: absolute;
                inset: -1px;
                background: ${color};
                clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
                z-index: -1;
            }
            
            &::after {
                content: '';
                position: absolute;
                inset: 1px;
                background-color: ${color}25;
                clip-path: polygon(0px 7px, 7px 0px, 100% 0px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0px 100%);
                z-index: -1;
            }
        `;
    }}
`;

export default ({ type, className, children }: AlertProps) => {
    const bleeps = useBleeps();
    const hasPlayedSound = useRef(false);
    

    useEffect(() => {
        if (!hasPlayedSound.current) {
            bleeps.open?.play();
            hasPlayedSound.current = true;
        }
    }, [bleeps]);
    
    return (
        <AlertContainer $type={type} className={className}>
            {type === 'danger' ? (
                <ShieldExclamationIcon className={'w-6 h-6 text-red-400 mr-2'} />
            ) : type === 'warning' ? (
                <ExclamationIcon className={'w-6 h-6 text-yellow-500 mr-2'} />
            ) : type === 'info' ? (
                <InformationCircleIcon className={'w-6 h-6 text-blue-400 mr-2'} />
            ) : (
                <CheckCircleIcon className={'w-6 h-6 text-green-400 mr-2'} />
            )}
            {children}
        </AlertContainer>
    );
};

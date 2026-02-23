import React, { Suspense } from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import ErrorBoundary from '@/components/elements/ErrorBoundary';

export type SpinnerSize = 'small' | 'base' | 'large';

interface Props {
    size?: SpinnerSize;
    centered?: boolean;
}

interface Spinner extends React.FC<Props> {
    Size: Record<'SMALL' | 'BASE' | 'LARGE', SpinnerSize>;
    Suspense: React.FC<Props>;
}

const animLoader = keyframes`
    0%   { height: 48px; } 
    100% { height: 4px; }
`;

const SpinnerComponent = styled.div<Props>`
    width: 8px;
    height: 40px;
    border-radius: 4px;
    display: block;
    margin: 20px auto;
    position: relative;
    background: var(--theme-primary);
    color: var(--theme-primary);
    box-sizing: border-box;
    animation: ${animLoader} 0.3s 0.3s linear infinite alternate;

    ${(props) =>
        props.size === 'small'
            ? css`
                width: 6px;
                height: 30px;
                border-radius: 3px;
                margin: 15px auto;
                
                &::after, &::before {
                    width: 6px;
                    height: 30px;
                    border-radius: 3px;
                    left: 15px;
                }
                
                &::before {
                    left: -15px;
                }
              `
            : props.size === 'large'
            ? css`
                width: 10px;
                height: 50px;
                border-radius: 5px;
                margin: 25px auto;
                
                &::after, &::before {
                    width: 10px;
                    height: 50px;
                    border-radius: 5px;
                    left: 25px;
                }
                
                &::before {
                    left: -25px;
                }
              `
            : null};

    &::after, &::before {
        content: '';
        width: 8px;
        height: 40px;
        border-radius: 4px;
        background: var(--theme-primary);
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 20px;
        box-sizing: border-box;
        animation: ${animLoader} 0.3s 0.45s linear infinite alternate;
    }
    
    &::before {
        left: -20px;
        animation-delay: 0s;
    }
`;

const Spinner: Spinner = ({ centered, ...props }) =>
    centered ? (
        <div css={[tw`flex justify-center items-center`, props.size === 'large' ? tw`m-20` : tw`m-6`]}>
            <SpinnerComponent {...props} />
        </div>
    ) : (
        <SpinnerComponent {...props} />
    );
Spinner.displayName = 'Spinner';

Spinner.Size = {
    SMALL: 'small',
    BASE: 'base',
    LARGE: 'large',
};

Spinner.Suspense = ({ children, centered = true, size = Spinner.Size.LARGE, ...props }) => (
    <Suspense fallback={<Spinner centered={centered} size={size} {...props} />}>
        <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
);
Spinner.Suspense.displayName = 'Spinner.Suspense';

export default Spinner;

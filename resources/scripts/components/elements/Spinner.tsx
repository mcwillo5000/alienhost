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

const animLoaderSmall = keyframes`
    0%   { box-shadow: 14px 0 rgba(var(--theme-primary-rgb), 0.25), 28px 0 var(--theme-primary), 42px 0 var(--theme-primary); }
    50%  { box-shadow: 14px 0 var(--theme-primary), 28px 0 rgba(var(--theme-primary-rgb), 0.25), 42px 0 var(--theme-primary); }
    100% { box-shadow: 14px 0 var(--theme-primary), 28px 0 var(--theme-primary), 42px 0 rgba(var(--theme-primary-rgb), 0.25); }
`;

const animLoader = keyframes`
    0%   { box-shadow: 20px 0 rgba(var(--theme-primary-rgb), 0.25), 40px 0 var(--theme-primary), 60px 0 var(--theme-primary); }
    50%  { box-shadow: 20px 0 var(--theme-primary), 40px 0 rgba(var(--theme-primary-rgb), 0.25), 60px 0 var(--theme-primary); }
    100% { box-shadow: 20px 0 var(--theme-primary), 40px 0 var(--theme-primary), 60px 0 rgba(var(--theme-primary-rgb), 0.25); }
`;

const animLoaderLarge = keyframes`
    0%   { box-shadow: 26px 0 rgba(var(--theme-primary-rgb), 0.25), 52px 0 var(--theme-primary), 78px 0 var(--theme-primary); }
    50%  { box-shadow: 26px 0 var(--theme-primary), 52px 0 rgba(var(--theme-primary-rgb), 0.25), 78px 0 var(--theme-primary); }
    100% { box-shadow: 26px 0 var(--theme-primary), 52px 0 var(--theme-primary), 78px 0 rgba(var(--theme-primary-rgb), 0.25); }
`;

const SpinnerComponent = styled.div<Props>`
    width: 8px;
    height: 48px;
    display: block;
    margin: auto;
    left: -20px;
    position: relative;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: transparent;
    animation: ${animLoader} 1s linear infinite alternate;

    ${({ size }) => size === 'small' && css`
        width: 5px;
        height: 30px;
        left: -14px;
        border-radius: 3px;
        animation: ${animLoaderSmall} 1s linear infinite alternate;
    `}

    ${({ size }) => size === 'large' && css`
        width: 10px;
        height: 60px;
        left: -26px;
        border-radius: 5px;
        animation: ${animLoaderLarge} 1s linear infinite alternate;
    `}
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

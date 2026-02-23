import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import { useBleeps } from '@/components/RivionBleepsProvider';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${tw`relative inline-block rounded p-2 uppercase tracking-wide text-sm transition-all duration-150 border`};

    ${(props) =>
        ((!props.isSecondary && !props.color) || props.color === 'primary') &&
        css<Props>`
            background-color: var(--theme-primary);
            border-color: var(--theme-primary);
            color: var(--theme-text-inverted);

            &:hover:not(:disabled) {
                background-color: var(--theme-secondary);
                border-color: var(--theme-secondary);
            }
        `};

    ${(props) =>
        props.color === 'grey' &&
        css`
            background-color: var(--theme-background-secondary);
            border-color: var(--theme-border);
            color: var(--theme-text-base);

            &:hover:not(:disabled) {
                background-color: var(--theme-primary);
                border-color: var(--theme-primary);
                color: var(--theme-text-inverted);
            }
        `};

    ${(props) =>
        props.color === 'green' &&
        css<Props>`
            background-color: #10b981;
            border-color: #059669;
            color: white;

            &:hover:not(:disabled) {
                background-color: #059669;
                border-color: #047857;
            }

            ${(props) =>
                props.isSecondary &&
                css`
                    background-color: transparent;
                    border-color: #10b981;
                    color: #10b981;
                    
                    &:active:not(:disabled) {
                        background-color: #10b981;
                        border-color: #059669;
                        color: white;
                    }
                `};
        `};

    ${(props) =>
        props.color === 'red' &&
        css<Props>`
            background-color: #ef4444;
            border-color: #dc2626;
            color: white;

            &:hover:not(:disabled) {
                background-color: #dc2626;
                border-color: #b91c1c;
            }

            ${(props) =>
                props.isSecondary &&
                css`
                    background-color: transparent;
                    border-color: #ef4444;
                    color: #ef4444;
                    
                    &:active:not(:disabled) {
                        background-color: #ef4444;
                        border-color: #dc2626;
                        color: white;
                    }
                `};
        `};

    ${(props) => props.size === 'xsmall' && tw`px-2 py-1 text-xs`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2`};
    ${(props) => props.size === 'large' && tw`p-4 text-sm`};
    ${(props) => props.size === 'xlarge' && tw`p-4 w-full`};

    ${(props) =>
        props.isSecondary &&
        css<Props>`
            background-color: transparent;
            border-color: var(--theme-border);
            color: var(--theme-text-base);

            &:hover:not(:disabled) {
                border-color: var(--theme-primary);
                color: var(--theme-primary);
                ${(props) => props.color === 'red' && css`
                    background-color: #ef4444;
                    border-color: #dc2626;
                    color: white;
                `};
                ${(props) => props.color === 'primary' && css`
                    background-color: var(--theme-primary);
                    border-color: var(--theme-primary);
                    color: var(--theme-text-inverted);
                `};
                ${(props) => props.color === 'green' && css`
                    background-color: #10b981;
                    border-color: #059669;
                    color: white;
                `};
            }
        `};

    &:disabled {
        opacity: 0.55;
        cursor: default;
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, onClick, ...props }) => {
    const bleeps = useBleeps();
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        bleeps.click?.play();
        onClick?.(e);
    };
    
    return (
        <ButtonStyle onClick={handleClick} {...props}>
            {isLoading && (
                <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                    <Spinner size={'small'} />
                </div>
            )}
            <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
        </ButtonStyle>
    );
};

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;

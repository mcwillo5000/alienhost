import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import Spinner from '@/components/elements/Spinner';
import { useBleeps } from '@/components/RivionBleepsProvider';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const CORNER = 6;
const CLIP = `polygon(0 ${CORNER}px, ${CORNER}px 0, 100% 0, 100% calc(100% - ${CORNER}px), calc(100% - ${CORNER}px) 100%, 0 100%)`;

// ─── Resolve SVG fill / stroke / text colour from current state ───────────────
function resolveColors(
    color: Props['color'],
    isSecondary: boolean,
    hovered: boolean
): { fill: string; stroke: string; text: string } {
    if (isSecondary) {
        if (color === 'red')
            return hovered
                ? { fill: '#ef4444', stroke: 'none', text: 'white' }
                : { fill: 'transparent', stroke: '#ef4444', text: '#ef4444' };
        if (color === 'green')
            return hovered
                ? { fill: '#10b981', stroke: 'none', text: 'white' }
                : { fill: 'transparent', stroke: '#10b981', text: '#10b981' };
        if (color === 'primary')
            return hovered
                ? { fill: 'var(--theme-primary)', stroke: 'none', text: 'var(--theme-text-inverted)' }
                : { fill: 'transparent', stroke: 'var(--theme-border)', text: 'var(--theme-text-base)' };
        // default / grey secondary
        return hovered
            ? { fill: 'transparent', stroke: 'var(--theme-primary)', text: 'var(--theme-primary)' }
            : { fill: 'transparent', stroke: 'var(--theme-border)', text: 'var(--theme-text-base)' };
    }
    if (color === 'grey')
        return hovered
            ? { fill: 'var(--theme-primary)', stroke: 'none', text: 'var(--theme-text-inverted)' }
            : { fill: 'var(--theme-background-secondary)', stroke: 'var(--theme-border)', text: 'var(--theme-text-base)' };
    if (color === 'green')
        return hovered
            ? { fill: '#059669', stroke: 'none', text: 'white' }
            : { fill: '#10b981', stroke: 'none', text: 'white' };
    if (color === 'red')
        return hovered
            ? { fill: '#dc2626', stroke: 'none', text: 'white' }
            : { fill: '#ef4444', stroke: 'none', text: 'white' };
    // primary (default)
    return hovered
        ? { fill: 'var(--theme-secondary)', stroke: 'none', text: 'var(--theme-text-inverted)' }
        : { fill: 'var(--theme-primary)', stroke: 'none', text: 'var(--theme-text-inverted)' };
}

function buildPath(w: number, h: number): string {
    const so = 0.5;
    const c = CORNER;
    return `M ${so},${so + c} L ${so + c},${so} L ${w - so},${so} L ${w - so},${h - so - c} L ${w - so - c},${h - so} L ${so},${h - so} Z`;
}

// ─── Outer wrapper: position + clip-path only, no padding ─────────────────────
// className is NOT on this element — see below. This is only for the SVG layer.
const ButtonWrapper = styled.div<{ isBlock?: boolean }>`
    position: relative;
    display: ${(p) => (p.isBlock ? 'block' : 'inline-block')};
    ${(p) => p.isBlock && 'width: 100%;'}
    clip-path: ${CLIP};

    &[data-disabled='true'] {
        opacity: 0.55;
        pointer-events: none;
    }
`;

const ButtonSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: visible;
`;

// ─── Inner button element ─────────────────────────────────────────────────────
// Receives className so that styled(Button) overrides (e.g. p-0 w-10 h-10) work.
const NativeButton = styled.button<Pick<Props, 'size'>>`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: ${(p) => (p.size === 'xlarge' ? '100%' : 'auto')};
    padding: ${(p) =>
        p.size === 'xsmall'
            ? '4px 8px'
            : p.size === 'large' || p.size === 'xlarge'
            ? '16px'
            : '8px 16px'};
    font-size: ${(p) => (p.size === 'xsmall' ? '12px' : '14px')};
    font-family: 'Electrolize', sans-serif;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    transition: color 0.15s ease;

    &:disabled {
        cursor: default;
    }
`;

// Same as NativeButton but renders as <a> — use the styled-components `as` prop at render time
const NativeAnchor = NativeButton;

// ─── Button component ─────────────────────────────────────────────────────────
type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({
    children,
    isLoading,
    isSecondary = false,
    color,
    size,
    disabled,
    className,
    onClick,
    style,
    type = 'button',
    ...rest
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dim, setDim] = useState({ w: 120, h: 36 });
    const [hovered, setHovered] = useState(false);
    const bleeps = useBleeps();

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            setDim({ w: Math.ceil(width) || 120, h: Math.ceil(height) || 36 });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const isDisabled = !!disabled || !!isLoading;
    const colors = resolveColors(color, isSecondary, hovered && !isDisabled);
    const path = buildPath(dim.w, dim.h);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) return;
        bleeps.click?.play();
        onClick?.(e);
    };

    return (
        <ButtonWrapper
            ref={wrapperRef}
            isBlock={size === 'xlarge'}
            data-disabled={isDisabled ? 'true' : undefined}
            style={style}
            onMouseEnter={() => !isDisabled && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <ButtonSVG
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${dim.w} ${dim.h}`}
                preserveAspectRatio="none"
                aria-hidden
            >
                <path d={path} fill={colors.fill} stroke="none" style={{ transition: 'fill 0.15s ease' }} />
                <path
                    d={path}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={1}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.15s ease' }}
                />
            </ButtonSVG>
            <NativeButton
                className={className}
                size={size}
                type={type}
                disabled={isDisabled}
                onClick={handleClick}
                style={{ color: isLoading ? 'transparent' : colors.text }}
                {...rest}
            >
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            color: colors.text,
                        }}
                    >
                        <Spinner size={'small'} />
                    </div>
                )}
                {children}
            </NativeButton>
        </ButtonWrapper>
    );
};

Button.displayName = 'Button';

// ─── LinkButton (renders same SVG shape but as <a> tag) ───────────────────────
type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = ({
    children,
    isLoading,
    isSecondary = false,
    color,
    size,
    disabled,
    className,
    onClick,
    style,
    ...rest
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dim, setDim] = useState({ w: 120, h: 36 });
    const [hovered, setHovered] = useState(false);
    const bleeps = useBleeps();

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            setDim({ w: Math.ceil(width) || 120, h: Math.ceil(height) || 36 });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const isDisabled = !!disabled || !!isLoading;
    const colors = resolveColors(color, isSecondary, hovered && !isDisabled);
    const path = buildPath(dim.w, dim.h);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isDisabled) return;
        bleeps.click?.play();
        onClick?.(e);
    };

    return (
        <ButtonWrapper
            ref={wrapperRef}
            isBlock={size === 'xlarge'}
            data-disabled={isDisabled ? 'true' : undefined}
            style={style}
            onMouseEnter={() => !isDisabled && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <ButtonSVG
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${dim.w} ${dim.h}`}
                preserveAspectRatio="none"
                aria-hidden
            >
                <path d={path} fill={colors.fill} stroke="none" style={{ transition: 'fill 0.15s ease' }} />
                <path
                    d={path}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={1}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.15s ease' }}
                />
            </ButtonSVG>
            <NativeAnchor
                as={'a' as any}
                className={className}
                size={size}
                onClick={handleClick as any}
                style={{ color: isLoading ? 'transparent' : colors.text }}
                {...(rest as any)}
            >
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            color: colors.text,
                        }}
                    >
                        <Spinner size={'small'} />
                    </div>
                )}
                {children}
            </NativeAnchor>
        </ButtonWrapper>
    );
};

LinkButton.displayName = 'LinkButton';

// ButtonStyle kept for backward-compat (e.g. styled(ButtonStyle) in other files)
const ButtonStyle = Button;

export { LinkButton, ButtonStyle };
export default Button;

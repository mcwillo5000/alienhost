import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { ButtonProps, Options } from '@/components/elements/button/types';
import styles from './style.module.css';
import { useBleeps } from '@/components/RivionBleepsProvider';

const CORNER = 6;
// Top-right + bottom-left diagonal cut (matches original shape)
const CLIP = `polygon(0 0, calc(100% - ${CORNER}px) 0, 100% ${CORNER}px, 100% 100%, ${CORNER}px 100%, 0 calc(100% - ${CORNER}px))`;

function buildPath(w: number, h: number): string {
    const so = 0.5, c = CORNER;
    return `M ${so},${so} L ${w - so - c},${so} L ${w - so},${so + c} L ${w - so},${h - so} L ${so + c},${h - so} L ${so},${h - so - c} Z`;
}

type ColorType = 'primary' | 'text' | 'danger' | 'start' | 'restart' | 'stop' | 'kill';

function resolveColors(
    colorType: ColorType,
    isSecondary: boolean,
    hovered: boolean
): { fill: string; stroke: string; text: string } {
    switch (colorType) {
        case 'text':
            return hovered
                ? { fill: 'var(--theme-primary)', stroke: 'var(--theme-primary)', text: 'var(--theme-text-inverted)' }
                : isSecondary
                    ? { fill: 'var(--theme-background)', stroke: 'var(--theme-border)', text: 'var(--theme-text-base)' }
                    : { fill: 'var(--theme-background-secondary)', stroke: 'var(--theme-border)', text: 'var(--theme-text-base)' };
        case 'danger':
            if (isSecondary) {
                return hovered
                    ? { fill: '#DC2626', stroke: '#DC2626', text: 'var(--theme-text-inverted)' }
                    : { fill: 'var(--theme-background)', stroke: '#DC2626', text: '#DC2626' };
            }
            return hovered
                ? { fill: '#B91C1C', stroke: '#B91C1C', text: 'var(--theme-text-inverted)' }
                : { fill: '#DC2626', stroke: '#DC2626', text: 'var(--theme-text-inverted)' };
        case 'start':
            return hovered
                ? { fill: '#15803d', stroke: '#15803d', text: 'white' }
                : { fill: '#16a34a', stroke: '#16a34a', text: 'white' };
        case 'restart':
            return hovered
                ? { fill: '#a16207', stroke: '#a16207', text: 'white' }
                : { fill: '#ca8a04', stroke: '#ca8a04', text: 'white' };
        case 'stop':
            return hovered
                ? { fill: '#b91c1c', stroke: '#b91c1c', text: 'white' }
                : { fill: '#dc2626', stroke: '#dc2626', text: 'white' };
        case 'kill':
            return hovered
                ? { fill: '#7f1d1d', stroke: '#7f1d1d', text: 'white' }
                : { fill: '#991b1b', stroke: '#991b1b', text: 'white' };
        default: // primary
            if (isSecondary) {
                return hovered
                    ? { fill: 'var(--theme-primary)', stroke: 'var(--theme-primary)', text: 'var(--theme-text-inverted)' }
                    : { fill: 'transparent', stroke: 'var(--theme-primary)', text: 'var(--theme-primary)' };
            }
            return hovered
                ? { fill: 'var(--theme-secondary)', stroke: 'var(--theme-secondary)', text: 'var(--theme-text-inverted)' }
                : { fill: 'var(--theme-primary)', stroke: 'var(--theme-primary)', text: 'var(--theme-text-inverted)' };
    }
}

type InternalProps = ButtonProps & { $colorType?: ColorType };

const ButtonBase = forwardRef<HTMLButtonElement, InternalProps>(
    ({ children, shape, size, variant, className, $colorType = 'primary', onClick, disabled, style, ...rest }, ref) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [dim, setDim] = useState({ w: 80, h: 36 });
        const [hovered, setHovered] = useState(false);
        const bleeps = useBleeps();

        const mergeRef = useCallback(
            (el: HTMLButtonElement | null) => {
                (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
                if (typeof ref === 'function') ref(el);
                else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
            },
            [ref]
        );

        useEffect(() => {
            const el = buttonRef.current;
            if (!el) return;
            const update = () => {
                const { width, height } = el.getBoundingClientRect();
                setDim({ w: Math.ceil(width) || 80, h: Math.ceil(height) || 36 });
            };
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        let colorType: ColorType = $colorType;
        if (variant === Options.Variant.Start) colorType = 'start';
        else if (variant === Options.Variant.Restart) colorType = 'restart';
        else if (variant === Options.Variant.Stop) colorType = 'stop';
        else if (variant === Options.Variant.Kill) colorType = 'kill';

        const isSecondary = variant === Options.Variant.Secondary;
        const isDisabled = !!disabled;
        const colors = resolveColors(colorType, isSecondary, hovered && !isDisabled);
        const path = buildPath(dim.w, dim.h);

        return (
            <button
                ref={mergeRef}
                className={classNames(styles.button, {
                    [styles.square]: shape === Options.Shape.IconSquare,
                    [styles.small]: size === Options.Size.Small,
                    [styles.compact]: size === Options.Size.Compact,
                    [styles.large]: size === Options.Size.Large,
                }, className)}
                disabled={isDisabled}
                onClick={(e) => { if (!isDisabled) { bleeps.click?.play(); onClick?.(e); } }}
                onMouseEnter={() => !isDisabled && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: 'relative',
                    zIndex: 0,
                    clipPath: CLIP,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: colors.text,
                    transition: 'color 0.15s ease',
                    opacity: isDisabled ? 0.55 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    ...style,
                }}
                {...rest}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 ${dim.w} ${dim.h}`}
                    preserveAspectRatio="none"
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: -1,
                        overflow: 'visible',
                    }}
                >
                    <path d={path} fill={colors.fill} stroke="none" style={{ transition: 'fill 0.15s ease' }} />
                    <path
                        d={path}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={1}
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        vectorEffect={'non-scaling-stroke' as any}
                        style={{ transition: 'stroke 0.15s ease' }}
                    />
                </svg>
                {children}
            </button>
        );
    }
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <ButtonBase ref={ref} $colorType="primary" {...props} />
));

const TextButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <ButtonBase ref={ref} $colorType="text" {...props} />
));

const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <ButtonBase ref={ref} $colorType="danger" {...props} />
));

Button.displayName = 'Button';
TextButton.displayName = 'TextButton';
DangerButton.displayName = 'DangerButton';

const _Button = Object.assign(Button, {
    Sizes: Options.Size,
    Shapes: Options.Shape,
    Variants: Options.Variant,
    Text: TextButton,
    Danger: DangerButton,
});

export default _Button;

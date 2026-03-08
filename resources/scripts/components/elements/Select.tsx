import React, { forwardRef, useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

const CORNER = 8;

const SelectWrapper = styled.div`
    position: relative;
    width: 100%;
    overflow: hidden;
`;

const SelectSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

// ─── Inner <select> — transparent bg so SVG fill shows through ────────────────
// background-color: transparent (NOT background: transparent) preserves background-image for the arrow.
const StyledSelect = styled.select<{ hideDropdownArrow?: boolean }>`
    ${tw`shadow-none block p-3 pr-8 w-full text-sm transition-colors duration-150 ease-linear`};
    position: relative;
    z-index: 1;
    border-radius: 0;
    border: none;
    outline: none !important;
    box-shadow: none !important;
    font-family: 'Electrolize', sans-serif;
    background-color: transparent;

    &:focus {
        outline: none !important;
        box-shadow: none !important;
    }

    -webkit-appearance: none;
    -moz-appearance: none;
    background-size: 1rem;
    background-repeat: no-repeat;
    background-position-x: calc(100% - 0.75rem);
    background-position-y: center;

    &::-ms-expand {
        display: none;
    }

    ${(props) =>
        !props.hideDropdownArrow &&
        css`
            color: var(--theme-text-base);

            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%236b7280' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3e%3c/svg%3e ");

            @media (prefers-color-scheme: dark) {
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%239ca3af' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3e%3c/svg%3e ");
            }

            option {
                background-color: var(--theme-background-secondary);
                color: var(--theme-text-base);
                padding: 0.5rem;
            }
        `};
`;

function buildPath(w: number, h: number) {
    const so = 0.5;
    const c = CORNER;
    return `M ${so},${so + c} L ${so + c},${so} L ${w - so},${so} L ${w - so},${h - so - c} L ${w - so - c},${h - so} L ${so},${h - so} Z`;
}

const CLIP_STYLE = `polygon(0 ${CORNER}px, ${CORNER}px 0, 100% 0, 100% calc(100% - ${CORNER}px), calc(100% - ${CORNER}px) 100%, 0 100%)`;

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hideDropdownArrow?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ hideDropdownArrow, className, onFocus, onBlur, ...rest }, ref) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [dim, setDim] = useState({ w: 200, h: 44 });
        const [focused, setFocused] = useState(false);
        const [hovered, setHovered] = useState(false);

        useEffect(() => {
            const el = wrapperRef.current;
            if (!el) return;
            const update = () => {
                const { width, height } = el.getBoundingClientRect();
                setDim({ w: Math.floor(width) || 200, h: Math.floor(height) || 44 });
            };
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        const { w, h } = dim;
        const path = buildPath(w, h);
        const stroke = focused || hovered ? 'var(--theme-primary)' : 'var(--theme-border)';

        return (
            <SelectWrapper
                ref={wrapperRef}
                className={className}
                style={{ clipPath: CLIP_STYLE }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <SelectSVG
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 ${w} ${h}`}
                    preserveAspectRatio="none"
                >
                    <path d={path} fill="var(--theme-background)" stroke="none" />
                    <path
                        d={path}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={1}
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        vectorEffect="non-scaling-stroke"
                        style={{ transition: 'stroke 0.15s ease' }}
                    />
                </SelectSVG>
                <StyledSelect
                    ref={ref}
                    hideDropdownArrow={hideDropdownArrow}
                    onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                    {...rest}
                />
            </SelectWrapper>
        );
    }
);

Select.displayName = 'Select';
export default Select;

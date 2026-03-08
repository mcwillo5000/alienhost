import React, { forwardRef, useRef, useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const CORNER = 8;

// ─── Shared SVG wrapper pieces (same pattern as FuturisticInput) ──────────────
const FieldWrapper = styled.div`
    position: relative;
    width: 100%;
    overflow: hidden;
`;

const FieldSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

// ─── Checkbox / radio (no SVG needed, keep native border) ────────────────────
const StyledCheckbox = styled.input<Props>`
    ${tw`bg-neutral-500 cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4 text-primary-400 border border-neutral-300 rounded-sm`};
    color-adjust: exact;
    background-origin: border-box;
    transition: all 75ms linear, box-shadow 25ms linear;

    &:checked {
        ${tw`border-transparent bg-no-repeat bg-center`};
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-color: currentColor;
        background-size: 100% 100%;
    }

    &:focus {
        ${tw`outline-none border-primary-300`};
        box-shadow: 0 0 0 1px rgba(9, 103, 210, 0.25);
    }

    &[type='radio'] {
        ${tw`rounded-full`};
    }
`;


const StyledTextInput = styled.input`
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    min-width: 0;
    padding: 0.75rem;
    background-color: transparent;
    border: none;
    outline: none !important;
    box-shadow: none !important;
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--theme-text-base);
    font-family: 'Electrolize', sans-serif;
    -webkit-appearance: none;
    appearance: none;

    &:focus {
        outline: none !important;
        box-shadow: none !important;
        border: none !important;
    }

    &:focus-visible {
        outline: none !important;
        box-shadow: none !important;
    }

    &::placeholder {
        color: var(--theme-text-muted);
    }

    &:disabled {
        opacity: 0.75;
        cursor: not-allowed;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px var(--theme-background) inset !important;
        -webkit-text-fill-color: var(--theme-text-base) !important;
        box-shadow: 0 0 0 1000px var(--theme-background) inset !important;
        border: none !important;
        outline: none !important;
        caret-color: var(--theme-text-base) !important;
        transition: background-color 5000s ease-in-out 0s !important;
    }
`;

// ─── Inner <textarea> ─────────────────────────────────────────────────────────
const StyledTextarea = styled.textarea`
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    background-color: transparent;
    border: none;
    outline: none !important;
    box-shadow: none !important;
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--theme-text-base);
    font-family: 'Electrolize', sans-serif;
    resize: none;

    &:focus {
        outline: none !important;
        box-shadow: none !important;
    }

    &::placeholder {
        color: var(--theme-text-muted);
    }

    &:disabled {
        opacity: 0.75;
    }
`;

// ─── Shared path builder ───────────────────────────────────────────────────────
function buildPath(w: number, h: number): string {
    const so = 0.5;
    const c = CORNER;
    return `M ${so},${so + c} L ${so + c},${so} L ${w - so},${so} L ${w - so},${h - so - c} L ${w - so - c},${h - so} L ${so},${h - so} Z`;
}

const CLIP_STYLE = `polygon(0 ${CORNER}px, ${CORNER}px 0, 100% 0, 100% calc(100% - ${CORNER}px), calc(100% - ${CORNER}px) 100%, 0 100%)`;

// ─── Text input sub-component (all hooks unconditional) ───────────────────────
type InputProps = Props & React.InputHTMLAttributes<HTMLInputElement>;

const InputText = forwardRef<HTMLInputElement, InputProps>(
    ({ hasError, isLight, className, onFocus, onBlur, style, ...rest }, ref) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [dim, setDim] = useState({ w: 200, h: 44 });
        const [focused, setFocused] = useState(false);
        const [hovered, setHovered] = useState(false);

        useEffect(() => {
            const el = wrapperRef.current;
            if (!el) return;
            const update = () => {
                const { width, height } = el.getBoundingClientRect();
                setDim({ w: Math.floor(width) || 200, h: Math.floor(height) || 36 });
            };
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        const { w, h } = dim;
        const path = buildPath(w, h);
        const stroke = hasError ? '#DC2626' : focused || hovered ? 'var(--theme-primary)' : 'var(--theme-border)';

        return (
            <FieldWrapper
                ref={wrapperRef}
                className={className}
                style={{ clipPath: CLIP_STYLE }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <FieldSVG
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
                </FieldSVG>
                <StyledTextInput
                    ref={ref}
                    style={hasError ? { color: '#fecaca', ...style } : style}
                    onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                    {...rest}
                />
            </FieldWrapper>
        );
    }
);
InputText.displayName = 'InputText';

// ─── Textarea sub-component ───────────────────────────────────────────────────
type TextareaProps = Props & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaBox = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ hasError, isLight, className, onFocus, onBlur, style, ...rest }, ref) => {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [dim, setDim] = useState({ w: 200, h: 80 });
        const [focused, setFocused] = useState(false);
        const [hovered, setHovered] = useState(false);

        useEffect(() => {
            const el = wrapperRef.current;
            if (!el) return;
            const update = () => {
                const { width, height } = el.getBoundingClientRect();
                setDim({ w: Math.floor(width) || 200, h: Math.floor(height) || 80 });
            };
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        const { w, h } = dim;
        const path = buildPath(w, h);
        const stroke = hasError ? '#DC2626' : focused || hovered ? 'var(--theme-primary)' : 'var(--theme-border)';

        return (
            <FieldWrapper
                ref={wrapperRef}
                className={className}
                style={{ clipPath: CLIP_STYLE }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <FieldSVG
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
                </FieldSVG>
                <StyledTextarea
                    ref={ref}
                    style={hasError ? { color: '#fecaca', ...style } : style}
                    onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                    {...rest}
                />
            </FieldWrapper>
        );
    }
);
TextareaBox.displayName = 'Textarea';

// ─── Public exports ────────────────────────────────────────────────────────────
// Input routes checkbox/radio to native styled element, others to SVG-bordered InputText.
const Input = forwardRef<HTMLInputElement, InputProps>(({ type, ...props }, ref) => {
    if (type === 'checkbox' || type === 'radio') {
        return <StyledCheckbox ref={ref} type={type} {...props} />;
    }
    return <InputText ref={ref} type={type} {...props} />;
});

Input.displayName = 'Input';
export { TextareaBox as Textarea };
export default Input;

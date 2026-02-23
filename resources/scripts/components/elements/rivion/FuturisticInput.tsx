import React, { forwardRef, useRef, useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { useBleeps } from '@/components/RivionBleepsProvider';

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
    overflow: hidden;
`;

const FrameSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

const StyledInput = styled.input<{ $hasError?: boolean; $isFocused?: boolean }>`
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    outline: none !important;
    box-shadow: none !important;
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--theme-text-base);
    font-family: 'Electrolize', sans-serif;
    
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
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    /* Autofill styles - remove browser default outline and match our design */
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px var(--theme-background) inset !important;
        -webkit-text-fill-color: var(--theme-text-base) !important;
        box-shadow: 0 0 0 1000px var(--theme-background) inset !important;
        border: none !important;
        outline: none !important;
        background-color: var(--theme-background) !important;
        caret-color: var(--theme-text-base) !important;
        transition: background-color 5000s ease-in-out 0s !important;
    }
    
    &:autofill,
    &:autofill:hover,
    &:autofill:focus,
    &:autofill:active {
        -webkit-box-shadow: 0 0 0 1000px var(--theme-background) inset !important;
        -webkit-text-fill-color: var(--theme-text-base) !important;
        box-shadow: 0 0 0 1000px var(--theme-background) inset !important;
        border: none !important;
        outline: none !important;
        background-color: var(--theme-background) !important;
        caret-color: var(--theme-text-base) !important;
        transition: background-color 5000s ease-in-out 0s !important;
    }
`;

interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
    cornerSize?: number;
}


const FuturisticInput = forwardRef<HTMLInputElement, FuturisticInputProps>(
    ({ hasError = false, cornerSize = 8, className, ...props }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const [dimensions, setDimensions] = useState({ width: 200, height: 36 });
        const [isFocused, setIsFocused] = useState(false);
        const bleeps = useBleeps();

        useEffect(() => {
            const updateDimensions = () => {
                if (containerRef.current) {
                    const { width, height } = containerRef.current.getBoundingClientRect();
                    setDimensions({
                        width: Math.floor(width) || 200,
                        height: Math.floor(height) || 36
                    });
                }
            };

            updateDimensions();

            const resizeObserver = new ResizeObserver(updateDimensions);
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            return () => resizeObserver.disconnect();
        }, []);

        const { width, height } = dimensions;
        const strokeWidth = 1;
        const so = strokeWidth / 2;
        const cornerCut = cornerSize;

        const framePath = `
            M ${so},${so + cornerCut}
            L ${so + cornerCut},${so}
            L ${width - so},${so}
            L ${width - so},${height - so - cornerCut}
            L ${width - so - cornerCut},${height - so}
            L ${so},${height - so}
            Z
        `;

        const getBorderColor = () => {
            if (hasError) return '#DC2626';
            return 'var(--theme-primary)';
        };

        return (
            <InputWrapper 
                ref={containerRef} 
                className={className}
                style={{
                    clipPath: `polygon(
                        0 ${cornerSize}px,
                        ${cornerSize}px 0,
                        100% 0,
                        100% calc(100% - ${cornerSize}px),
                        calc(100% - ${cornerSize}px) 100%,
                        0 100%
                    )`
                }}
            >
                <FrameSVG 
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                >
                    {/* Background fill */}
                    <path
                        d={framePath}
                        fill="var(--theme-background)"
                        stroke="none"
                    />
                    
                    {/* Border stroke */}
                    <path
                        d={framePath}
                        fill="none"
                        stroke={getBorderColor()}
                        strokeWidth={2}
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        vectorEffect="non-scaling-stroke"
                        style={{ transition: 'stroke 0.2s ease' }}
                    />
                </FrameSVG>

                <StyledInput
                    ref={ref}
                    $hasError={hasError}
                    $isFocused={isFocused}
                    onFocus={(e) => {
                        setIsFocused(true);
                        bleeps.click?.play();
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />
            </InputWrapper>
        );
    }
);

FuturisticInput.displayName = 'FuturisticInput';

export default FuturisticInput;

import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components/macro';


const ButtonWrapper = styled.button<{ $isHovered?: boolean; $disabled?: boolean }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 12px;
    background: transparent;
    border: none;
    outline: none;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.$disabled ? 0.5 : 1};
    min-height: 36px;
    font-family: 'Electrolize', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
    color: var(--theme-text-inverted);
    transition: color 0.2s ease;
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

const ButtonContent = styled.span`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
`;

interface FuturisticFormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    cornerSize?: number;
}


const FuturisticFormButton: React.FC<FuturisticFormButtonProps> = ({
    children,
    variant = 'primary',
    cornerSize = 6,
    disabled,
    className,
    ...props
}) => {
    const containerRef = useRef<HTMLButtonElement>(null);
    const [dimensions, setDimensions] = useState({ width: 120, height: 40 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 120,
                    height: Math.floor(height) || 40
                });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [children]);

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

    const getColors = () => {
        switch (variant) {
            case 'secondary':
                return {
                    fill: isHovered ? 'color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background-secondary))' : 'var(--theme-background-secondary)',
                    stroke: isHovered ? 'var(--theme-primary)' : 'var(--theme-border)',
                    text: isHovered ? 'var(--theme-primary)' : 'var(--theme-text-base)'
                };
            case 'danger':
                return {
                    fill: isHovered ? '#B91C1C' : '#DC2626',
                    stroke: isHovered ? '#991B1B' : '#DC2626',
                    text: 'white'
                };
            default: 
                return {
                    fill: isHovered ? 'var(--theme-secondary)' : 'var(--theme-primary)',
                    stroke: isHovered ? 'var(--theme-secondary)' : 'var(--theme-primary)',
                    text: 'var(--theme-text-inverted)'
                };
        }
    };

    const colors = getColors();

    return (
        <ButtonWrapper
            ref={containerRef}
            className={`futuristic-form-button ${className || ''}`}
            disabled={disabled}
            $disabled={disabled}
            $isHovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ color: colors.text }}
            {...props}
        >
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                {/* Background fill */}
                <path
                    d={framePath}
                    fill={colors.fill}
                    stroke="none"
                    style={{ transition: 'fill 0.2s ease' }}
                />
                
                {/* Border stroke */}
                <path
                    d={framePath}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s ease' }}
                />
            </FrameSVG>

            <ButtonContent>
                {children}
            </ButtonContent>
        </ButtonWrapper>
    );
};

export default FuturisticFormButton;

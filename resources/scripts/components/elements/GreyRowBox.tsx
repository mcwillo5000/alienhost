import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { useBleeps } from '@/components/RivionBleepsProvider';

const RowWrapper = styled.div<{ $hoverable?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    min-height: 60px;
    text-decoration: none;
    color: var(--theme-text-base);
    transition: all 0.15s ease-in-out;
    margin-bottom: 0.75rem;
    clip-path: polygon(10px 0px, 100% 0px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0px 100%, 0px 10px);
    /* Note: Removed filter from here as it creates a containing block for fixed elements */

    &:last-child {
        margin-bottom: 0;
    }

    ${(props) => props.$hoverable !== false && `
        cursor: pointer;
        &:hover .frame-stroke {
            stroke: var(--theme-primary);
            filter: drop-shadow(0 0 4px var(--theme-primary));
        }
        &:hover .frame-fill {
            fill: rgba(var(--theme-primary-rgb), 0.1);
        }
    `};
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

const RowContent = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
`;

interface GreyRowBoxProps {
    $hoverable?: boolean;
    as?: React.ElementType;
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    css?: any;
    children: React.ReactNode;
}

const GreyRowBox: React.FC<GreyRowBoxProps> = ({
    $hoverable = true,
    as,
    href,
    onClick,
    className,
    children,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 60 });
    const bleeps = useBleeps();

    const handleClick = (e: React.MouseEvent) => {
        bleeps.click?.play();
        onClick?.(e);
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 300,
                    height: Math.floor(height) || 60
                });
            }
        };

        updateDimensions();

        const timeoutId = setTimeout(updateDimensions, 50);

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timeoutId);
        };
    }, [children]);

    const { width, height } = dimensions;
    const cornerCut = 10;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cornerCut}
        L ${so + cornerCut},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cornerCut}
        L ${width - so - cornerCut},${height - so}
        L ${so},${height - so}
        Z
    `;

    const Component = as || 'div';
    const componentProps = as === 'a' ? { href } : {};

    return (
        <RowWrapper
            as={Component}
            ref={containerRef}
            $hoverable={$hoverable}
            onClick={handleClick}
            className={className}
            {...componentProps}
            {...props}
        >
            <FrameSVG
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >

                <path
                    className="frame-fill"
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                    style={{ transition: 'fill 0.15s ease' }}
                />

                <path
                    className="frame-stroke"
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-border)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                    style={{
                        transition: 'stroke 0.15s ease',
                        filter: 'drop-shadow(0 0 2px var(--theme-border))'
                    }}
                />
            </FrameSVG>

            <RowContent>
                {children}
            </RowContent>
        </RowWrapper>
    );
};

export default GreyRowBox;

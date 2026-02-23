import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';


const FrameContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
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

const FrameContent = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
`;

interface FuturisticContentBoxProps {
    children: React.ReactNode;
    title?: string;
    showFlashes?: string | boolean;
    showLoadingOverlay?: boolean;
    className?: string;
    style?: React.CSSProperties;
    cornerSize?: number;
}

const FuturisticContentBox: React.FC<FuturisticContentBoxProps> = ({
    children,
    title,
    showFlashes,
    showLoadingOverlay,
    className = '',
    style,
    cornerSize = 16
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 300,
                    height: Math.floor(height) || 200
                });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [children, title]);

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

    return (
        <FrameContainer 
            ref={containerRef} 
            className={className}
            style={{ minHeight: '100px', ...style }}
        >
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                {/* Background fill */}
                <path
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />
                
                {/* Border stroke */}
                <path
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-primary)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                />
            </FrameSVG>

            <FrameContent>
                {/* Flash Messages */}
                {showFlashes && (
                    <div style={{ padding: '12px 12px 0 12px' }}>
                        <FlashMessageRender 
                            byKey={typeof showFlashes === 'string' ? showFlashes : undefined} 
                        />
                    </div>
                )}
                
                {/* Title Header */}
                {title && (
                    <div
                        style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--theme-border)',
                            backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)'
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--theme-primary)',
                                fontFamily: '"Orbitron", "Electrolize", sans-serif'
                            }}
                        >
                            {title}
                        </h3>
                    </div>
                )}
                
                {/* Main Content */}
                <div style={{ padding: '16px', position: 'relative' }}>
                    <SpinnerOverlay visible={showLoadingOverlay || false} />
                    {children}
                </div>
            </FrameContent>
        </FrameContainer>
    );
};

export default FuturisticContentBox;

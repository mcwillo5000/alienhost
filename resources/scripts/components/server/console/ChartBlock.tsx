import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import styled from 'styled-components/macro';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

const FrameContainer = styled.div`
    position: relative;
    width: 100%;
    flex-shrink: 0;
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
`;

export default ({ title, legend, children }: ChartBlockProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 250 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 300,
                    height: Math.floor(height) || 250
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

    return (
        <FrameContainer ref={containerRef} className="futuristic-chart-block">
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <filter id="chartFrameGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <path
                    data-name="bg"
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />
                <path
                    data-name="line"
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-border)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    filter="url(#chartFrameGlow)"
                    style={{ filter: 'drop-shadow(0 0 3px var(--theme-border))' }}
                />
            </FrameSVG>
            <FrameContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <i className="fas fa-chart-line mr-2 text-xs" style={{color: 'var(--theme-primary)'}}></i>
                        <h4 className="text-xs font-medium" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>{title}</h4>
                    </div>
                    {legend && (
                        <div className="flex items-center gap-x-4">
                            {legend}
                        </div>
                    )}
                </div>
                
                <div style={{height: '180px'}}>
                    {children}
                </div>
            </FrameContent>
        </FrameContainer>
    );
};

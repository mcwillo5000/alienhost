import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components/macro';



interface OctagonFrameProps {
    squareSize?: number;
    strokeWidth?: number;
    showBackground?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    style?: React.CSSProperties;
}

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

const OctagonFrame: React.FC<OctagonFrameProps> = ({
    squareSize = 16,
    strokeWidth = 2,
    showBackground = true,
    className,
    children,
    onClick,
    style
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
    
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ 
                    width: Math.floor(width) || 100, 
                    height: Math.floor(height) || 100 
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
    const ss = squareSize;
    const so = strokeWidth / 2;
    
    const bgPath = `
        M ${so},${so + ss}
        L ${so + ss},${so}
        L ${width - so - ss},${so}
        L ${width - so},${so + ss}
        L ${width - so},${height - so - ss}
        L ${width - so - ss},${height - so}
        L ${so + ss},${height - so}
        L ${so},${height - so - ss}
        Z
    `;
    
    const linePath = bgPath;
    
    return (
        <FrameContainer 
            ref={containerRef}
            className={className} 
            onClick={onClick}
            style={style}
        >
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >

                {showBackground && (
                    <path
                        d={bgPath}
                        fill="var(--theme-background-secondary)"
                        stroke="none"
                    />
                )}
                

                <path
                    d={linePath}
                    fill="none"
                    stroke="var(--theme-primary)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </FrameSVG>
            
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

export default OctagonFrame;
export { OctagonFrame };
export type { OctagonFrameProps };

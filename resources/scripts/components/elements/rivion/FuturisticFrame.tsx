import React, { useEffect, useRef, useState } from 'react';

interface FuturisticFrameProps {
    variant?: 'header' | 'panel' | 'card';
    accentColor?: string;
    className?: string;
}

const FuturisticFrame: React.FC<FuturisticFrameProps> = ({ 
    variant = 'header',
    accentColor,
    className = ''
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 60 });

    useEffect(() => {
        const updateDimensions = () => {
            if (svgRef.current?.parentElement) {
                const parent = svgRef.current.parentElement;
                setDimensions({
                    width: parent.offsetWidth,
                    height: parent.offsetHeight
                });
            }
        };

        updateDimensions();
        
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (svgRef.current?.parentElement) {
            resizeObserver.observe(svgRef.current.parentElement);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const { width, height } = dimensions;
    
    const cornerSize = variant === 'header' ? 10 : 8;
    const cornerInset = variant === 'header' ? 200 : 100;
    const lineWidth = variant === 'header' ? 500 : 300;
    
    const leftCornerStart = Math.min(cornerInset, width * 0.2);
    const leftCornerEnd = leftCornerStart + 20;
    const rightCornerStart = width - Math.min(cornerInset, width * 0.2);
    const rightCornerEnd = rightCornerStart - 20;
    const centerStart = leftCornerEnd + Math.min(lineWidth, width * 0.25);
    const centerEnd = rightCornerEnd - Math.min(lineWidth, width * 0.25);

    const bgPath = `
        M 0,0 
        L ${width},0 
        L ${width},${height} 
        L ${rightCornerStart},${height} 
        L ${rightCornerEnd},${height - cornerSize} 
        L ${centerEnd},${height - cornerSize}
        L ${centerStart},${height - cornerSize}
        L ${leftCornerEnd},${height - cornerSize} 
        L ${leftCornerStart},${height} 
        L 0,${height} 
        L 0,0
    `;

    return (
        <svg
            ref={svgRef}
            className={`futuristic-frame ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        >

            <path
                className="futuristic-frame-bg"
                d={bgPath}
                fill="var(--frame-bg-color, rgba(0, 0, 0, 0.5))"
                stroke="var(--frame-border-color, rgba(100, 100, 100, 0.3))"
                strokeWidth="1"
            />


            <path
                className="futuristic-frame-line"
                d={`M 0,${height} L ${leftCornerStart},${height}`}
                stroke="var(--frame-line-color, rgba(150, 150, 150, 0.5))"
                strokeWidth="1"
                fill="none"
            />


            <path
                className="futuristic-frame-accent"
                d={`
                    M ${leftCornerStart},${height} L ${leftCornerEnd},${height - cornerSize}
                    M ${leftCornerStart - 12},${height} L ${leftCornerEnd - 12},${height - cornerSize}
                `}
                stroke={accentColor || 'var(--frame-accent-color, var(--theme-primary))'}
                strokeWidth="3"
                fill="none"
                style={{
                    filter: 'drop-shadow(0 0 4px var(--frame-accent-color, var(--theme-primary)))'
                }}
            />


            <path
                className="futuristic-frame-line"
                d={`M ${leftCornerEnd - 12},${height - cornerSize} L ${centerStart},${height - cornerSize}`}
                stroke="var(--frame-line-color, rgba(150, 150, 150, 0.5))"
                strokeWidth="1"
                fill="none"
            />

            <path
                className="futuristic-frame-line"
                d={`M ${centerEnd},${height - cornerSize} L ${rightCornerEnd + 12},${height - cornerSize}`}
                stroke="var(--frame-line-color, rgba(150, 150, 150, 0.5))"
                strokeWidth="1"
                fill="none"
            />


            <path
                className="futuristic-frame-accent"
                d={`
                    M ${rightCornerStart},${height} L ${rightCornerEnd},${height - cornerSize}
                    M ${rightCornerStart + 12},${height} L ${rightCornerEnd + 12},${height - cornerSize}
                `}
                stroke={accentColor || 'var(--frame-accent-color, var(--theme-primary))'}
                strokeWidth="3"
                fill="none"
                style={{
                    filter: 'drop-shadow(0 0 4px var(--frame-accent-color, var(--theme-primary)))'
                }}
            />


            <path
                className="futuristic-frame-line"
                d={`M ${width},${height} L ${rightCornerStart},${height}`}
                stroke="var(--frame-line-color, rgba(150, 150, 150, 0.5))"
                strokeWidth="1"
                fill="none"
            />


            <line
                className="futuristic-frame-top-line"
                x1="0"
                y1="0"
                x2={width}
                y2="0"
                stroke="var(--frame-line-color, rgba(150, 150, 150, 0.3))"
                strokeWidth="1"
            />


            <path
                className="futuristic-frame-deco"
                d={`M 0,0 L 0,15 M 0,0 L 15,0`}
                stroke={accentColor || 'var(--frame-accent-color, var(--theme-primary))'}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
            />


            <path
                className="futuristic-frame-deco"
                d={`M ${width},0 L ${width},15 M ${width},0 L ${width - 15},0`}
                stroke={accentColor || 'var(--frame-accent-color, var(--theme-primary))'}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
            />
        </svg>
    );
};

export default FuturisticFrame;

import React, { useRef, useState, useEffect } from 'react';
import { useBleeps } from '@/components/RivionBleepsProvider';

interface FuturisticButtonProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    title?: string;
    style?: React.CSSProperties;
    cornerSize?: number;
    as?: 'button' | 'div';
}


const FuturisticButton: React.FC<FuturisticButtonProps> = ({
    children,
    onClick,
    className = '',
    title,
    style,
    cornerSize = 6,
    as = 'button'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 100, height: 36 });
    const [isHovered, setIsHovered] = useState(false);
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
                    width: Math.ceil(width) || 100,
                    height: Math.ceil(height) || 36
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
    const cs = cornerSize;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    const Component = as;

    return (
        <div
            ref={containerRef}
            className={`futuristic-button-wrapper ${className}`}
            style={{
                position: 'relative',
                display: 'inline-flex',
                cursor: 'pointer',
                ...style
            }}
            onClick={handleClick}
            title={title}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* SVG Frame */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                    overflow: 'visible'
                }}
            >
                {/* Background fill */}
                <path
                    d={framePath}
                    fill={isHovered ? 'color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background-secondary))' : 'var(--theme-background-secondary)'}
                    stroke="none"
                    style={{ transition: 'fill 0.2s ease' }}
                />
                {/* Border stroke */}
                <path
                    d={framePath}
                    fill="none"
                    stroke={isHovered ? 'var(--theme-primary)' : 'var(--theme-border)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s ease' }}
                />
            </svg>

            {/* Content */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '7px 12px',
                    color: isHovered ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    gap: '8px'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default FuturisticButton;

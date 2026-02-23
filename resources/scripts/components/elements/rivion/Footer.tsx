import React, { useRef, useState, useEffect } from 'react';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const containerRef = useRef<HTMLElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 48 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 1200,
                    height: Math.ceil(height) || 48
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
    
    const notchWidth = 192; 
    const notchHeight = 12; 
    const notchSlope = 24; 
    
    const centerX = width / 2;
    const notchLeft = centerX - notchWidth / 2;
    const notchRight = centerX + notchWidth / 2;

    const framePath = `
        M 0,0
        L ${notchLeft - notchSlope},0
        L ${notchLeft},${notchHeight}
        L ${notchRight},${notchHeight}
        L ${notchRight + notchSlope},0
        L ${width},0
        L ${width},${height}
        L 0,${height}
        Z
    `;

    const linePath = `
        M 0,0.5
        L ${notchLeft - notchSlope},0.5
        L ${notchLeft},${notchHeight + 0.5}
        L ${notchRight},${notchHeight + 0.5}
        L ${notchRight + notchSlope},0.5
        L ${width},0.5
    `;

    const currentYear = new Date().getFullYear();

    return (
        <footer
            ref={containerRef}
            className={`rivion-footer rivion-footer-futuristic ${className}`}
        >

            <div 
                role="presentation" 
                className="rivion-footer-frame"
                style={{
                    clipPath: `polygon(
                        0px 0px,
                        calc(50% - ${notchWidth/2 + notchSlope}px) 0px,
                        calc(50% - ${notchWidth/2}px) ${notchHeight}px,
                        calc(50% + ${notchWidth/2}px) ${notchHeight}px,
                        calc(50% + ${notchWidth/2 + notchSlope}px) 0px,
                        100% 0px,
                        100% 100%,
                        0px 100%
                    )`
                }}
            >
                <svg
                    role="presentation"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    viewBox={`0 0 ${width} ${height}`}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'block',
                        border: 0,
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        height: '100%'
                    }}
                >

                    <path
                        data-name="bg"
                        d={framePath}
                        style={{
                            strokeWidth: 0,
                            fill: 'var(--frame-bg-color, rgba(var(--theme-background-secondary-rgb, 31, 41, 55), 0.85))',
                            vectorEffect: 'non-scaling-stroke'
                        }}
                    />

                    <path
                        data-name="line"
                        d={linePath}
                        style={{
                            strokeWidth: 1,
                            stroke: 'var(--frame-line-color, var(--theme-border))',
                            fill: 'none',
                            vectorEffect: 'non-scaling-stroke'
                        }}
                    />
                </svg>
            </div>


            <div className="rivion-footer-container">
                <p className="rivion-footer-copyright">
                    Copyright © {currentYear}{' '}
                    <a 
                        href="https://pterodactyl.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="rivion-footer-link"
                    >
                        Pterodactyl®
                    </a>
                </p>
                

                <a 
                    href="https://willosthemes.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rivion-footer-watermark"
                >
                    Designed by Willo's Themes
                </a>
            </div>
        </footer>
    );
};

export default Footer;

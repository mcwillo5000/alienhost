import React, { useRef, useState, useEffect } from 'react';

interface SectionHeaderProps {
    title: string;
}


const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1200);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.getBoundingClientRect().width || 1200);
            }
        };
        updateWidth();
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    const lineStartX = 24;
    const angleStartX = 175;  
    const angleEndX = angleStartX + 20;
    const mainLineEndX = width - 24;
    const decoStartX = mainLineEndX - 24;

    return (
        <header 
            className="section-header-futuristic"
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '1rem 0',
                userSelect: 'none',
                marginBottom: '0.5rem'
            }}
        >
            <div 
                ref={containerRef}
                style={{
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    paddingBottom: '1rem'
                }}
            >

                <div 
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                >

                    <div 
                        style={{
                            alignSelf: 'stretch',
                            borderLeft: '3px solid var(--theme-primary)',
                            transition: 'border-color 0.2s ease'
                        }}
                    />
                    

                    <h1 
                        style={{
                            fontFamily: '"Orbitron", "Electrolize", sans-serif',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                            lineHeight: 1,
                            color: 'var(--theme-primary)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            margin: 0,
                            position: 'relative'
                        }}
                    >
                        {title}
                    </h1>
                </div>

                <div 
                    role="presentation"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: -1,
                        pointerEvents: 'none'
                    }}
                >
                    <svg
                        role="presentation"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                        viewBox={`0 0 ${width} 40`}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'block',
                            width: '100%',
                            height: '100%'
                        }}
                    >

                        <path
                            d="M 0,39.5 h 8"
                            style={{
                                strokeWidth: 1,
                                stroke: 'var(--theme-primary)',
                                fill: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                opacity: 0.8
                            }}
                        />
                        <path
                            d="M 12,39.5 h 8"
                            style={{
                                strokeWidth: 1,
                                stroke: 'var(--theme-primary)',
                                fill: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                opacity: 0.8
                            }}
                        />
                        

                        <path
                            d={`M 24,39.5 L ${angleStartX},39.5 l 20,-20 H ${mainLineEndX}`}
                            style={{
                                strokeWidth: 1,
                                stroke: 'var(--theme-border)',
                                fill: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                opacity: 0.8
                            }}
                        />
                        

                        <path
                            d={`M ${mainLineEndX - 16.5},19.5 h 8`}
                            style={{
                                strokeWidth: 1,
                                stroke: 'var(--theme-primary)',
                                fill: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                opacity: 0.8
                            }}
                        />
                        <path
                            d={`M ${mainLineEndX - 4},19.5 h 8`}
                            style={{
                                strokeWidth: 1,
                                stroke: 'var(--theme-primary)',
                                fill: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                opacity: 0.8
                            }}
                        />
                        

                        <path
                            d={`M ${decoStartX},10.5 h 5 v 5 h -5 v -5 M ${decoStartX + 9.5},10.5 h 5 v 5 h -5 v -5 M ${decoStartX + 18.5},10.5 h 5 v 5 h -5 v -5`}
                            style={{
                                strokeWidth: 1,
                                stroke: 'var(--theme-primary)',
                                fill: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                opacity: 0.8
                            }}
                        />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default SectionHeader;

import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useBleeps } from '@/components/RivionBleepsProvider';

interface FuturisticNavLinkProps {
    children: React.ReactNode;
    to: string;
    exact?: boolean;
    className?: string;
    cornerSize?: number;
}


const FuturisticNavLink: React.FC<FuturisticNavLinkProps> = ({
    children,
    to,
    exact = false,
    className = '',
    cornerSize = 6
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 40 });
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const bleeps = useBleeps();
    
    const isActive = exact 
        ? location.pathname === to 
        : location.pathname.startsWith(to);

    const handleClick = () => {
        bleeps.click?.play();
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 200,
                    height: Math.ceil(height) || 40
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

    return (
        <NavLink
            to={to}
            exact={exact}
            className={`futuristic-nav-link ${isActive ? 'active' : ''} ${className}`}
            style={{ textDecoration: 'none', display: 'block' }}
            onClick={handleClick}
        >
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '40px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

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

                    <path
                        d={framePath}
                        fill={
                            isActive 
                                ? 'color-mix(in srgb, var(--theme-primary) 15%, transparent)'
                                : isHovered 
                                    ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)'
                                    : 'transparent'
                        }
                        stroke="none"
                        style={{ transition: 'fill 0.2s ease' }}
                    />

                    <path
                        d={framePath}
                        fill="none"
                        stroke={
                            isActive 
                                ? 'var(--theme-primary)'
                                : isHovered 
                                    ? 'color-mix(in srgb, var(--theme-primary) 50%, var(--theme-border))'
                                    : 'var(--theme-border)'
                        }
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        style={{ 
                            transition: 'stroke 0.2s ease',
                            opacity: isActive || isHovered ? 1 : 0.5
                        }}
                    />
                </svg>


                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        padding: '10px 16px',
                        gap: '12px',
                        color: isActive 
                            ? 'var(--theme-primary)' 
                            : isHovered 
                                ? 'var(--theme-text-base)' 
                                : 'var(--theme-text-muted)',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'color 0.2s ease'
                    }}
                >
                    {children}
                </div>
            </div>
        </NavLink>
    );
};


interface FuturisticNavAnchorProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    cornerSize?: number;
    target?: string;
    rel?: string;
}

export const FuturisticNavAnchor: React.FC<FuturisticNavAnchorProps> = ({
    children,
    href,
    className = '',
    cornerSize = 6,
    target,
    rel
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 40 });
    const [isHovered, setIsHovered] = useState(false);
    const bleeps = useBleeps();

    const handleClick = () => {
        bleeps.click?.play();
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 200,
                    height: Math.ceil(height) || 40
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

    return (
        <a
            href={href}
            target={target}
            rel={rel}
            className={`futuristic-nav-link ${className}`}
            style={{ textDecoration: 'none' }}
            onClick={handleClick}
        >
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '40px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

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

                    <path
                        d={framePath}
                        fill={isHovered ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)' : 'transparent'}
                        stroke="none"
                        style={{ transition: 'fill 0.2s ease' }}
                    />

                    <path
                        d={framePath}
                        fill="none"
                        stroke={isHovered ? 'color-mix(in srgb, var(--theme-primary) 50%, var(--theme-border))' : 'var(--theme-border)'}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        style={{ 
                            transition: 'stroke 0.2s ease',
                            opacity: isHovered ? 1 : 0.5
                        }}
                    />
                </svg>


                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        padding: '10px 16px',
                        gap: '12px',
                        color: isHovered ? 'var(--theme-text-base)' : 'var(--theme-text-muted)',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'color 0.2s ease'
                    }}
                >
                    {children}
                </div>
            </div>
        </a>
    );
};


interface FuturisticNavButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    cornerSize?: number;
    rightContent?: React.ReactNode;
}

export const FuturisticNavButton: React.FC<FuturisticNavButtonProps> = ({
    children,
    onClick,
    className = '',
    cornerSize = 6,
    rightContent
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 40 });
    const [isHovered, setIsHovered] = useState(false);
    const bleeps = useBleeps();

    const handleClick = () => {
        bleeps.click?.play();
        onClick();
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 200,
                    height: Math.ceil(height) || 40
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

    return (
        <button
            className={`futuristic-nav-link ${className}`}
            style={{ 
                textDecoration: 'none', 
                display: 'block', 
                width: '100%',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left'
            }}
            onClick={handleClick}
        >
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '40px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

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

                    <path
                        d={framePath}
                        fill={isHovered ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)' : 'transparent'}
                        stroke="none"
                        style={{ transition: 'fill 0.2s ease' }}
                    />

                    <path
                        d={framePath}
                        fill="none"
                        stroke={isHovered ? 'color-mix(in srgb, var(--theme-primary) 50%, var(--theme-border))' : 'var(--theme-border)'}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        style={{ 
                            transition: 'stroke 0.2s ease',
                            opacity: isHovered ? 1 : 0.5
                        }}
                    />
                </svg>


                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: '100%',
                        padding: '10px 16px',
                        gap: '12px',
                        color: isHovered ? 'var(--theme-text-base)' : 'var(--theme-text-muted)',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'color 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {children}
                    </div>
                    {rightContent && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7 }}>
                            {rightContent}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
};

export default FuturisticNavLink;

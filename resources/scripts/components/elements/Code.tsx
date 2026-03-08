import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

const CORNER = 4;

export default ({ dark, className, children }: CodeProps) => {
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const [dim, setDim] = useState({ w: 60, h: 24 });

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            setDim({ w: Math.ceil(width) || 60, h: Math.ceil(height) || 24 });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const { w, h } = dim;
    const so = 0.5;
    const c = CORNER;
    const path = `M ${so},${so + c} L ${so + c},${so} L ${w - so},${so} L ${w - so},${h - so - c} L ${w - so - c},${h - so} L ${so},${h - so} Z`;
    const clipPath = `polygon(0 ${c}px, ${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%)`;
    const bg = dark ? 'var(--theme-background)' : 'var(--theme-background-secondary)';

    return (
        <span
            ref={wrapperRef}
            className={classNames('font-mono text-sm px-2 py-1 inline-block relative', className)}
            style={{ clipPath, verticalAlign: 'middle' }}
        >
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox={`0 0 ${w} ${h}`}
                preserveAspectRatio='none'
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                    overflow: 'visible',
                }}
            >
                <path d={path} fill={bg} stroke='none' />
                <path
                    d={path}
                    fill='none'
                    stroke='var(--theme-border)'
                    strokeWidth={1}
                    strokeLinecap='square'
                    strokeLinejoin='miter'
                    vectorEffect='non-scaling-stroke'
                />
            </svg>
            <span style={{ position: 'relative', zIndex: 1, color: 'var(--theme-text-base)' }}>
                {children}
            </span>
        </span>
    );
};

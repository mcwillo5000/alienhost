import React, { memo, useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const FrameContainer = styled.div`
    position: relative;
    width: 100%;
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

const TitledGreyBox = ({ icon, title, children, className }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 150 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 300,
                    height: Math.floor(height) || 150
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
    const cornerCut = 12;
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
        <FrameContainer ref={containerRef} className={`sci-fi-titled-box ${className || ''}`}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >

                <path
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />

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

                <div 
                    css={[
                        tw`p-3 border-b`,
                        {
                            backgroundColor: 'transparent',
                            borderBottomColor: 'var(--theme-border)'
                        }
                    ]}
                >
                    {typeof title === 'string' ? (
                        <p 
                            css={tw`text-sm uppercase font-semibold tracking-wider`}
                            style={{ 
                                color: 'var(--theme-primary)',
                                fontFamily: "'Orbitron', sans-serif"
                            }}
                        >
                            {icon && (
                                <FontAwesomeIcon 
                                    icon={icon} 
                                    css={tw`mr-2`}
                                    style={{
                                        color: 'var(--theme-primary)',
                                        filter: 'drop-shadow(0 0 4px var(--theme-primary))'
                                    }}
                                />
                            )}
                            {title}
                        </p>
                    ) : (
                        title
                    )}
                </div>

                <div css={tw`p-3`}>{children}</div>
            </FrameContent>
        </FrameContainer>
    );
};

export default memo(TitledGreyBox, isEqual);

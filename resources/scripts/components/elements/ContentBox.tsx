import React, { useRef, useState, useEffect } from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

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

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => {
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
        <FrameContainer 
            ref={containerRef}
            {...props}
            className={`futuristic-content-box ${props.className || ''}`}
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
                    stroke={borderColor || 'var(--theme-primary)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                />
            </FrameSVG>

            <FrameContent>
                {showFlashes && (
                    <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4 mx-3 mt-3`} />
                )}
                {title && (
                    <div 
                        css={[
                            tw`p-3 border-b`,
                            {
                                backgroundColor: 'transparent',
                                borderBottomColor: 'var(--theme-border)'
                            }
                        ]}
                    >
                        <p 
                            css={tw`text-sm uppercase font-semibold tracking-wider`}
                            style={{
                                color: 'var(--theme-primary)',
                                fontFamily: "'Orbitron', sans-serif"
                            }}
                        >
                            {title}
                        </p>
                    </div>
                )}
                <div css={tw`p-3 relative`}>
                    <SpinnerOverlay visible={showLoadingOverlay || false} />
                    {children}
                </div>
            </FrameContent>
        </FrameContainer>
    );
};

export default ContentBox;

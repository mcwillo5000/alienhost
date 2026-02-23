import React, { useRef, useState, useEffect } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, 
    faSyncAlt, 
    faExclamationTriangle, 
    faSearch, 
    faDownload, 
    faBan, 
    faTools, 
    faExchangeAlt, 
    faHistory,
    IconDefinition 
} from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes, css } from 'styled-components/macro';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

interface BaseProps {
    title: string;
    message: string;
    icon?: IconDefinition;
    iconColor?: string;
    onRetry?: () => void;
    onBack?: () => void;
}

interface PropsWithRetry extends BaseProps {
    onRetry?: () => void;
    onBack?: never;
}

interface PropsWithBack extends BaseProps {
    onBack?: () => void;
    onRetry?: never;
}

export type ScreenBlockProps = PropsWithBack | PropsWithRetry;


const spin = keyframes`
    to { transform: rotate(360deg) }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
`;

const iconPulse = keyframes`
    0%, 100% { 
        transform: scale(1);
        filter: drop-shadow(0 0 8px var(--rivion-primary));
    }
    50% { 
        transform: scale(1.05);
        filter: drop-shadow(0 0 20px var(--rivion-primary));
    }
`;

const scanLine = keyframes`
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
`;


const ScreenBlockContainer = styled.div`
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
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

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 200%;
        background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(56, 90, 241, 0.03) 50%,
            transparent 100%
        );
        animation: ${scanLine} 4s linear infinite;
        pointer-events: none;
    }
`;

const IconContainer = styled.div<{ $color?: string }>`
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid ${props => props.$color || 'var(--rivion-primary)'};
        opacity: 0.3;
        clip-path: polygon(
            0 15px,
            15px 0,
            100% 0,
            100% calc(100% - 15px),
            calc(100% - 15px) 100%,
            0 100%
        );
    }
    
    &::after {
        content: '';
        position: absolute;
        inset: 4px;
        background: ${props => props.$color || 'var(--rivion-primary)'};
        opacity: 0.05;
        clip-path: polygon(
            0 12px,
            12px 0,
            100% 0,
            100% calc(100% - 12px),
            calc(100% - 12px) 100%,
            0 100%
        );
    }
`;

const IconWrapper = styled.div<{ $color?: string }>`
    position: relative;
    z-index: 1;
    font-size: 2.5rem;
    color: ${props => props.$color || 'var(--rivion-primary)'};
    animation: ${iconPulse} 3s ease-in-out infinite;
`;

const Title = styled.h2`
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--rivion-foreground);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
`;

const Message = styled.p`
    font-size: 0.875rem;
    color: var(--rivion-muted-foreground);
    max-width: 320px;
    line-height: 1.6;
`;

const CornerAccent = styled.div<{ $position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }>`
    position: absolute;
    width: 20px;
    height: 20px;
    
    ${props => {
        switch (props.$position) {
            case 'top-left':
                return css`
                    top: 8px;
                    left: 8px;
                    border-top: 2px solid var(--rivion-primary);
                    border-left: 2px solid var(--rivion-primary);
                `;
            case 'top-right':
                return css`
                    top: 8px;
                    right: 8px;
                    border-top: 2px solid var(--rivion-primary);
                    border-right: 2px solid var(--rivion-primary);
                `;
            case 'bottom-left':
                return css`
                    bottom: 8px;
                    left: 8px;
                    border-bottom: 2px solid var(--rivion-primary);
                    border-left: 2px solid var(--rivion-primary);
                `;
            case 'bottom-right':
                return css`
                    bottom: 8px;
                    right: 8px;
                    border-bottom: 2px solid var(--rivion-primary);
                    border-right: 2px solid var(--rivion-primary);
                `;
        }
    }}
    
    opacity: 0.5;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ActionButton = styled(Button)`
    ${tw`w-10 h-10 flex items-center justify-center p-0`};
    background: transparent;
    border: 1px solid var(--rivion-border);
    color: var(--rivion-foreground);
    clip-path: polygon(
        0 6px,
        6px 0,
        100% 0,
        100% calc(100% - 6px),
        calc(100% - 6px) 100%,
        0 100%
    );
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--rivion-primary);
        border-color: var(--rivion-primary);
    }

    &.hover\\:spin:hover {
        animation: ${spin} 2s linear infinite;
    }
`;

const ActionContainer = styled.div`
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 10;
`;

const StatusBar = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding: 0.5rem 1rem;
    background: rgba(56, 90, 241, 0.05);
    border: 1px solid var(--rivion-border);
    font-size: 0.75rem;
    color: var(--rivion-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    clip-path: polygon(
        0 4px,
        4px 0,
        100% 0,
        100% calc(100% - 4px),
        calc(100% - 4px) 100%,
        0 100%
    );
`;

const StatusDot = styled.span<{ $color?: string }>`
    width: 6px;
    height: 6px;
    background: ${props => props.$color || 'var(--rivion-primary)'};
    border-radius: 50%;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

const ScreenBlock = ({ title, message, icon = faExclamationTriangle, iconColor, onBack, onRetry }: ScreenBlockProps) => {
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
    const strokeWidth = 1;
    const so = strokeWidth / 2;
    const cornerCut = 20;
    
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
        <PageContentBlock>
            <div css={tw`flex justify-center py-8`}>
                <ScreenBlockContainer ref={containerRef}>
                    <FrameSVG 
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="screenBlockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--rivion-primary)" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="var(--rivion-primary)" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        
                        <path
                            d={framePath}
                            fill="var(--rivion-card)"
                            stroke="var(--rivion-border)"
                            strokeWidth={strokeWidth}
                        />
                        
                        <path
                            d={framePath}
                            fill="url(#screenBlockGradient)"
                        />
                    </FrameSVG>
                    
                    <CornerAccent $position="top-left" />
                    <CornerAccent $position="top-right" />
                    <CornerAccent $position="bottom-left" />
                    <CornerAccent $position="bottom-right" />
                    
                    {(typeof onBack === 'function' || typeof onRetry === 'function') && (
                        <ActionContainer>
                            <ActionButton
                                onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
                                className={onRetry ? 'hover:spin' : undefined}
                            >
                                <FontAwesomeIcon icon={onRetry ? faSyncAlt : faArrowLeft} />
                            </ActionButton>
                        </ActionContainer>
                    )}
                    
                    <ContentWrapper>
                        <IconContainer $color={iconColor}>
                            <IconWrapper $color={iconColor}>
                                <FontAwesomeIcon icon={icon} />
                            </IconWrapper>
                        </IconContainer>
                        
                        <Title>{title}</Title>
                        <Message>{message}</Message>
                        
                        <StatusBar>
                            <StatusDot $color={iconColor} />
                            <span>System Status</span>
                        </StatusBar>
                    </ContentWrapper>
                </ScreenBlockContainer>
            </div>
        </PageContentBlock>
    );
};

type ServerErrorProps = (Omit<PropsWithBack, 'title'> | Omit<PropsWithRetry, 'title'>) & {
    title?: string;
};

const ServerError = ({ title, ...props }: ServerErrorProps) => (
    <ScreenBlock 
        title={title || 'Something went wrong'} 
        icon={faExclamationTriangle}
        iconColor="var(--rivion-danger)"
        {...props} 
    />
);

const NotFound = ({ title, message, onBack }: Partial<Pick<ScreenBlockProps, 'title' | 'message' | 'onBack'>>) => (
    <ScreenBlock
        title={title || '404'}
        icon={faSearch}
        iconColor="var(--rivion-primary)"
        message={message || 'The requested resource was not found.'}
        onBack={onBack}
    />
);


const ServerInstalling = ({ message }: { message?: string }) => (
    <ScreenBlock
        title="Running Installer"
        icon={faDownload}
        iconColor="var(--rivion-success)"
        message={message || 'Your server should be ready soon, please try again in a few minutes.'}
    />
);

const ServerSuspended = ({ message }: { message?: string }) => (
    <ScreenBlock
        title="Server Suspended"
        icon={faBan}
        iconColor="var(--rivion-danger)"
        message={message || 'This server is suspended and cannot be accessed.'}
    />
);

const NodeMaintenance = ({ message }: { message?: string }) => (
    <ScreenBlock
        title="Node Under Maintenance"
        icon={faTools}
        iconColor="var(--rivion-warning)"
        message={message || 'The node of this server is currently under maintenance.'}
    />
);

const ServerTransferring = ({ message }: { message?: string }) => (
    <ScreenBlock
        title="Transferring"
        icon={faExchangeAlt}
        iconColor="var(--rivion-info)"
        message={message || 'Your server is being transferred to a new node, please check back later.'}
    />
);

const ServerRestoring = ({ message }: { message?: string }) => (
    <ScreenBlock
        title="Restoring from Backup"
        icon={faHistory}
        iconColor="var(--rivion-primary)"
        message={message || 'Your server is currently being restored from a backup, please check back in a few minutes.'}
    />
);

const AccessDenied = ({ title, message }: { title?: string; message?: string }) => (
    <ScreenBlock
        title={title || 'Access Denied'}
        icon={faBan}
        iconColor="var(--rivion-danger)"
        message={message || 'You do not have permission to access this page.'}
    />
);

export { 
    ServerError, 
    NotFound, 
    ServerInstalling, 
    ServerSuspended, 
    NodeMaintenance, 
    ServerTransferring, 
    ServerRestoring,
    AccessDenied
};
export default ScreenBlock;

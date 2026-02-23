import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { mbToBytes } from '@/lib/formatters';
import { useBleeps } from '@/components/RivionBleepsProvider';

type Stats = Record<'memory' | 'cpu' | 'disk', number>;

interface OverloadConfig {
    enabled: boolean;
    text: string;
    buttonText: string;
    buttonLink: string;
    threshold: number;
}

interface ServerNotificationsConfig {
    enabled: boolean;
    overload: OverloadConfig;
}

const DEBUG_FORCE_SHOW = false;

const SUSTAINED_OVERLOAD_DURATION = 15000; 
const OVERLOAD_STORAGE_PREFIX = 'rivion_overload_';

const getOverloadStartTime = (serverUuid: string): number | null => {
    try {
        const stored = localStorage.getItem(`${OVERLOAD_STORAGE_PREFIX}${serverUuid}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.startTime || null;
        }
    } catch (e) {
        
    }
    return null;
};

const setOverloadStartTime = (serverUuid: string, startTime: number): void => {
    try {
        localStorage.setItem(`${OVERLOAD_STORAGE_PREFIX}${serverUuid}`, JSON.stringify({ startTime }));
    } catch (e) {
        
    }
};

const clearOverloadStartTime = (serverUuid: string): void => {
    try {
        localStorage.removeItem(`${OVERLOAD_STORAGE_PREFIX}${serverUuid}`);
    } catch (e) {
        
    }
};

const getDismissedState = (serverUuid: string): boolean => {
    try {
        const stored = localStorage.getItem(`${OVERLOAD_STORAGE_PREFIX}${serverUuid}_dismissed`);
        if (stored) {
            const parsed = JSON.parse(stored);
            
            if (parsed.dismissedAt && Date.now() - parsed.dismissedAt < 3600000) {
                return true;
            }
        }
    } catch (e) {
        
    }
    return false;
};

const setDismissedState = (serverUuid: string): void => {
    try {
        localStorage.setItem(`${OVERLOAD_STORAGE_PREFIX}${serverUuid}_dismissed`, JSON.stringify({ dismissedAt: Date.now() }));
    } catch (e) {
        
    }
};


const FrameContainer = styled.div<{ $isVisible: boolean }>`
    display: ${({ $isVisible }) => ($isVisible ? 'block' : 'none')};
    position: relative;
    margin-bottom: 1.5rem;
    animation: slideIn 0.3s ease-out;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
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
    padding: 1rem 1.25rem;
    padding-right: 2.5rem;
`;

interface ArwesFrameProps {
    children: React.ReactNode;
    isVisible: boolean;
    color?: string;
    className?: string;
}

const ArwesNotificationFrame: React.FC<ArwesFrameProps> = ({ children, isVisible, color = '#f59e0b', className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 80 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 300,
                    height: Math.floor(height) || 80
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
    const cornerCut = 10;
    const so = 0.5; 

  
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
        <FrameContainer ref={containerRef} $isVisible={isVisible} className={className}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >

                <path
                    data-name="bg"
                    d={framePath}
                    fill={`${color}25`}
                    stroke="none"
                />

                <path
                    data-name="line"
                    d={framePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    strokeLinejoin="miter"
                    strokeLinecap="butt"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
                />
            </FrameSVG>
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

const NotificationContent = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.75rem;
    }
`;

const IconWrapper = styled.div`
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(245, 158, 11, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
`;

const WarningIcon = styled(FontAwesomeIcon)`
    color: #f59e0b;
    font-size: 1.25rem;
`;

const TextContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const NotificationTitle = styled.h4`
    font-size: 0.9rem;
    font-weight: 600;
    color: #f59e0b;
    margin: 0;
    font-family: 'Orbitron', sans-serif;
`;

const NotificationText = styled.p`
    font-size: 0.875rem;
    color: var(--theme-text-base);
    margin: 0;
    line-height: 1.5;
    opacity: 0.9;
    font-family: 'Electrolize', sans-serif;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: transparent;
    border: none;
    color: var(--theme-text-muted);
    cursor: pointer;
    padding: 0.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 2;

    &:hover {
        color: #f59e0b;
    }
`;

interface ActionButtonFrameProps {
    href: string;
    children: React.ReactNode;
    target?: string;
    rel?: string;
}

const ActionButtonFrame: React.FC<ActionButtonFrameProps> = ({ href, children, target, rel }) => {
    const containerRef = useRef<HTMLAnchorElement>(null);
    const [dimensions, setDimensions] = useState({ width: 120, height: 34 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 120,
                    height: Math.floor(height) || 34
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
    const cornerCut = 6;
    const so = 0.5; 

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
        <a
            ref={containerRef}
            href={href}
            target={target}
            rel={rel}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                flexShrink: 0,
                alignSelf: 'center',
            }}
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
                    overflow: 'visible',
                }}
            >

                <path
                    d={framePath}
                    fill="rgba(245, 158, 11, 0.15)"
                    stroke="none"
                    style={{ transition: 'fill 0.2s' }}
                />

                <path
                    d={framePath}
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.6)"
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s' }}
                />
            </svg>
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '8px 16px',
                    color: '#f59e0b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: "'Orbitron', sans-serif",
                    gap: '8px',
                    transition: 'color 0.2s',
                }}
            >
                {children}
            </div>
        </a>
    );
};

const ServerOverloadNotification: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null); 
    const [isDismissed, setIsDismissed] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const bleeps = useBleeps();
    const hasPlayedOpenSound = useRef(false);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const serverUuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    
    const siteConfig = (window as any).SiteConfiguration as {
        serverNotifications?: ServerNotificationsConfig;
    } | undefined;

    const config = useMemo(() => {
        return siteConfig?.serverNotifications?.overload ?? {
            enabled: false,
            text: 'Your server is reaching its resource limits. Consider upgrading your plan for better performance.',
            buttonText: 'Upgrade Plan',
            buttonLink: '',
            threshold: 90,
        };
    }, [siteConfig]);

    const isFeatureEnabled = siteConfig?.serverNotifications?.enabled && config.enabled;

    useEffect(() => {
        console.log('[ServerOverloadNotification] Configuration check:', {
            siteConfig: siteConfig?.serverNotifications,
            configEnabled: config.enabled,
            isFeatureEnabled,
            threshold: config.threshold,
            text: config.text
        });
    }, [siteConfig, config, isFeatureEnabled]);

    
    useEffect(() => {
        if (serverUuid) {
            setIsDismissed(getDismissedState(serverUuid));
        }
    }, [serverUuid]);

    useEffect(() => {
        if (!serverUuid || !isFeatureEnabled) return;
        
        const storedStartTime = getOverloadStartTime(serverUuid);
        if (storedStartTime !== null) {
            const elapsed = Date.now() - storedStartTime;
            if (elapsed >= SUSTAINED_OVERLOAD_DURATION) {
                setShowNotification(true);
            }
        }
    }, [serverUuid, isFeatureEnabled]);

    const handleDismiss = useCallback(() => {
        bleeps.close?.play();
        setIsDismissed(true);
        if (serverUuid) {
            setDismissedState(serverUuid);
        }
    }, [serverUuid, bleeps]);

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }
        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let parsedStats: any = {};
        try {
            parsedStats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: parsedStats.memory_bytes,
            cpu: parsedStats.cpu_absolute,
            disk: parsedStats.disk_bytes,
        });
    });


    const cpuUsagePercent = stats && limits?.cpu ? (stats.cpu / limits.cpu) * 100 : 0;
    const memoryUsagePercent = stats && limits?.memory ? (stats.memory / mbToBytes(limits.memory)) * 100 : 0;

    useEffect(() => {
        if (stats && isFeatureEnabled) {
            console.log('[ServerOverloadNotification] Stats:', {
                cpu: stats.cpu,
                memory: stats.memory,
                cpuLimit: limits?.cpu,
                memoryLimit: limits?.memory,
                cpuUsagePercent,
                memoryUsagePercent,
                threshold: config.threshold,
                isFeatureEnabled,
                showNotification,
                isDismissed,
                status
            });
        }
    }, [stats, cpuUsagePercent, memoryUsagePercent, isFeatureEnabled, showNotification, isDismissed, status]);

    const isCpuOverloaded = stats && limits?.cpu && cpuUsagePercent >= config.threshold;
    const isMemoryOverloaded = stats && limits?.memory && memoryUsagePercent >= config.threshold;
    const isCurrentlyOverloaded = isCpuOverloaded || isMemoryOverloaded;

    useEffect(() => {
        if (!serverUuid || stats === null) return; 

        console.log('[ServerOverloadNotification] Overload check:', {
            isCurrentlyOverloaded,
            isCpuOverloaded,
            isMemoryOverloaded,
            cpuUsagePercent,
            memoryUsagePercent,
            threshold: config.threshold,
            status
        });

        if (isCurrentlyOverloaded && status !== 'offline') {
            
            let startTime = getOverloadStartTime(serverUuid);
            
            if (startTime === null) {
                console.log('[ServerOverloadNotification] Starting overload timer');
                startTime = Date.now();
                setOverloadStartTime(serverUuid, startTime);
            }
            
            
            const checkSustained = () => {
                const storedStartTime = getOverloadStartTime(serverUuid);
                if (storedStartTime !== null) {
                    const elapsed = Date.now() - storedStartTime;
                    console.log('[ServerOverloadNotification] Sustained check:', { elapsed, required: SUSTAINED_OVERLOAD_DURATION });
                    if (elapsed >= SUSTAINED_OVERLOAD_DURATION) {
                        console.log('[ServerOverloadNotification] Showing notification!');
                        setShowNotification(true);
                    }
                }
            };
            
           
            checkSustained();
            
            
            const intervalId = setInterval(checkSustained, 1000);
            
            return () => clearInterval(intervalId);
        } else if (stats !== null) {
            
            clearOverloadStartTime(serverUuid);
            setShowNotification(false);
        }
    }, [isCurrentlyOverloaded, status, serverUuid, stats]);

    const shouldRender = DEBUG_FORCE_SHOW || (isFeatureEnabled && !isDismissed && status !== 'offline' && showNotification);
    
    useEffect(() => {
        if (shouldRender && !hasPlayedOpenSound.current) {
            bleeps.open?.play();
            hasPlayedOpenSound.current = true;
        }
        if (!shouldRender) {
            hasPlayedOpenSound.current = false;
        }
    }, [shouldRender, bleeps]);
    
    console.log('[ServerOverloadNotification] Render decision:', {
        DEBUG_FORCE_SHOW,
        isFeatureEnabled,
        isDismissed,
        status,
        showNotification,
        shouldRender
    });

    if (!shouldRender) {
        return null;
    }

    return (
        <ArwesNotificationFrame isVisible={true} color="#f59e0b">
            <CloseButton onClick={handleDismiss} title="Dismiss">
                <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
            <NotificationContent>
                <IconWrapper>
                    <WarningIcon icon={faExclamationTriangle} />
                </IconWrapper>
                <TextContent>
                    <NotificationTitle>Server Resource Alert</NotificationTitle>
                    <NotificationText>{config.text}</NotificationText>
                </TextContent>
                {config.buttonLink && (
                    <ActionButtonFrame href={config.buttonLink} target="_blank" rel="noopener noreferrer">
                        {config.buttonText}
                        <FontAwesomeIcon icon={faArrowRight} />
                    </ActionButtonFrame>
                )}
            </NotificationContent>
        </ArwesNotificationFrame>
    );
};

export default ServerOverloadNotification;

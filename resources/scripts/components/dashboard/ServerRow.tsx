import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Spinner from '@/components/elements/Spinner';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';
import { useTranslation } from 'react-i18next';
import { useBleeps } from '@/components/RivionBleepsProvider';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const FrameContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
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
    width: 100%;
    height: 100%;
`;

const ServerRowFrame: React.FC<{ children: React.ReactNode; backgroundImage?: string; serverId: string; isSuspended?: boolean }> = ({ children, backgroundImage, serverId, isSuspended = false }) => {
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
    
    const patternId = `serverBgImage-${serverId}`;
    
    const borderColor = isSuspended ? '#ef4444' : 'var(--theme-primary)';
    
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
        <FrameContainer ref={containerRef}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >

                <defs>
                    {backgroundImage && (
                        <pattern id={patternId} patternUnits="objectBoundingBox" width="1" height="1">
                            <image href={backgroundImage} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
                        </pattern>
                    )}
                </defs>
                
                <path
                    d={framePath}
                    fill={backgroundImage ? `url(#${patternId})` : "var(--theme-background-secondary)"}
                    stroke="none"
                />
                

                {backgroundImage && (
                    <path
                        d={framePath}
                        fill="var(--theme-background-secondary)"
                        fillOpacity="0.8"
                        stroke="none"
                    />
                )}
                
                {/* Red overlay when suspended */}
                {isSuspended && (
                    <path
                        d={framePath}
                        fill="#ef4444"
                        fillOpacity="0.1"
                        stroke="none"
                    />
                )}
                

                <path
                    d={framePath}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                />
            </FrameSVG>
            
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

const Icon = memo(
    styled(FontAwesomeIcon)<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? `color: var(--theme-primary);` : `color: var(--theme-text-muted);`)};
    `,
    isEqual
);

const IconDescription = styled.p<{ $alarm: boolean }>`
    ${tw`text-sm ml-2`};
    ${(props) => (props.$alarm ? `color: var(--theme-text-base);` : `color: var(--theme-text-muted);`)};
`;


const UsageBarText = styled.div`
    font-size: 0.75rem;
    color: var(--theme-text-muted);
    text-align: left;
    margin: 0;
`;

const AngledButton = styled.button`
    width: 100%;
    padding: 0.625rem 1rem;
    background: var(--theme-primary);
    color: var(--theme-text-base);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    clip-path: polygon(
        12px 0,
        100% 0,
        100% calc(100% - 12px),
        calc(100% - 12px) 100%,
        0 100%,
        0 12px
    );
    
    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const StatusIndicatorBox = styled(GreyRowBox)<{ $status: ServerPowerState | undefined; $backgroundImage?: string }>`
    /* Override GreyRowBox defaults and use grid layout matching existing structure */
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 0.5rem;
    position: relative !important;
    overflow: hidden !important;
    padding: 0.75rem !important; /* Override GreyRowBox padding */
    height: auto !important;
    min-height: 0 !important; /* Remove min-height constraint */

    /* Match your theme's background styling */
    background-color: var(--theme-background-secondary) !important;
    border: 1px solid var(--theme-border) !important;
    border-radius: 0.5rem !important;

    /* Add background image support from egg configuration */
    ${({ $backgroundImage }) =>
        $backgroundImage &&
        `
        background-image: url(${$backgroundImage}) !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        `};

    /* Add simple semi-transparent overlay using theme background color */
    ${({ $backgroundImage }) =>
        $backgroundImage &&
        `
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--theme-background-secondary);
            opacity: 0.6;
            z-index: 1;
            pointer-events: none;
        }
        `};

    /* Add gradient overlay similar to sidebar selected items but vertical (bottom to top) */
    ${({ $backgroundImage }) =>
        $backgroundImage &&
        `
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(0deg, color-mix(in srgb, var(--theme-background-secondary) 85%, transparent) 0%, transparent 100%);
            z-index: 2;
            pointer-events: none;
            border-radius: 0.5rem;
        }
        `};

    /* Disable GreyRowBox hover effect completely */
    &:hover {
        border-color: var(--theme-border) !important;
        opacity: 1; /* Reset opacity from GreyRowBox */
    }

    /* Ensure content is above any background when present */
    & > * {
        position: relative;
        z-index: 3;
    }

    /* Status badge styling matching your theme */
    .status-badge {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        z-index: 20;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.15s ease-in-out;
    }
`;

type Timer = ReturnType<typeof setInterval>;

const getStatusBadge = (status: ServerPowerState | undefined, isSuspended: boolean, isTransferring: boolean, serverStatus: string | null, t: any) => {
    if (isSuspended) {
        return {
            text: t('dashboard.serverRow.status.suspended'),
            color: '#ef4444'
        };
    }
    
    if (isTransferring) {
        return {
            text: t('dashboard.serverRow.status.transfer'),
            color: '#f59e0b'
        };
    }
    
    if (serverStatus === 'installing') {
        return {
            text: t('dashboard.serverRow.status.install'),
            color: '#3b82f6'
        };
    }
    
    if (serverStatus === 'restoring_backup') {
        return {
            text: t('dashboard.serverRow.status.restore'),
            color: '#8b5cf6'
        };
    }
    
    if (!status || status === 'offline') {
        return {
            text: t('dashboard.serverRow.status.offline'),
            color: '#ef4444'
        };
    }
    
    if (status === 'running') {
        return {
            text: t('dashboard.serverRow.status.online'),
            color: '#10b981'
        };
    }
    
    return {
        text: t('dashboard.serverRow.status.starting'),
        color: '#f59e0b'
    };
};

const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === 0) return 0;
    return (used / limit) * 100;
};

const parseLimit = (limit: string): number => {
    if (limit === 'Unlimited' || limit === '∞') return Infinity;
    const match = limit.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
};

export default ({ server, className, onPowerAction }: { 
    server: Server; 
    className?: string;
    onPowerAction?: (server: Server) => void;
}) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const { t } = useTranslation();
    const bleeps = useBleeps();

    const getBackgroundImage = () => {
        const serverWithEggImage = server as any;
        
        const eggImageUrl = serverWithEggImage.eggImage || 
                           serverWithEggImage.egg_image || 
                           serverWithEggImage.relationships?.egg?.attributes?.image ||
                           serverWithEggImage.egg?.image;
        
        if (eggImageUrl) {
            console.log(`[ServerRow] Using egg image for server "${server.name}": ${eggImageUrl}`);
            return eggImageUrl;
        }
        
        console.log(`[ServerRow] No egg image found for server "${server.name}"`, serverWithEggImage);
        return undefined;
    };

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data: any) => setStats(data))
            .catch((error: any) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {

        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, server.uuid]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';

    const handleCardClick = (e: React.MouseEvent) => {

        const target = e.target as HTMLElement;
        const isInteractiveElement = target.tagName === 'BUTTON' || 
                                   target.tagName === 'A' || 
                                   target.closest('button') || 
                                   target.closest('a');
        

        if (!isInteractiveElement && onPowerAction && !isSuspended) {
            onPowerAction(server);
        }
    };

    return (
        <div 
            className={className}
            onClick={handleCardClick}
            style={{ cursor: onPowerAction && !isSuspended ? 'pointer' : 'default' }}
        >
            <ServerRowFrame backgroundImage={getBackgroundImage()} serverId={server.uuid} isSuspended={isSuspended}>
                <div style={{ 
                    padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    gap: '0.5rem',
                    position: 'relative'
                }}>

                    <div css={tw`col-span-12 mb-3`}>
                        <div>
                            <p css={[
                                tw`text-lg font-semibold break-words`, 
                                { 
                                    color: 'var(--theme-text-base)', 
                                    lineHeight: '1.3',
                                    fontFamily: '"Orbitron", "Electrolize", sans-serif',
                                    letterSpacing: '0.03em',
                                    textTransform: 'uppercase'
                                }
                            ]}>{server.name}</p>
                            <p css={[
                                tw`text-sm break-words line-clamp-2 mt-1`, 
                                { 
                                    color: 'var(--theme-text-muted)', 
                                    fontSize: '0.875rem',
                                    minHeight: '2.5rem',
                                    visibility: server.description ? 'visible' : 'hidden'
                                }
                            ]}>
                                {server.description || '\u00A0'}
                            </p>
                        </div>


                        {(() => {
                            const statusInfo = getStatusBadge(stats?.status, isSuspended, server.isTransferring, server.status, t);
                            return (
                                <div 
                                    className="status-badge"
                                    css={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.625rem',
                                        backgroundColor: 'transparent',
                                        color: statusInfo.color,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        position: 'absolute',
                                        top: '1.25rem',
                                        right: '1.25rem',
                                        zIndex: 20,
                                        transition: 'transform 0.15s ease-in-out',
                                    }}
                                >
                                    <span 
                                        css={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            width: '10px',
                                            height: '10px',
                                        }}
                                    >
                                        {/* Dot */}
                                        <span 
                                            css={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '50%',
                                                backgroundColor: statusInfo.color,
                                                animation: status === 'running' ? 'dotPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                                                '@keyframes dotPulse': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0.6 }
                                                }
                                            }}
                                        />
                                        {/* Ring animation */}
                                        {status === 'running' && (
                                            <span 
                                                css={{
                                                    position: 'absolute',
                                                    inset: '-4px',
                                                    borderRadius: '50%',
                                                    border: `2px solid ${statusInfo.color}`,
                                                    animation: 'ringPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                    '@keyframes ringPulse': {
                                                        '0%': { 
                                                            opacity: 0.8,
                                                            transform: 'scale(1)'
                                                        },
                                                        '100%': { 
                                                            opacity: 0,
                                                            transform: 'scale(1.5)'
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </span>
                                    {statusInfo.text}
                                </div>
                            );
                        })()}
                    </div>


            <div css={[tw`col-span-12 grid grid-cols-2 gap-x-6 gap-y-3`, { marginTop: '0.5rem' }]}>
                {/* Top Row */}
                <div css={tw`flex items-center`}>
                    <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                        {t('dashboard.serverRow.resources.ip')}: <span css={{ color: 'var(--theme-text-base)', fontWeight: 500 }}>
                            {server.allocations
                                .filter((alloc: any) => alloc.isDefault)
                                .map((allocation: any) => (
                                    <React.Fragment key={allocation.ip + allocation.port.toString()}>
                                        {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                    </React.Fragment>
                                ))}
                        </span>
                    </p>
                </div>
                <div css={tw`flex items-center`}>
                    {!stats || isSuspended ? (
                        <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                            {t('dashboard.serverRow.resources.cpu')}: <span css={{ color: 'var(--theme-text-base)', fontWeight: 500 }}>--</span>
                        </p>
                    ) : (
                        <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                            {t('dashboard.serverRow.resources.cpu')}: <span css={{ 
                                color: alarms.cpu ? 'var(--theme-primary)' : 'var(--theme-text-base)', 
                                fontWeight: 500,
                                textShadow: alarms.cpu ? '0 0 4px rgba(var(--theme-primary-rgb), 0.3)' : 'none'
                            }}>
                                {stats.cpuUsagePercent.toFixed(0)}%
                            </span>
                        </p>
                    )}
                </div>
                
                {/* Bottom Row */}
                <div css={tw`flex items-center`}>
                    {!stats || isSuspended ? (
                        <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                            {t('dashboard.serverRow.resources.ram')}: <span css={{ color: 'var(--theme-text-base)', fontWeight: 500 }}>--</span>
                        </p>
                    ) : (
                        <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                            {t('dashboard.serverRow.resources.ram')}: <span css={{ 
                                color: alarms.memory ? 'var(--theme-primary)' : 'var(--theme-text-base)', 
                                fontWeight: 500,
                                textShadow: alarms.memory ? '0 0 4px rgba(var(--theme-primary-rgb), 0.3)' : 'none'
                            }}>
                                {bytesToString(stats.memoryUsageInBytes)}
                            </span>
                        </p>
                    )}
                </div>
                <div css={tw`flex items-center`}>
                    {!stats || isSuspended ? (
                        <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                            {t('dashboard.serverRow.resources.storage')}: <span css={{ color: 'var(--theme-text-base)', fontWeight: 500 }}>--</span>
                        </p>
                    ) : (
                        <p css={[tw`text-sm font-medium`, { color: 'var(--theme-text-muted)' }]}>
                            {t('dashboard.serverRow.resources.storage')}: <span css={{ 
                                color: alarms.disk ? 'var(--theme-primary)' : 'var(--theme-text-base)', 
                                fontWeight: 500,
                                textShadow: alarms.disk ? '0 0 4px rgba(var(--theme-primary-rgb), 0.3)' : 'none'
                            }}>
                                {bytesToString(stats.diskUsageInBytes)}
                            </span>
                        </p>
                    )}
                </div>
            </div>


            {(!stats || server.isTransferring || server.status) && !isSuspended && (
                <div css={[tw`col-span-12 mt-2`, { 
                    position: !stats && !server.isTransferring && !server.status ? 'absolute' : 'relative',
                    top: !stats && !server.isTransferring && !server.status ? '50%' : 'auto',
                    left: !stats && !server.isTransferring && !server.status ? '50%' : 'auto',
                    transform: !stats && !server.isTransferring && !server.status ? 'translate(-50%, -50%)' : 'none',
                    zIndex: !stats && !server.isTransferring && !server.status ? 10 : 'auto',
                    marginTop: !stats && !server.isTransferring && !server.status ? 0 : undefined
                }]}>
                    {server.isTransferring || server.status ? (
                        <span css={tw`bg-neutral-500 rounded px-2 py-1 text-neutral-100 text-xs`}>
                            {server.isTransferring
                                ? t('dashboard.serverRow.status.transferring')
                                : server.status === 'installing'
                                ? t('dashboard.serverRow.status.installing')
                                : server.status === 'restoring_backup'
                                ? t('dashboard.serverRow.status.restoringBackup')
                                : t('dashboard.serverRow.status.unavailable')}
                        </span>
                    ) : !stats ? (
                        <Spinner size={'small'} />
                    ) : null}
                </div>
            )}


            <div css={tw`col-span-12 mt-4`} onClick={(e) => e.stopPropagation()}>
                {isSuspended ? (
                    <AngledButton 
                        style={{ 
                            background: '#ef4444', 
                            cursor: 'not-allowed',
                            opacity: 0.8
                        }}
                        onClick={(e) => e.preventDefault()}
                        disabled
                    >
                        {t('dashboard.serverRow.status.suspended')}
                    </AngledButton>
                ) : (
                    <Link to={`/server/${server.id}`} css={tw`block w-full`} onClick={() => bleeps.click?.play()}>
                        <AngledButton>
                            {t('dashboard.serverRow.manageServer')}
                        </AngledButton>
                    </Link>
                )}
            </div>
                </div>
            </ServerRowFrame>
        </div>
    );
};
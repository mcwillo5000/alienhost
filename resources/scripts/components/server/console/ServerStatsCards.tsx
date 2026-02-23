import React, { useEffect, useMemo, useState, useRef } from 'react';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { capitalize } from '@/lib/strings';
import { 
    faServer,
    faMicrochip,
    faMemory,
    faHdd,
    faCopy
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const FrameContainer = styled.div`
    position: relative;
    width: 100%;
    flex-shrink: 0;
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

interface StatCardFrameProps {
    children: React.ReactNode;
    className?: string;
}

const StatCardFrame: React.FC<StatCardFrameProps> = ({ children, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 120 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 200,
                    height: Math.floor(height) || 120
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
        <FrameContainer ref={containerRef} className={className}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <filter id="statsFrameGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <path
                    data-name="bg"
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />
                <path
                    data-name="line"
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-border)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    style={{ filter: 'drop-shadow(0 0 2px var(--theme-border))' }}
                />
            </FrameSVG>
            <FrameContent className="p-3">
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

const getBackgroundColor = (value: number, max: number | null): string | undefined => {
    const delta = !max ? 0 : value / max;

    if (delta > 0.8) {
        if (delta > 0.9) {
            return 'bg-red-500';
        }
        return 'bg-yellow-500';
    }

    return undefined;
};

const ServerStatsCards = () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });
    const { t } = useTranslation();

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }
        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const getProgressPercentage = (current: number, max: number | null): number => {
        if (!max) return 0;
        return Math.min((current / max) * 100, 100);
    };

    const isOffline = status === 'offline';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCardFrame>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faServer} className="mr-2 text-xs" style={{color: 'var(--theme-primary)'}} />
                        <h4 className="text-xs font-medium" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>{t('console.stats.serverAddress')}</h4>
                    </div>
                    <button 
                        onClick={() => copyToClipboard(allocation)}
                        className="text-xs px-1 py-1 transition-colors" 
                        style={{
                            color: 'var(--theme-text-muted)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
                        title={t('console.stats.copyTooltip')}
                    >
                        <FontAwesomeIcon icon={faCopy} className="text-xs" />
                    </button>
                </div>
                <button 
                    onClick={() => copyToClipboard(allocation)}
                    className="text-sm font-bold mb-2 text-left transition-colors px-1 py-1 cursor-pointer w-full" 
                    style={{color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif"}}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-base)'}
                    title={t('console.stats.clickToCopy')}
                >
                    {allocation}
                </button>
                
                <div className="mb-2" style={{borderTop: '1px solid var(--theme-primary)', opacity: 0.3}}></div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`w-2 h-2 mr-3 ${status === 'running' ? 'bg-green-400 animate-pulse' : status !== 'offline' ? 'bg-yellow-400' : 'bg-red-400'}`} style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                        <span className="text-xs" style={{color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif"}}>{t('console.stats.uptime')}:</span>
                    </div>
                    <div className="text-xs font-medium" style={{color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif"}}>
                        {status === null ? (
                            t('console.stats.offline')
                        ) : stats.uptime > 0 ? (
                            <UptimeDuration uptime={stats.uptime / 1000} />
                        ) : (
                            capitalize(status)
                        )}
                    </div>
                </div>
            </StatCardFrame>

            <StatCardFrame>
                <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faMicrochip} className="mr-2 text-xs" style={{color: 'var(--theme-primary)'}} />
                    <h4 className="text-xs font-medium" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>{t('console.stats.cpuUsage')}</h4>
                </div>
                <div className="text-lg font-bold mb-1" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>
                    {isOffline ? (
                        <span style={{color: 'var(--theme-text-muted)'}}>{t('console.stats.offline')}</span>
                    ) : (
                        <span>{stats.cpu.toFixed(2)}%</span>
                    )}
                </div>
                <div className="text-xs mb-2" style={{color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif"}}>
                    of {textLimits.cpu || '∞'} limit
                </div>
                <div className="w-full h-2" style={{backgroundColor: 'var(--theme-background)', clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'}}>
                    <div 
                        className="bg-blue-500 h-2 transition-all duration-300" 
                        style={{width: `${isOffline ? 0 : getProgressPercentage(stats.cpu, limits.cpu)}%`, clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'}}
                    ></div>
                </div>
            </StatCardFrame>

            <StatCardFrame>
                <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faMemory} className="mr-2 text-xs" style={{color: 'var(--theme-primary)'}} />
                    <h4 className="text-xs font-medium" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>{t('console.stats.memoryUsage')}</h4>
                </div>
                <div className="text-lg font-bold mb-1" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>
                    {isOffline ? (
                        <span style={{color: 'var(--theme-text-muted)'}}>{t('console.stats.offline')}</span>
                    ) : (
                        bytesToString(stats.memory)
                    )}
                </div>
                <div className="text-xs mb-2" style={{color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif"}}>
                    of {textLimits.memory || '∞'} limit
                </div>
                <div className="w-full h-2" style={{backgroundColor: 'var(--theme-background)', clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'}}>
                    <div 
                        className="bg-green-500 h-2 transition-all duration-300" 
                        style={{width: `${isOffline ? 0 : getProgressPercentage(stats.memory / 1024, limits.memory * 1024)}%`, clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'}}
                    ></div>
                </div>
            </StatCardFrame>

            <StatCardFrame>
                <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faHdd} className="mr-2 text-xs" style={{color: 'var(--theme-primary)'}} />
                    <h4 className="text-xs font-medium" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>{t('console.stats.diskUsage')}</h4>
                </div>
                <div className="text-lg font-bold mb-1" style={{color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif"}}>
                    {bytesToString(stats.disk)}
                </div>
                <div className="text-xs mb-2" style={{color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif"}}>
                    of {textLimits.disk || '∞'} limit
                </div>
                <div className="w-full h-2" style={{backgroundColor: 'var(--theme-background)', clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'}}>
                    <div 
                        className="bg-purple-500 h-2 transition-all duration-300" 
                        style={{width: `${getProgressPercentage(stats.disk / 1024, limits.disk * 1024)}%`, clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'}}
                    ></div>
                </div>
            </StatCardFrame>
        </div>
    );
};

export default ServerStatsCards;
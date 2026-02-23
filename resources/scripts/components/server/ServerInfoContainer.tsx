import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Can from '@/components/elements/Can';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import FuturisticFormButton from '@/components/elements/rivion/FuturisticFormButton';
import UptimeDuration from '@/components/server/UptimeDuration';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { capitalize } from '@/lib/strings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faServer,
    faFileDownload,
    faMicrochip,
    faMemory,
    faHdd,
    faNetworkWired,
    faClock,
    faIdCard,
    faGlobe,
    faSitemap,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import PowerButtons from '@/components/server/console/PowerButtons';
import isEqual from 'react-fast-compare';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;


const BannerContainer = styled.div`
    position: relative;
    width: 100%;
    height: 200px;
    margin-bottom: 1.5rem;
    overflow: hidden;
`;

const BannerSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

const BannerContent = styled.div<{ $backgroundImage?: string }>`
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    ${({ $backgroundImage }) =>
        $backgroundImage
            ? `
        background-image: url(${$backgroundImage});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    `
            : `
        background: linear-gradient(135deg, var(--theme-background-secondary) 0%, var(--theme-background) 100%);
    `}
`;

const BannerOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(0, 0, 0, 0.3) 50%,
        rgba(0, 0, 0, 0.6) 100%
    );
    z-index: 2;
`;

const BannerText = styled.div`
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 3;
`;

const BannerTitle = styled.h1`
    font-family: 'Orbitron', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    margin: 0;
`;

const BannerSubtitle = styled.p`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0.25rem 0 0 0;
`;

interface BannerFrameProps {
    children: React.ReactNode;
    backgroundImage?: string;
}

const BannerFrame: React.FC<BannerFrameProps> = ({ children, backgroundImage }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 200 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 800,
                    height: Math.floor(height) || 200,
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
    const cornerCut = 16;
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
        <BannerContainer ref={containerRef}>
            <BannerSVG
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <clipPath id="bannerClip">
                        <path d={framePath} />
                    </clipPath>
                </defs>
                <path
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-primary)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    style={{ filter: 'drop-shadow(0 0 4px var(--theme-primary))' }}
                />
            </BannerSVG>
            <BannerContent
                $backgroundImage={backgroundImage}
                style={{ clipPath: `polygon(0px ${cornerCut}px, ${cornerCut}px 0px, 100% 0px, 100% calc(100% - ${cornerCut}px), calc(100% - ${cornerCut}px) 100%, 0px 100%)` }}
            >
                <BannerOverlay />
                {children}
            </BannerContent>
        </BannerContainer>
    );
};


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
                    height: Math.floor(height) || 120,
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
            <FrameContent className="p-4">{children}</FrameContent>
        </FrameContainer>
    );
};


const InfoRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--theme-border);
    
    &:last-child {
        border-bottom: none;
    }
`;

const InfoLabel = styled.span`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.875rem;
    color: var(--theme-text-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InfoValue = styled.span`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.875rem;
    color: var(--theme-text-base);
    font-weight: 500;
    
    &.hover-primary:hover {
        color: var(--theme-primary);
    }
`;

const StatusDot = styled.span<{ $status: string }>`
    width: 8px;
    height: 8px;
    display: inline-block;
    margin-right: 0.5rem;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    
    ${({ $status }) => {
        switch ($status) {
            case 'running':
                return 'background-color: #10b981; animation: pulse 2s infinite;';
            case 'starting':
            case 'stopping':
                return 'background-color: #f59e0b;';
            default:
                return 'background-color: #ef4444;';
        }
    }}
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;


const ServerHeaderCard = styled.div`
    position: relative;
    overflow: visible;
    margin-bottom: 1.5rem;
    background-color: transparent;
`;

const ServerHeaderContent = styled.div<{ $backgroundImage?: string }>`
    position: relative;
    z-index: 1;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--theme-background-secondary);
    clip-path: polygon(0px 12px, 12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%);
    box-shadow: 0 0 10px rgba(var(--theme-border-rgb, 55, 65, 81), 0.4),
                inset 0 0 15px rgba(0, 0, 0, 0.2);
    
    &::before {
        content: '';
        position: absolute;
        inset: -1px;
        background: var(--theme-border);
        clip-path: polygon(0px 12px, 12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%);
        z-index: -2;
        box-shadow: 0 0 6px var(--theme-border);
    }
    
    ${({ $backgroundImage }) =>
        $backgroundImage &&
        `
        &::after {
            content: '';
            position: absolute;
            inset: 1px;
            background-image: url(${$backgroundImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.2;
            clip-path: polygon(0px 11px, 11px 0px, 100% 0px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0px 100%);
            z-index: -1;
        }
        `};
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
`;

const ServerIconContainer = styled.div`
    height: 3rem;
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(59, 130, 246, 0.1);
    clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;

const ServerIcon = styled(FontAwesomeIcon)`
    font-size: 1.25rem;
    color: #3b82f6;
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
`;

const ServerInfoHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ServerDetailsHeader = styled.div`
    display: flex;
    flex-direction: column;
`;

const ServerNameHeader = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text-base);
    margin: 0;
    line-height: 1.4;
    font-family: 'Orbitron', sans-serif;
`;

const ServerDescriptionHeader = styled.p`
    font-size: 0.875rem;
    color: var(--theme-text-muted);
    margin: 0;
    line-height: 1.4;
    font-family: 'Electrolize', sans-serif;
`;

const PowerControlsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    
    @media (max-width: 768px) {
        width: 100%;
        justify-content: stretch;
        
        & > div {
            flex: 1;
        }
        
        & .flex {
            width: 100%;
        }
        
        & .space-x-2 > * + * {
            margin-left: 0.5rem;
        }
        
        & button {
            flex: 1;
            min-width: 0;
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
        }
    }
`;

const ServerInfoContainer = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });
    const [hideServerImage, setHideServerImage] = useState(false);
    
    const username = useStoreState((state) => state.user.data!.username);
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);
    const description = server.description;


    useEffect(() => {
        const siteConfig = (window as any).SiteConfiguration;
        if (siteConfig?.serverInfoSettings?.hideImage) {
            setHideServerImage(true);
        }
    }, []);

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? 'n/a' : `${ip(match.ip)}:${match.port}`;
    });

    const hostname = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return match?.alias || null;
    });

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const getBackgroundImage = () => {
        const serverWithEggImage = server as any;
        if (serverWithEggImage.eggImage || serverWithEggImage.egg_image) {
            return serverWithEggImage.eggImage || serverWithEggImage.egg_image;
        }
        return undefined;
    };

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
            tx: parsedStats.network.tx_bytes,
            rx: parsedStats.network.rx_bytes,
            uptime: parsedStats.uptime || 0,
        });
    });

    const getProgressPercentage = (current: number, max: number | null): number => {
        if (!max) return 0;
        return Math.min((current / max) * 100, 100);
    };

    const isOffline = status === 'offline';

    return (
        <ServerContentBlock title={t('serverInfo.title')}>
            
            <ServerHeaderCard>
                <ServerHeaderContent $backgroundImage={getBackgroundImage()}>
                    <ServerInfoHeader>
                        <ServerIconContainer>
                            <ServerIcon icon={faServer} />
                        </ServerIconContainer>
                        <ServerDetailsHeader>
                            <ServerNameHeader>{server.name}</ServerNameHeader>
                            <ServerDescriptionHeader>
                                {description || `Server UUID: ${server.uuid.substring(0, 8)}`}
                            </ServerDescriptionHeader>
                        </ServerDetailsHeader>
                    </ServerInfoHeader>
                    <PowerControlsContainer>
                        <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                            <div className="flex items-center space-x-2">
                                <PowerButtons className={'flex space-x-2'} />
                            </div>
                        </Can>
                    </PowerControlsContainer>
                </ServerHeaderContent>
            </ServerHeaderCard>

            
            {!hideServerImage && (
                <BannerFrame backgroundImage={getBackgroundImage()}>
                    <BannerText>
                        <BannerTitle>{server.name}</BannerTitle>
                        <BannerSubtitle>
                            {server.description || `UUID: ${server.uuid.substring(0, 8)}...`}
                        </BannerSubtitle>
                    </BannerText>
                </BannerFrame>
            )}

            
            <div css={tw`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6`}>
                
                <TitledGreyBox title={t('serverInfo.serverDetails')}>
                    <div>
                        <InfoRow>
                            <InfoLabel>
                                <FontAwesomeIcon icon={faServer} style={{ color: 'var(--theme-primary)' }} />
                                {t('serverInfo.status')}
                            </InfoLabel>
                            <InfoValue>
                                <StatusDot $status={status || 'offline'} />
                                {status ? capitalize(status) : t('serverInfo.offline')}
                            </InfoValue>
                        </InfoRow>

                        <InfoRow>
                            <InfoLabel>
                                <FontAwesomeIcon icon={faClock} style={{ color: 'var(--theme-primary)' }} />
                                {t('serverInfo.uptime')}
                            </InfoLabel>
                            <InfoValue>
                                {status === null || isOffline ? (
                                    t('serverInfo.offline')
                                ) : stats.uptime > 0 ? (
                                    <UptimeDuration uptime={stats.uptime / 1000} />
                                ) : (
                                    capitalize(status || '')
                                )}
                            </InfoValue>
                        </InfoRow>

                        <InfoRow>
                            <InfoLabel>
                                <FontAwesomeIcon icon={faNetworkWired} style={{ color: 'var(--theme-primary)' }} />
                                {t('serverInfo.ipAddress')}
                            </InfoLabel>
                            <CopyOnClick text={hostname ? allocation.split(':')[0] : allocation}>
                                <InfoValue style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover-primary">
                                    {hostname ? allocation.split(':')[0] : allocation}
                                </InfoValue>
                            </CopyOnClick>
                        </InfoRow>

                        {hostname && (
                            <InfoRow>
                                <InfoLabel>
                                    <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--theme-primary)' }} />
                                    {t('serverInfo.hostname')}
                                </InfoLabel>
                                <CopyOnClick text={hostname}>
                                    <InfoValue style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover-primary">
                                        {hostname}
                                    </InfoValue>
                                </CopyOnClick>
                            </InfoRow>
                        )}

                        <InfoRow>
                            <InfoLabel>
                                <FontAwesomeIcon icon={faSitemap} style={{ color: 'var(--theme-primary)' }} />
                                {t('serverInfo.node')}
                            </InfoLabel>
                            <InfoValue>{server.node}</InfoValue>
                        </InfoRow>

                        <InfoRow>
                            <InfoLabel>
                                <FontAwesomeIcon icon={faIdCard} style={{ color: 'var(--theme-primary)' }} />
                                {t('serverInfo.serverId')}
                            </InfoLabel>
                            <CopyOnClick text={server.uuid}>
                                <InfoValue style={{ cursor: 'pointer', transition: 'color 0.2s', fontFamily: 'monospace', fontSize: '0.75rem' }} className="hover-primary">
                                    {server.uuid.substring(0, 16)}...
                                </InfoValue>
                            </CopyOnClick>
                        </InfoRow>
                    </div>
                </TitledGreyBox>

                
                <Can action={'file.sftp'}>
                    <TitledGreyBox title={t('serverInfo.sftpDetails')}>
                        <div css={tw`space-y-4`}>
                            <div>
                                <Label>{t('settings.sftp.serverAddress')}</Label>
                                <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                    <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div>
                                <Label>{t('settings.sftp.username')}</Label>
                                <CopyOnClick text={`${username}.${server.id}`}>
                                    <Input type={'text'} value={`${username}.${server.id}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div css={tw`flex items-center gap-4`}>
                                <div css={tw`flex-1`}>
                                    <div
                                        css={tw`p-2 rounded text-xs`}
                                        style={{
                                            borderLeft: '3px solid var(--theme-primary)',
                                            background:
                                                'color-mix(in srgb, var(--theme-primary) 5%, var(--theme-background-secondary))',
                                            border: '1px solid var(--theme-border)',
                                        }}
                                    >
                                        <p style={{ color: 'var(--theme-text-muted)' }}>
                                            {t('settings.sftp.passwordNotice')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <a href={`sftp://${username}.${server.id}@${ip(sftp.ip)}:${sftp.port}`}>
                                        <FuturisticFormButton>
                                            <FontAwesomeIcon icon={faFileDownload} className="mr-1" />
                                            {t('settings.sftp.launchSftp')}
                                        </FuturisticFormButton>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </TitledGreyBox>
                </Can>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <StatCardFrame>
                    <div className="flex items-center mb-2">
                        <FontAwesomeIcon
                            icon={faMicrochip}
                            className="mr-2 text-sm"
                            style={{ color: 'var(--theme-primary)' }}
                        />
                        <h4
                            className="text-sm font-medium"
                            style={{ color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}
                        >
                            {t('console.stats.cpuUsage')}
                        </h4>
                    </div>
                    <div
                        className="text-2xl font-bold mb-2"
                        style={{ color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}
                    >
                        {isOffline ? (
                            <span style={{ color: 'var(--theme-text-muted)' }}>{t('console.stats.offline')}</span>
                        ) : (
                            <span>{stats.cpu.toFixed(2)}%</span>
                        )}
                    </div>
                    <div
                        className="text-xs mb-3"
                        style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                    >
                        of {textLimits.cpu || '∞'} limit
                    </div>
                    <div
                        className="w-full h-2"
                        style={{
                            backgroundColor: 'var(--theme-background)',
                            clipPath:
                                'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                        }}
                    >
                        <div
                            className="bg-blue-500 h-2 transition-all duration-300"
                            style={{
                                width: `${isOffline ? 0 : getProgressPercentage(stats.cpu, limits.cpu)}%`,
                                clipPath:
                                    'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                            }}
                        ></div>
                    </div>
                </StatCardFrame>

                
                <StatCardFrame>
                    <div className="flex items-center mb-2">
                        <FontAwesomeIcon
                            icon={faMemory}
                            className="mr-2 text-sm"
                            style={{ color: 'var(--theme-primary)' }}
                        />
                        <h4
                            className="text-sm font-medium"
                            style={{ color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}
                        >
                            {t('console.stats.memoryUsage')}
                        </h4>
                    </div>
                    <div
                        className="text-2xl font-bold mb-2"
                        style={{ color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}
                    >
                        {isOffline ? (
                            <span style={{ color: 'var(--theme-text-muted)' }}>{t('console.stats.offline')}</span>
                        ) : (
                            bytesToString(stats.memory)
                        )}
                    </div>
                    <div
                        className="text-xs mb-3"
                        style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                    >
                        of {textLimits.memory || '∞'} limit
                    </div>
                    <div
                        className="w-full h-2"
                        style={{
                            backgroundColor: 'var(--theme-background)',
                            clipPath:
                                'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                        }}
                    >
                        <div
                            className="bg-green-500 h-2 transition-all duration-300"
                            style={{
                                width: `${isOffline ? 0 : getProgressPercentage(stats.memory / 1024, limits.memory * 1024)}%`,
                                clipPath:
                                    'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                            }}
                        ></div>
                    </div>
                </StatCardFrame>

               
                <StatCardFrame>
                    <div className="flex items-center mb-2">
                        <FontAwesomeIcon
                            icon={faHdd}
                            className="mr-2 text-sm"
                            style={{ color: 'var(--theme-primary)' }}
                        />
                        <h4
                            className="text-sm font-medium"
                            style={{ color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}
                        >
                            {t('console.stats.diskUsage')}
                        </h4>
                    </div>
                    <div
                        className="text-2xl font-bold mb-2"
                        style={{ color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}
                    >
                        {bytesToString(stats.disk)}
                    </div>
                    <div
                        className="text-xs mb-3"
                        style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                    >
                        of {textLimits.disk || '∞'} limit
                    </div>
                    <div
                        className="w-full h-2"
                        style={{
                            backgroundColor: 'var(--theme-background)',
                            clipPath:
                                'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                        }}
                    >
                        <div
                            className="bg-purple-500 h-2 transition-all duration-300"
                            style={{
                                width: `${getProgressPercentage(stats.disk / 1024, limits.disk * 1024)}%`,
                                clipPath:
                                    'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                            }}
                        ></div>
                    </div>
                </StatCardFrame>
            </div>
        </ServerContentBlock>
    );
};

export default ServerInfoContainer;

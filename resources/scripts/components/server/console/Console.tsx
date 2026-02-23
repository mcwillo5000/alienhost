import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { usePermissions } from '@/plugins/usePermissions';
import { usePersistedState } from '@/plugins/usePersistedState';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import { faTerminal, faCopy, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';
import { useBleeps } from '@/components/RivionBleepsProvider';

import 'xterm/css/xterm.css';
import styles from './style.module.css';

const FrameContainer = styled.div`
    position: relative;
    width: 100%;
    height: 700px;
    min-height: 700px;
    max-height: 700px;
    
    @media (max-width: 768px) {
        height: 720px;
        min-height: 720px;
        max-height: 720px;
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
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const TerminalContainer = styled.div`
    flex: 1;
    background-color: var(--theme-background-secondary);
    height: calc(700px - 120px);
    min-height: calc(700px - 120px);
    max-height: calc(700px - 120px);
    overflow: hidden;
    padding: 0;
    margin: 0;
    border-left: 1px solid var(--theme-border);
    border-right: 1px solid var(--theme-border);
    position: relative;
    
    @media (max-width: 768px) {
        height: calc(720px - 170px);
        min-height: calc(720px - 170px);
        max-height: calc(720px - 170px);
    }
`;

const TerminalWrapper = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const CopyButton = styled.button<{ $visible: boolean }>`
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    display: ${props => props.$visible ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    background-color: var(--theme-primary);
    color: var(--theme-text-inverted);
    border: 1px solid var(--theme-border);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
        background-color: var(--theme-primary);
        filter: brightness(1.1);
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const MobileSelectButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    display: none;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    background-color: var(--theme-background);
    color: var(--theme-text-base);
    border: 1px solid var(--theme-border);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
        background-color: var(--theme-background-secondary);
    }
    
    &:active {
        transform: scale(0.95);
    }
    
    @media (max-width: 768px) {
        display: flex;
    }
`;

const ConsoleFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 700 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 800,
                    height: Math.floor(height) || 700
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
        <FrameContainer ref={containerRef}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <filter id="consoleFrameGlow" x="-50%" y="-50%" width="200%" height="200%">
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
                    fill="var(--theme-background)"
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
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

const InputFrameContainer = styled.div`
    position: relative;
    flex: 1;
    min-height: 36px;
`;

const ButtonFrameContainer = styled.div<{ $minWidth?: string }>`
    position: relative;
    min-height: 36px;
    min-width: ${props => props.$minWidth || 'auto'};
`;

const SmallFrameSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

const SmallFrameContent = styled.div`
    position: relative;
    z-index: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ArwesInput: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
}> = ({ value, onChange, onKeyDown, placeholder, disabled, id }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 36 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 200,
                    height: Math.floor(height) || 36
                });
            }
        };
        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const { width, height } = dimensions;
    const cornerCut = 6;
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
        <InputFrameContainer ref={containerRef}>
            <SmallFrameSVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <path d={framePath} fill="var(--theme-background-secondary)" stroke="none" />
                <path d={framePath} fill="none" stroke="var(--theme-border)" strokeWidth={strokeWidth} strokeLinecap="square" />
            </SmallFrameSVG>
            <SmallFrameContent>
                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    className="font-mono text-sm focus:outline-none"
                    style={{
                        width: '100%',
                        height: '36px',
                        lineHeight: '36px',
                        background: 'transparent',
                        color: 'var(--theme-text-base)',
                        border: 'none',
                        padding: '0 12px',
                        paddingLeft: '14px' 
                    }}
                />
            </SmallFrameContent>
        </InputFrameContainer>
    );
};

const ArwesButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    id?: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'warning';
    active?: boolean;
}> = ({ onClick, disabled, id, children, variant = 'primary', active = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 80, height: 36 });
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
                    width: Math.floor(width) || 80,
                    height: Math.floor(height) || 36
                });
            }
        };
        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [children]);

    const { width, height } = dimensions;
    const cornerCut = 6;
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

    const getBgColor = () => {
        if (disabled) return 'var(--theme-background-tertiary)';
        if (isHovered) {
            switch (variant) {
                case 'danger': return '#f87171'; 
                case 'warning': return '#facc15'; 
                case 'primary': return 'var(--theme-secondary)';
                default: return 'var(--theme-secondary)';
            }
        }
        switch (variant) {
            case 'primary': return 'var(--theme-primary)';
            case 'secondary': return 'var(--theme-primary)'; 
            case 'danger': return '#ef4444';
            case 'warning': return '#eab308';
            default: return 'var(--theme-primary)';
        }
    };

    const getTextColor = () => {
        if (disabled) return 'var(--theme-text-muted)';
        return 'white';
    };

    return (
        <ButtonFrameContainer 
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
        >
            <SmallFrameSVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <path d={framePath} fill={getBgColor()} stroke="none" />
            </SmallFrameSVG>
            <SmallFrameContent>
                <button
                    id={id}
                    onClick={handleClick}
                    disabled={disabled}
                    className="inline-flex items-center justify-center text-sm font-medium focus:outline-none w-full"
                    style={{
                        background: 'transparent',
                        color: getTextColor(),
                        border: 'none',
                        padding: '0 12px',
                        height: '36px',
                        lineHeight: '36px',
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    {children}
                </button>
            </SmallFrameContent>
        </ButtonFrameContainer>
    );
};

const FilterButtonGroup: React.FC<{
    filter: 'all' | 'errors' | 'warnings';
    onFilterChange: (filter: 'all' | 'errors' | 'warnings') => void;
    t: any;
    fullWidth?: boolean;
}> = ({ filter, onFilterChange, t, fullWidth = false }) => {
    return (
        <div className={`flex items-center space-x-1 md:border-l md:pl-3 ${fullWidth ? 'w-full' : ''}`} style={{ borderColor: 'var(--theme-border)' }}>
            <div className={`${fullWidth ? 'flex-1' : ''}`}>
                <ArwesButton
                    onClick={() => onFilterChange('all')}
                    variant={filter === 'all' ? 'primary' : 'secondary'}
                    active={filter === 'all'}
                >
                    {t('console.filters.all')}
                </ArwesButton>
            </div>
            <div className={`${fullWidth ? 'flex-1' : ''}`}>
                <ArwesButton
                    onClick={() => onFilterChange('errors')}
                    variant={filter === 'errors' ? 'danger' : 'secondary'}
                    active={filter === 'errors'}
                >
                    {t('console.filters.errors')}
                </ArwesButton>
            </div>
            <div className={`${fullWidth ? 'flex-1' : ''}`}>
                <ArwesButton
                    onClick={() => onFilterChange('warnings')}
                    variant={filter === 'warnings' ? 'warning' : 'secondary'}
                    active={filter === 'warnings'}
                >
                    {t('console.filters.warnings')}
                </ArwesButton>
            </div>
        </div>
    );
};

const StatusBadgeContainer = styled.div`
    position: relative;
    display: inline-flex;
    min-height: 28px;
`;

const ArwesStatusBadge: React.FC<{
    icon: string;
    text: string;
    bgColor: string;
    textColor: string;
}> = ({ icon, text, bgColor, textColor }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 100, height: 28 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 100,
                    height: Math.floor(height) || 28
                });
            }
        };
        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [text]);

    const { width, height } = dimensions;
    const cornerCut = 5;
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
        <StatusBadgeContainer ref={containerRef}>
            <SmallFrameSVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <path d={framePath} fill={bgColor} stroke="none" />
                <path d={framePath} fill="none" stroke={textColor} strokeWidth={strokeWidth} strokeLinecap="square" style={{ opacity: 0.6 }} />
            </SmallFrameSVG>
            <div 
                className="relative z-10 inline-flex items-center px-3 py-1 text-sm font-medium"
                style={{ color: textColor, height: '28px', lineHeight: '28px' }}
            >
                <i className={`${icon} mr-1`}></i>
                <span className="server-status-text">{text}</span>
            </div>
        </StatusBadgeContainer>
    );
};

type ConsoleFilterType = 'all' | 'errors' | 'warnings';

interface ConsoleLine {
    content: string;
    type: 'output' | 'daemon' | 'daemon_error' | 'status' | 'transfer' | 'system';
    timestamp: number;
}

const MAX_BUFFER_SIZE = 2000;

const isErrorLine = (line: string): boolean => {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('error') || 
           lowerLine.includes('exception') || 
           lowerLine.includes('failed') || 
           lowerLine.includes('fatal') ||
           lowerLine.includes('crash') ||
           lowerLine.includes('critical');
};

const isWarningLine = (line: string): boolean => {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('warn') || 
           lowerLine.includes('warning') || 
           lowerLine.includes('caution') ||
           lowerLine.includes('deprecated');
};

const linePassesFilter = (line: ConsoleLine, filter: ConsoleFilterType): boolean => {
    if (line.type === 'system' || line.type === 'status') {
        return true;
    }
    
    if (line.type === 'daemon_error' && filter === 'errors') {
        return true;
    }
    
    switch (filter) {
        case 'all':
            return true;
        case 'errors':
            return isErrorLine(line.content) || line.type === 'daemon_error';
        case 'warnings':
            return isWarningLine(line.content);
        default:
            return true;
    }
};

const getXtermTheme = () => {

    return {
        background: 'transparent', 
        foreground: '#e4e4e7', 
        cursor: '#ffffff',
        cursorAccent: '#1a1a1a',
        selection: 'rgba(250, 240, 137, 0.3)',
        black: '#27272a',
        red: '#dc2626',      
        green: '#16a34a',    
        yellow: '#ca8a04',   
        blue: '#2563eb',     
        magenta: '#9333ea',  
        cyan: '#0891b2',     
        white: '#d4d4d8',
        brightBlack: '#71717a',
        brightRed: '#ef4444',
        brightGreen: '#22c55e',
        brightYellow: '#eab308',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#06b6d4',
        brightWhite: '#fafafa',
    };
};

const terminalOptions: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: 14, 
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    rows: 30,
    theme: getXtermTheme(),
    scrollback: 5000,
    convertEol: true,
};

interface ConsoleMessage {
    timestamp: string;
    level: 'INFO' | 'ERROR' | 'WARNING' | 'SUCCESS';
    message: string;
}

const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
};

const getLogLevelColor = (level: string) => {
    switch (level) {
        case 'INFO':
            return 'text-blue-400';
        case 'ERROR':
            return 'text-red-400';
        case 'WARNING':
            return 'text-yellow-400';
        case 'SUCCESS':
            return 'text-green-400';
        default:
            return 'text-gray-400';
    }
};

const getServerStatusInfo = (status: string | null, connected: boolean, t: any) => {
    if (!connected) {
        return {
            text: t('console.header.status.disconnected'),
            bgColor: 'rgba(107, 114, 128, 0.2)', 
            textColor: 'var(--theme-text-muted)',
            icon: 'fas fa-question-circle'
        };
    }

    switch (status) {
        case 'running':
            return {
                text: t('console.header.status.running'),
                bgColor: 'rgba(34, 197, 94, 0.2)', 
                textColor: '#22c55e',
                icon: 'fas fa-play-circle'
            };
        case 'offline':
            return {
                text: t('console.header.status.stopped'),
                bgColor: 'rgba(239, 68, 68, 0.2)', 
                textColor: '#ef4444',
                icon: 'fas fa-stop-circle'
            };
        case 'starting':
            return {
                text: t('console.header.status.starting'),
                bgColor: 'rgba(59, 130, 246, 0.2)', 
                textColor: '#3b82f6',
                icon: 'fas fa-sync fa-spin'
            };
        case 'stopping':
            return {
                text: t('console.header.status.stopping'),
                bgColor: 'rgba(245, 158, 11, 0.2)', 
                textColor: '#f59e0b',
                icon: 'fas fa-pause-circle'
            };
        default:
            return {
                text: status || t('console.header.status.unknown'),
                bgColor: 'rgba(107, 114, 128, 0.2)', 
                textColor: 'var(--theme-text-muted)',
                icon: 'fas fa-question-circle'
            };
    }
};

export default () => {
    const bleeps = useBleeps();
    

    const serverData = ServerContext.useStoreState((state) => state.server.data);
    
    const getConsoleSettings = () => {
        const siteConfig = (window as any).SiteConfiguration;
        const globalDaemonText = siteConfig?.consoleSettings?.daemonText || '[Pterodactyl Daemon]:';
        const globalContainerText = siteConfig?.consoleSettings?.containerText || 'container@pterodactyl~';
        
        return {

            containerText: serverData?.containerText || globalContainerText,
            daemonText: serverData?.daemonText || globalDaemonText,
            enableReplacement: siteConfig?.consoleSettings?.enableReplacement !== false, 
        };
    };
    
    const consoleSettings = getConsoleSettings();
    
    const TERMINAL_PRELUDE = `\u001b[1m\u001b[33m${consoleSettings.containerText} \u001b[0m`;
    const DAEMON_PRELUDE = `\u001b[1m\u001b[34m${consoleSettings.daemonText} \u001b[0m`;
    
    const { t } = useTranslation();
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminal = useMemo(() => new Terminal(terminalOptions), []);
    const fitAddon = useMemo(() => new FitAddon(), []);
    const searchAddon = useMemo(() => new SearchAddon(), []);
    const webLinksAddon = useMemo(() => new WebLinksAddon(), []);
    
    const [hasSelection, setHasSelection] = useState(false);
    
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    
    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [commandInput, setCommandInput] = useState('');
    const [consoleFilter, setConsoleFilter] = useState<ConsoleFilterType>('all');
    
    const consoleBufferRef = useRef<ConsoleLine[]>([]);
    const filterRef = useRef<ConsoleFilterType>('all');
    const isLoadingLogsRef = useRef(false);
    
    useEffect(() => {
        filterRef.current = consoleFilter;
    }, [consoleFilter]);
    
    const addToBuffer = useCallback((content: string, type: ConsoleLine['type']) => {
        const line: ConsoleLine = {
            content,
            type,
            timestamp: Date.now()
        };
        
        consoleBufferRef.current.push(line);
        
        if (consoleBufferRef.current.length > MAX_BUFFER_SIZE) {
            consoleBufferRef.current = consoleBufferRef.current.slice(-MAX_BUFFER_SIZE);
        }
        
        return line;
    }, []);
    
    const clearBuffer = useCallback(() => {
        consoleBufferRef.current = [];
    }, []);
    
    const replaceConsoleText = useCallback((line: string): string => {
        if (!consoleSettings.enableReplacement) {
            return line;
        }
        
        let result = line;
        
        const containerPatterns = [
            /container@pterodactyl~/g,
            /\u001b\[1m\u001b\[33mcontainer@pterodactyl~ \u001b\[0m/g,
            /\x1b\[1m\x1b\[33mcontainer@pterodactyl~ \x1b\[0m/g,
        ];
        containerPatterns.forEach(pattern => {
            result = result.replace(pattern, consoleSettings.containerText);
        });
        
        const daemonPatterns = [
            /\[Pterodactyl Daemon\]:/g,
            /\u001b\[1m\u001b\[34m\[Pterodactyl Daemon\]: \u001b\[0m/g,
            /\x1b\[1m\x1b\[34m\[Pterodactyl Daemon\]: \x1b\[0m/g,
        ];
        daemonPatterns.forEach(pattern => {
            result = result.replace(pattern, consoleSettings.daemonText);
        });
        
        return result;
    }, [consoleSettings.enableReplacement, consoleSettings.containerText, consoleSettings.daemonText]);
    
    const renderLineToTerminal = useCallback((line: ConsoleLine) => {
        let output = '';
        
        switch (line.type) {
            case 'daemon':
                output = DAEMON_PRELUDE + line.content.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m';
                break;
            case 'daemon_error':
                output = DAEMON_PRELUDE + '\u001b[1m\u001b[41m' + line.content.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m';
                break;
            case 'status':
                output = TERMINAL_PRELUDE + 'Server marked as ' + line.content + '...\u001b[0m';
                break;
            case 'transfer':
                output = TERMINAL_PRELUDE + line.content + '\u001b[0m';
                break;
            case 'system':
                output = TERMINAL_PRELUDE + line.content + '\u001b[0m';
                break;
            case 'output':
            default:
                const processedLine = replaceConsoleText(line.content);
                output = processedLine.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m';
                break;
        }
        
        terminal.writeln(output);
    }, [terminal, TERMINAL_PRELUDE, DAEMON_PRELUDE, replaceConsoleText]);
    
    const renderFilteredBuffer = useCallback(() => {
        terminal.clear();
        
        const currentFilter = filterRef.current;
        const filteredLines = consoleBufferRef.current.filter(line => linePassesFilter(line, currentFilter));
        
        if (currentFilter !== 'all') {
            const filterLabel = currentFilter === 'errors' ? 'ERRORS ONLY' : 'WARNINGS ONLY';
            terminal.writeln(TERMINAL_PRELUDE + `\u001b[1m\u001b[35mFilter: ${filterLabel}\u001b[0m`);
            terminal.writeln(TERMINAL_PRELUDE + `\u001b[90mShowing ${filteredLines.length} of ${consoleBufferRef.current.length} lines\u001b[0m`);
            terminal.writeln('');
        }
        
        filteredLines.forEach(line => {
            renderLineToTerminal(line);
        });
    }, [terminal, TERMINAL_PRELUDE, renderLineToTerminal]);

    useEffect(() => {
        if (!terminalRef.current || terminal.element) {
            return;
        }

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(searchAddon);
        terminal.loadAddon(webLinksAddon);
        terminal.open(terminalRef.current);
        

        terminal.attachCustomKeyEventHandler((event: KeyboardEvent) => {

            if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                const selection = terminal.getSelection();
                if (selection && selection.length > 0) {
                    navigator.clipboard.writeText(selection).catch(() => {

                        document.execCommand('copy');
                    });
                    return false; 
                }
            }

            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
                terminal.selectAll();
                return false;
            }
            return true;
        });
        

        terminal.onSelectionChange(() => {
            const selection = terminal.getSelection();
            setHasSelection(selection !== null && selection.length > 0);
        });
        

        const terminalElement = terminalRef.current;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isTouchSelecting = false;
        
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                isTouchSelecting = false;
            }
        };
        
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
                const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

                if (deltaX > 20 && deltaX > deltaY * 1.5) {
                    isTouchSelecting = true;
                }
            }
        };
        
        const handleTouchEnd = (e: TouchEvent) => {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration >= 500 && !isTouchSelecting && e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                const rect = terminalElement.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                

                const cellWidth = terminal.element ? terminal.element.clientWidth / terminal.cols : 9;
                const cellHeight = terminal.element ? terminal.element.clientHeight / terminal.rows : 17;
                const col = Math.floor(x / cellWidth);
                const row = Math.floor(y / cellHeight);
                

                if (row >= 0 && row < terminal.rows) {
                    terminal.selectLines(row, row);
                }
            }
        };
        
        terminalElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        terminalElement.addEventListener('touchmove', handleTouchMove, { passive: true });
        terminalElement.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        setTimeout(() => fitAddon.fit(), 100);
        
        const handleResize = () => {
            if (terminal.element) {
                fitAddon.fit();
            }
        };
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            terminalElement.removeEventListener('touchstart', handleTouchStart);
            terminalElement.removeEventListener('touchmove', handleTouchMove);
            terminalElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, [terminal, fitAddon, searchAddon, webLinksAddon]);

    const handleConsoleOutput = useCallback((line: string) => {
        if (line.includes("Can't keep up! Is the server overloaded?")) {
            return;
        }
        
        const consoleLine = addToBuffer(line, 'output');
        
        if (linePassesFilter(consoleLine, filterRef.current)) {
            renderLineToTerminal(consoleLine);
        }
    }, [addToBuffer, renderLineToTerminal]);

    const handleTransferStatus = useCallback((status: string) => {
        let message: string;
        switch (status) {
            case 'failure':
                message = 'Transfer has failed.';
                break;
            default:
                message = `Transfer status: ${status}`;
                break;
        }
        
        const consoleLine = addToBuffer(message, 'transfer');
        if (linePassesFilter(consoleLine, filterRef.current)) {
            renderLineToTerminal(consoleLine);
        }
    }, [addToBuffer, renderLineToTerminal]);

    const handleDaemonErrorOutput = useCallback((line: string) => {
        const consoleLine = addToBuffer(line, 'daemon_error');
        if (linePassesFilter(consoleLine, filterRef.current)) {
            renderLineToTerminal(consoleLine);
        }
    }, [addToBuffer, renderLineToTerminal]);

    const handleDaemonMessage = useCallback((line: string) => {
        const consoleLine = addToBuffer(line, 'daemon');
        if (linePassesFilter(consoleLine, filterRef.current)) {
            renderLineToTerminal(consoleLine);
        }
    }, [addToBuffer, renderLineToTerminal]);

    const handlePowerChangeEvent = useCallback((state: string) => {
        const consoleLine = addToBuffer(state, 'status');
        if (linePassesFilter(consoleLine, filterRef.current)) {
            renderLineToTerminal(consoleLine);
        }
    }, [addToBuffer, renderLineToTerminal]);

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);
            setHistoryIndex(newIndex);
            setCommandInput(history![newIndex] || '');
            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            setCommandInput(history![newIndex] || '');
        }

        if (e.key === 'Enter' && commandInput.trim().length > 0) {
            sendCommand(commandInput.trim());
        }
    };

    const sendCommand = (command: string) => {
        setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
        setHistoryIndex(-1);
        
        instance && instance.send('send command', command);
        setCommandInput('');
    };

    const handleSendClick = () => {
        if (commandInput.trim().length > 0) {
            sendCommand(commandInput.trim());
        }
    };

    const handleCopySelection = useCallback(() => {
        const selection = terminal.getSelection();
        if (selection && selection.length > 0) {
            navigator.clipboard.writeText(selection).then(() => {

                terminal.clearSelection();
                setHasSelection(false);
            }).catch(() => {

                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = selection;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    terminal.clearSelection();
                    setHasSelection(false);
                } catch (e) {
                    console.error('Failed to copy:', e);
                }
            });
        }
    }, [terminal]);

    const handleSelectAll = useCallback(() => {
        terminal.selectAll();
    }, [terminal]);

    useEffect(() => {
        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: handleDaemonMessage,
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            if (!isTransferring) {
                clearBuffer();
                terminal.clear();
                
                const connectMsg = addToBuffer('Connected to server console...', 'system');
                renderLineToTerminal(connectMsg);
                
                bleeps.success?.play();
            }

            Object.keys(listeners).forEach((key: string) => {
                instance.addListener(key, listeners[key]);
            });
            instance.send(SocketRequest.SEND_LOGS);
        } else {
            const disconnectMsg = addToBuffer('\u001b[1m\u001b[41mDisconnected from server console.\u001b[0m', 'system');
            renderLineToTerminal(disconnectMsg);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key: string) => {
                    instance.removeListener(key, listeners[key]);
                });
            }
        };
    }, [connected, instance, isTransferring, terminal, clearBuffer, addToBuffer, renderLineToTerminal, handleConsoleOutput, handleDaemonErrorOutput, handleDaemonMessage, handlePowerChangeEvent, handleTransferStatus]);

    useEffect(() => {
        if (consoleBufferRef.current.length > 0) {
            renderFilteredBuffer();
        }
    }, [consoleFilter, renderFilteredBuffer]);

    return (
        <div className="lg:col-span-3">
            <ConsoleFrame>
                <SpinnerOverlay visible={!connected} size={'large'} />
                
                <div 
                    className="px-6 py-3 flex items-center justify-between flex-shrink-0" 
                    style={{ 
                        backgroundColor: 'transparent', 
                        borderBottom: '1px solid var(--theme-border)',
                        paddingLeft: '20px' 
                    }}
                >
                    <h3 className="text-sm font-medium" style={{ color: 'var(--theme-text-base)' }}>
                        <FontAwesomeIcon 
                            icon={faTerminal}
                            className="mr-2 text-xs" 
                            style={{ color: 'var(--theme-primary)' }}
                        />
                        {t('console.header.title')}
                    </h3>
                    
                    <div id="server-status-badge">
                        {(() => {
                            const statusInfo = getServerStatusInfo(status, connected, t);
                            return (
                                <ArwesStatusBadge
                                    icon={statusInfo.icon}
                                    text={statusInfo.text}
                                    bgColor={statusInfo.bgColor}
                                    textColor={statusInfo.textColor}
                                />
                            );
                        })()}
                    </div>
                </div>
                
                <div className="flex flex-col flex-1 overflow-hidden">
                    <TerminalWrapper>
                        {/* Mobile Select All button - only shows when no selection */}
                        {!hasSelection && (
                            <MobileSelectButton 
                                onClick={handleSelectAll}
                                title={t('console.selectAll', 'Select All')}
                            >
                                <FontAwesomeIcon icon={faCheckDouble} />
                                <span>{t('console.selectAll', 'Select All')}</span>
                            </MobileSelectButton>
                        )}
                        {/* Copy button - shows when there's a selection */}
                        <CopyButton 
                            $visible={hasSelection}
                            onClick={handleCopySelection}
                            title={t('console.copySelection', 'Copy Selection')}
                        >
                            <FontAwesomeIcon icon={faCopy} />
                            <span>{t('console.copy', 'Copy')}</span>
                        </CopyButton>
                        <TerminalContainer 
                            ref={terminalRef}
                            id="terminal" 
                        />
                    </TerminalWrapper>

                    {canSendCommands && (
                        <div 
                            className="p-3 border-t flex-shrink-0" 
                            style={{ 
                                backgroundColor: 'transparent', 
                                borderColor: 'var(--theme-border)', 
                                zIndex: 20,
                                paddingRight: '20px' 
                            }}
                        >
                            {/* Desktop layout - all in one row */}
                            <div className="hidden md:flex items-center space-x-3">
                                <span 
                                    className="font-mono text-sm" 
                                    style={{ color: 'var(--theme-text-muted)' }}
                                >
                                    $
                                </span>
                                <ArwesInput
                                    id="console-input"
                                    value={commandInput}
                                    onChange={(e) => setCommandInput(e.target.value)}
                                    onKeyDown={handleCommandKeyDown}
                                    placeholder={t('console.input.placeholder')}
                                    disabled={!connected}
                                />
                                <ArwesButton
                                    id="send-command"
                                    onClick={handleSendClick}
                                    disabled={!connected || commandInput.trim().length === 0}
                                    variant="primary"
                                >
                                    <i className="fas fa-paper-plane mr-1 text-xs"></i> 
                                    {t('console.input.send')}
                                </ArwesButton>
                                
                                <FilterButtonGroup
                                    filter={consoleFilter}
                                    onFilterChange={setConsoleFilter}
                                    t={t}
                                />
                            </div>
                            
                            {/* Mobile layout - input/send on first row, filters on second row */}
                            <div className="md:hidden flex flex-col space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span 
                                        className="font-mono text-sm" 
                                        style={{ color: 'var(--theme-text-muted)' }}
                                    >
                                        $
                                    </span>
                                    <ArwesInput
                                        id="console-input-mobile"
                                        value={commandInput}
                                        onChange={(e) => setCommandInput(e.target.value)}
                                        onKeyDown={handleCommandKeyDown}
                                        placeholder={t('console.input.placeholder')}
                                        disabled={!connected}
                                    />
                                    <ArwesButton
                                        id="send-command-mobile"
                                        onClick={handleSendClick}
                                        disabled={!connected || commandInput.trim().length === 0}
                                        variant="primary"
                                    >
                                        <i className="fas fa-paper-plane mr-1 text-xs"></i>
                                        {t('console.input.send')}
                                    </ArwesButton>
                                </div>
                                <div className="flex items-center w-full">
                                    <FilterButtonGroup
                                        filter={consoleFilter}
                                        onFilterChange={setConsoleFilter}
                                        t={t}
                                        fullWidth={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ConsoleFrame>
            
            <div className="flex-grow"></div>
        </div>
    );
};

import React, { createContext, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';

export type BleepNames = 
    | 'click'    
    | 'hover'    
    | 'intro'    
    | 'type'     
    | 'success'  
    | 'error'    
    | 'open'     
    | 'close';   

export interface Bleep {
    play: () => void;
    stop: () => void;
    isPlaying: boolean;
}

export type Bleeps = Partial<Record<BleepNames, Bleep>>;

interface BleepsContextValue {
    bleeps: Bleeps;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
}

const BleepsContext = createContext<BleepsContextValue | null>(null);

const createBleep = (src: string, options: { volume?: number; loop?: boolean } = {}): Bleep | null => {
    if (typeof window === 'undefined') return null;
    
    let audio: HTMLAudioElement | null = null;
    let isPlaying = false;
    
    const { volume = 0.5, loop = false } = options;

    const play = () => {
        try {
            if (!audio) {
                audio = new Audio(src);
                audio.volume = volume;
                audio.loop = loop;
            }
            
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
            isPlaying = true;
        } catch {
        }
    };

    const stop = () => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            isPlaying = false;
        }
    };

    return {
        play,
        stop,
        get isPlaying() {
            return isPlaying;
        }
    };
};

const BLEEP_SOURCES: Record<BleepNames, { src: string; volume?: number; loop?: boolean }> = {
    click: { src: '/assets/sounds/click.mp3', volume: 1 },
    hover: { src: '/assets/sounds/hover.mp3', volume: 0 }, 
    intro: { src: '/assets/sounds/intro.mp3', volume: 0.5 },
    type: { src: '/assets/sounds/type.mp3', volume: 0.3, loop: true },
    success: { src: '/assets/sounds/success.mp3', volume: 0.5 },
    error: { src: '/assets/sounds/error.mp3', volume: 0.5 },
    open: { src: '/assets/sounds/open.mp3', volume: 0.4 },
    close: { src: '/assets/sounds/close.mp3', volume: 0.4 }
};

interface RivionBleepsProviderProps {
    children: ReactNode;
    initialEnabled?: boolean;
    initialVolume?: number;
}

export const RivionBleepsProvider: React.FC<RivionBleepsProviderProps> = ({
    children,
    initialEnabled = true,
    initialVolume = 0.5
}) => {
    const [enabled, setEnabled] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('rivion-bleeps-enabled');
            return stored !== null ? stored === 'true' : initialEnabled;
        }
        return initialEnabled;
    });

    const [volume, setVolume] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('rivion-bleeps-volume');
            return stored !== null ? parseFloat(stored) : initialVolume;
        }
        return initialVolume;
    });

    useEffect(() => {
        localStorage.setItem('rivion-bleeps-enabled', String(enabled));
    }, [enabled]);

    useEffect(() => {
        localStorage.setItem('rivion-bleeps-volume', String(volume));
    }, [volume]);

    const bleeps = useMemo(() => {
        if (!enabled) return {};

        const result: Bleeps = {};
        
        (Object.keys(BLEEP_SOURCES) as BleepNames[]).forEach((name) => {
            const config = BLEEP_SOURCES[name];
            const bleep = createBleep(config.src, {
                volume: (config.volume || 0.5) * volume,
                loop: config.loop
            });
            if (bleep) {
                result[name] = bleep;
            }
        });

        return result;
    }, [enabled, volume]);

    const contextValue = useMemo(() => ({
        bleeps,
        enabled,
        setEnabled,
        volume,
        setVolume
    }), [bleeps, enabled, volume]);

    return (
        <BleepsContext.Provider value={contextValue}>
            {children}
        </BleepsContext.Provider>
    );
};

export const useBleeps = (): Bleeps => {
    const context = useContext(BleepsContext);
    return context?.bleeps ?? {};
};

export const useBleepsContext = (): BleepsContextValue => {
    const context = useContext(BleepsContext);
    if (!context) {
        throw new Error('useBleepsContext must be used within RivionBleepsProvider');
    }
    return context;
};

export const usePlayBleep = () => {
    const bleeps = useBleeps();
    
    return useCallback((name: BleepNames) => {
        bleeps[name]?.play();
    }, [bleeps]);
};

export const SoundToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { enabled, setEnabled } = useBleepsContext();
    const playBleep = usePlayBleep();

    const handleClick = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        if (newEnabled) {
            setTimeout(() => playBleep('click'), 100);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={className}
            title={enabled ? 'Mute sounds' : 'Enable sounds'}
            aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
        >
            {enabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            )}
        </button>
    );
};

export default RivionBleepsProvider;

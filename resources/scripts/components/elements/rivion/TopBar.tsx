import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faHeadset, faServer, faPlus, faCreditCard, faComments, faBook, faUsers, faCog, faChartBar, faShieldAlt, faTools, faGift,
    faHome, faCloud, faDatabase, faNetworkWired, faBell, faLock, faDownload, faUpload, faCogs,
    faUserShield, faClipboard, faFileAlt, faKey, faWifi, faDesktop, faMobile, faTablet, faGamepad, faHeartbeat,
    faRocket, faStar, faThumbsUp, faEnvelope, faPhone, faMapMarkerAlt, faCalendar, faClock, faEye, faEdit,
    faGlobe, faCheck, faHeart, faBolt, faFeather, faStore, faWallet, faAward, faCube, faCoins, faPuzzlePiece, faSkull,
    faPaw, faGifts, faBox, faAt, faShoppingCart, faTimes, faTicketAlt, faTerminal, faTag, faSyncAlt, faStickyNote, 
    faRss, faRobot, faQuoteLeft, faQuestion, faPaperclip, faSun, faMoon, faUser, faChartLine, faSignOutAlt, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import SearchModal from '@/components/dashboard/search/SearchModal';
import { useTranslation } from 'react-i18next';
import getAvailableLocales from '@/api/getAvailableLocales';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import FuturisticFrame from './FuturisticFrame';
import FuturisticButton from './FuturisticButton';
import Avatar from '@/components/Avatar';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useBleeps, useBleepsContext } from '@/components/RivionBleepsProvider';

const getSiteIcon = (): string => {
    if (typeof window !== 'undefined' && (window as any).SiteConfiguration?.siteAssets?.siteIcon) {
        return (window as any).SiteConfiguration.siteAssets.siteIcon;
    }
    return '';
};

interface TopBarProps {
    onSidebarToggle: () => void;
    isSidebarOpen: boolean;
}

interface AdditionalButton {
    id: number;
    icon: string;
    text: string;
    link: string;
}

const getAdditionalButtons = (): AdditionalButton[] => {
    if (typeof window !== 'undefined' && (window as any).SiteConfiguration?.additionalButtons) {
        return (window as any).SiteConfiguration.additionalButtons;
    }
    return [];
};
const getIconComponent = (iconName: string) => {
    const iconMap = {
        'fa-server': faServer, 'fa-headset': faHeadset, 'fa-plus': faPlus, 'fa-credit-card': faCreditCard, 
        'fa-comments': faComments, 'fa-book': faBook, 'fa-users': faUsers, 'fa-cog': faCog, 
        'fa-chart-bar': faChartBar, 'fa-shield-alt': faShieldAlt, 'fa-tools': faTools, 'fa-gift': faGift,
        'fa-home': faHome, 'fa-cloud': faCloud, 'fa-database': faDatabase, 'fa-network-wired': faNetworkWired, 
        'fa-bell': faBell, 'fa-lock': faLock, 'fa-search': faSearch, 'fa-download': faDownload, 
        'fa-upload': faUpload, 'fa-cogs': faCogs, 'fa-user-shield': faUserShield, 'fa-clipboard': faClipboard,
        'fa-file-alt': faFileAlt, 'fa-key': faKey, 'fa-wifi': faWifi, 'fa-desktop': faDesktop, 
        'fa-mobile': faMobile, 'fa-tablet': faTablet, 'fa-gamepad': faGamepad, 'fa-heartbeat': faHeartbeat,
        'fa-rocket': faRocket, 'fa-star': faStar, 'fa-thumbs-up': faThumbsUp, 'fa-envelope': faEnvelope, 
        'fa-phone': faPhone, 'fa-map-marker-alt': faMapMarkerAlt, 'fa-calendar': faCalendar, 
        'fa-clock': faClock, 'fa-eye': faEye, 'fa-edit': faEdit, 'fa-globe': faGlobe, 
        'fa-check': faCheck, 'fa-heart': faHeart, 'fa-bolt': faBolt, 'fa-feather': faFeather, 
        'fa-store': faStore, 'fa-wallet': faWallet, 'fa-award': faAward, 'fa-cube': faCube, 
        'fa-coins': faCoins, 'fa-puzzle-piece': faPuzzlePiece, 'fa-skull': faSkull, 'fa-paw': faPaw, 
        'fa-gifts': faGifts, 'fa-box': faBox, 'fa-at': faAt, 'fa-shopping-cart': faShoppingCart,
        'fa-times': faTimes, 'fa-ticket-alt': faTicketAlt, 'fa-terminal': faTerminal, 'fa-tag': faTag, 
        'fa-sync-alt': faSyncAlt, 'fa-sticky-note': faStickyNote, 'fa-rss': faRss, 'fa-robot': faRobot, 
        'fa-quote-left': faQuoteLeft, 'fa-question': faQuestion, 'fa-paperclip': faPaperclip
    };
    return iconMap[iconName as keyof typeof iconMap] || faHeadset;
};

const renderCustomIcon = (iconName: string) => {
    if (iconName === 'fi-brands-discord') {
        return (
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                style={{ 
                    width: '16px',
                    height: '16px',
                    fill: 'currentColor' 
                }}
            >
                <path d="M20.317,4.37c-1.53-0.702-3.17-1.219-4.885-1.515c-0.031-0.006-0.062,0.009-0.079,0.037c-0.211,0.375-0.445,0.865-0.608,1.249c-1.845-0.276-3.68-0.276-5.487,0C9.095,3.748,8.852,3.267,8.641,2.892C8.624,2.864,8.593,2.85,8.562,2.855C6.848,3.15,5.208,3.667,3.677,4.37C3.664,4.375,3.652,4.385,3.645,4.397c-3.111,4.648-3.964,9.182-3.546,13.66c0.002,0.022,0.014,0.043,0.031,0.056c2.053,1.508,4.041,2.423,5.993,3.029c0.031,0.01,0.064-0.002,0.084-0.028c0.462-0.63,0.873-1.295,1.226-1.994c0.021-0.041,0.001-0.09-0.042-0.106c-0.653-0.248-1.274-0.55-1.872-0.892c-0.047-0.028-0.051-0.095-0.008-0.128c0.126-0.094,0.252-0.192,0.372-0.291c0.022-0.018,0.052-0.022,0.078-0.01c3.928,1.793,8.18,1.793,12.061,0c0.026-0.012,0.056-0.009,0.079,0.01c0.12,0.099,0.246,0.198,0.373,0.292c0.044,0.032,0.041,0.1-0.007,0.128c-0.598,0.349-1.219,0.645-1.873,0.891c-0.043,0.016-0.061,0.066-0.041,0.107c0.36,0.698,0.772,1.363,1.225,1.993c0.019,0.027,0.053,0.038,0.084,0.029c1.961-0.607,3.95-1.522,6.002-3.029c0.018-0.013,0.029-0.033,0.031-0.055c0.5-5.177-0.838-9.674-3.548-13.66C20.342,4.385,20.33,4.375,20.317,4.37z M8.02,15.331c-1.183,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C10.177,14.246,9.221,15.331,8.02,15.331z M15.995,15.331c-1.182,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C18.152,14.246,17.206,15.331,15.995,15.331z"/>
            </svg>
        );
    }
    return null;
};

const FuturisticSearchBar: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 300, height: 36 });
    const [isHovered, setIsHovered] = React.useState(false);

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 300,
                    height: Math.ceil(height) || 36
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
    const cs = 8; 
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    return (
        <div
            ref={containerRef}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: '300px',
                maxWidth: '400px',
                height: '36px',
                cursor: 'pointer'
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
                    zIndex: 0
                }}
            >
                <path
                    d={framePath}
                    fill={isHovered ? 'var(--theme-background)' : 'var(--theme-background-secondary)'}
                    stroke="none"
                    style={{ transition: 'fill 0.2s ease' }}
                />
                <path
                    d={framePath}
                    fill="none"
                    stroke={isHovered ? 'var(--theme-primary)' : 'var(--theme-border)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s ease' }}
                />
            </svg>
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '0.5rem 0.75rem',
                gap: '0.75rem'
            }}>
                <FontAwesomeIcon 
                    icon={faSearch} 
                    style={{ 
                        color: 'var(--theme-text-muted)',
                        fontSize: '0.875rem'
                    }} 
                />
                <span style={{ 
                    color: 'var(--theme-text-muted)',
                    fontSize: '0.875rem',
                    flex: 1,
                    textAlign: 'left'
                }}>
                    Search for servers
                </span>
            </div>
        </div>
    );
};

interface FuturisticDropdownProps {
    languages: string[];
    currentLanguage: string;
    onLanguageChange: (lang: string) => void;
}

const FuturisticDropdown: React.FC<FuturisticDropdownProps> = ({ languages, currentLanguage, onLanguageChange }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 140, height: 100 });

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 140,
                    height: Math.ceil(height) || 100
                });
            }
        };
        setTimeout(updateDimensions, 10);
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [languages]);

    const { width, height } = dimensions;
    const cs = 10;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    return (
        <div
            ref={containerRef}
            data-language-selector
            style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: '60px',
                minWidth: '140px',
                zIndex: 1000
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
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
                }}
            >
                <path
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />
                <path
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-border)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <div style={{ position: 'relative', zIndex: 1, padding: '4px 0' }}>
                {languages.map((langRaw) => {
                    const lang = langRaw || 'en';
                    return (
                        <button
                            key={lang}
                            onClick={() => onLanguageChange(lang)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                backgroundColor: currentLanguage === lang ? 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' : 'transparent',
                                border: 'none',
                                color: currentLanguage === lang ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                                fontSize: '13px',
                                fontWeight: currentLanguage === lang ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                                if (currentLanguage !== lang) {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-background)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentLanguage !== lang) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontWeight: 600, minWidth: '30px' }}>{(lang || 'en').toUpperCase()}</span>
                            <div
                                style={{
                                    width: '1px',
                                    height: '16px',
                                    backgroundColor: 'var(--theme-border)',
                                    margin: '0 4px',
                                }}
                            />
                            <img 
                                src={`/assets/lang/${lang}.svg`}
                                alt={lang}
                                style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const FuturisticThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 40, height: 36 });
    const [isHovered, setIsHovered] = React.useState(false);

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const siteConfig = (window as any).SiteConfiguration?.theme;
        const defaultTheme = siteConfig?.defaultTheme || 'dark';
        
        let shouldBeDark: boolean;
        if (savedTheme) {
            shouldBeDark = savedTheme === 'dark';
        } else if (defaultTheme === 'system') {
            shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            shouldBeDark = defaultTheme === 'dark';
        }
        setIsDark(shouldBeDark);
    }, []);

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 40,
                    height: Math.ceil(height) || 36
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

    const applyTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        const siteConfig = (window as any).SiteConfiguration?.theme;
        if (siteConfig) {
            const prefix = dark ? 'dark' : 'light';
            document.documentElement.style.setProperty('--theme-primary', siteConfig[`${prefix}_primary`]);
            document.documentElement.style.setProperty('--theme-secondary', siteConfig[`${prefix}_secondary`]);
            document.documentElement.style.setProperty('--theme-border', siteConfig[`${prefix}_border`]);
            document.documentElement.style.setProperty('--theme-text-base', siteConfig[`${prefix}_text_base`]);
            document.documentElement.style.setProperty('--theme-text-muted', siteConfig[`${prefix}_text_muted`]);
            document.documentElement.style.setProperty('--theme-text-inverted', siteConfig[`${prefix}_text_inverted`]);
            document.documentElement.style.setProperty('--theme-background', siteConfig[`${prefix}_background`]);
            document.documentElement.style.setProperty('--theme-background-secondary', siteConfig[`${prefix}_background_secondary`]);
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        applyTheme(newTheme);
    };

    const siteConfig = (window as any).SiteConfiguration?.theme;
    if (siteConfig?.disableThemeToggle) {
        return null;
    }

    const { width, height } = dimensions;
    const cs = 6;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    return (
        <div
            ref={containerRef}
            onClick={toggleTheme}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '36px',
                cursor: 'pointer'
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
                    zIndex: 0
                }}
            >
                <path
                    d={framePath}
                    fill={isHovered ? 'color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background-secondary))' : 'var(--theme-background-secondary)'}
                    stroke="none"
                    style={{ transition: 'fill 0.2s ease' }}
                />
                <path
                    d={framePath}
                    fill="none"
                    stroke={isHovered ? 'var(--theme-primary)' : 'var(--theme-border)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s ease' }}
                />
            </svg>
            <FontAwesomeIcon 
                icon={isDark ? faSun : faMoon}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '1rem',
                    color: isHovered ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                    transition: 'color 0.2s ease'
                }}
            />
        </div>
    );
};

const FuturisticSoundToggle: React.FC = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 40, height: 36 });
    const [isHovered, setIsHovered] = React.useState(false);
    
    let enabled = true;
    let setEnabled = (_: boolean) => {};
    
    try {
        const bleepsContext = useBleepsContext();
        enabled = bleepsContext.enabled;
        setEnabled = bleepsContext.setEnabled;
    } catch {
    }

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 40,
                    height: Math.ceil(height) || 36
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

    const toggleSound = () => {
        setEnabled(!enabled);
    };

    const { width, height } = dimensions;
    const cs = 6;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    return (
        <div
            ref={containerRef}
            onClick={toggleSound}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={enabled ? 'Mute sounds' : 'Enable sounds'}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '36px',
                cursor: 'pointer'
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
                    zIndex: 0
                }}
            >
                <path
                    d={framePath}
                    fill={isHovered ? 'color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background-secondary))' : 'var(--theme-background-secondary)'}
                    stroke="none"
                    style={{ transition: 'fill 0.2s ease' }}
                />
                <path
                    d={framePath}
                    fill="none"
                    stroke={isHovered ? 'var(--theme-primary)' : 'var(--theme-border)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s ease' }}
                />
            </svg>
            <FontAwesomeIcon 
                icon={enabled ? faVolumeUp : faVolumeMute}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '1rem',
                    color: isHovered ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                    transition: 'color 0.2s ease'
                }}
            />
        </div>
    );
};

interface FuturisticProfileDropdownProps {
    onClose: () => void;
    onLogout: () => void;
}

const FuturisticProfileDropdown: React.FC<FuturisticProfileDropdownProps> = ({ onClose, onLogout }) => {
    const { t } = useTranslation();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 200, height: 230 });

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 200,
                    height: Math.ceil(height) || 230
                });
            }
        };
        setTimeout(updateDimensions, 10);
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    const { width, height } = dimensions;
    const cs = 10;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    const menuItems = [
        { to: '/account', icon: faUser, label: t('topbar.accountSettings') },
        { to: '/account/api', icon: faKey, label: t('topbar.apiKeys') },
        { to: '/account/ssh', icon: faLock, label: t('topbar.sshAccess') },
        { to: '/account/activity', icon: faChartLine, label: t('topbar.accountActivity') },
    ];

    return (
        <div
            ref={containerRef}
            data-profile-dropdown
            style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: '0',
                minWidth: '200px',
                zIndex: 1000
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
                    filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25))'
                }}
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ opacity: 0.6 }}
                />
            </svg>
            <div style={{ position: 'relative', zIndex: 1, padding: '6px 0' }}>
                {menuItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 16px',
                            backgroundColor: 'transparent',
                            color: 'var(--theme-text-base)',
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: 'none',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 10%, transparent)';
                            e.currentTarget.style.color = 'var(--theme-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--theme-text-base)';
                        }}
                    >
                        <FontAwesomeIcon 
                            icon={item.icon} 
                            style={{ 
                                width: '14px', 
                                height: '14px',
                                opacity: 0.8 
                            }} 
                        />
                        <span>{item.label}</span>
                    </Link>
                ))}
                {/* Divider */}
                <div style={{
                    height: '1px',
                    backgroundColor: 'var(--theme-border)',
                    margin: '6px 12px'
                }} />
                {/* Sign Out Button */}
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--theme-text-base)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #ef4444 10%, transparent)';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--theme-text-base)';
                    }}
                >
                    <FontAwesomeIcon 
                        icon={faSignOutAlt} 
                        style={{ 
                            width: '14px', 
                            height: '14px',
                            opacity: 0.8 
                        }} 
                    />
                    <span>{t('topbar.signOut')}</span>
                </button>
            </div>
        </div>
    );
};

interface FuturisticProfileButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const FuturisticProfileButton: React.FC<FuturisticProfileButtonProps> = ({ isOpen, onClick }) => {
    const { t } = useTranslation();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 40, height: 36 });
    const [isHovered, setIsHovered] = React.useState(false);

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.ceil(width) || 40,
                    height: Math.ceil(height) || 36
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
    const cs = 6;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cs}
        L ${so + cs},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cs}
        L ${width - so - cs},${height - so}
        L ${so},${height - so}
        Z
    `;

    const active = isOpen || isHovered;

    return (
        <div
            ref={containerRef}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={t('topbar.matrix')}
            data-profile-button
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minWidth: '90px',
                height: '36px',
                padding: '0 12px',
                cursor: 'pointer'
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
                    zIndex: 0
                }}
            >
                <path
                    d={framePath}
                    fill={active ? 'color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background-secondary))' : 'var(--theme-background-secondary)'}
                    stroke="none"
                    style={{ transition: 'fill 0.2s ease' }}
                />
                <path
                    d={framePath}
                    fill="none"
                    stroke={active ? 'var(--theme-primary)' : 'var(--theme-border)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke 0.2s ease' }}
                />
            </svg>
            <FontAwesomeIcon 
                icon={faCog}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '0.9rem',
                    color: active ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                    transition: 'color 0.2s ease'
                }}
            />
            <span
                style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    fontFamily: '"Orbitron", "Electrolize", sans-serif',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                    transition: 'color 0.2s ease'
                }}
            >
                {t('topbar.matrix')}
            </span>
        </div>
    );
};

export default ({ onSidebarToggle, isSidebarOpen }: TopBarProps) => {
    const location = useLocation();
    const [searchVisible, setSearchVisible] = useState(false);
    const { t, i18n } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const siteIcon = getSiteIcon();
    const bleeps = useBleeps();

    const playClick = () => bleeps.click?.play();
    const playOpen = () => bleeps.open?.play();
    const playClose = () => bleeps.close?.play();

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        setIsProfileOpen(false);
        bleeps.click?.play();
        http.post('/auth/logout').finally(() => {
            window.location = '/';
        });
    };

    useEffect(() => {

        getAvailableLocales()
            .then((locales) => {
                setAvailableLanguages(locales);
            })
            .catch((error) => {
                console.error('Failed to fetch available locales:', error);
                
                setAvailableLanguages(['en']);
            });
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isDropdownOpen && !target.closest('[data-language-selector]')) {
                setIsDropdownOpen(false);
            }
            if (isProfileOpen && !target.closest('[data-profile-dropdown]') && !target.closest('[data-profile-button]')) {
                setIsProfileOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, isProfileOpen]);
    

    const showSearch = location.pathname === '/';
    
    const showAdditionalButtons = location.pathname !== '/';
    
    const additionalButtons = getAdditionalButtons();
    
    const changeLanguage = (lang: string) => {
        playClick();
        i18n.changeLanguage(lang);
        localStorage.setItem('panel_language', lang);
        setIsDropdownOpen(false);
    };
    
    const handleButtonClick = (link: string) => {
        playClick();
        if (link && link !== '' && link !== '#') {
            window.open(link, '_blank');
        }
    };
    
    return (
        <div className="rivion-topbar rivion-topbar-futuristic">
            {/* Futuristic SVG frame background */}
            <FuturisticFrame variant="header" />
            
            {searchVisible && <SearchModal appear visible={searchVisible} onDismissed={() => { playClose(); setSearchVisible(false); }} />}
            <div className="rivion-topbar-container">
                {/* Left - Logo, Site Name, and Sidebar toggle */}
                <div className="rivion-topbar-left">
                    <button
                        className={`rivion-sidebar-toggle-mobile ${isSidebarOpen ? 'sidebar-open' : ''}`}
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            playClick(); 
                            onSidebarToggle(); 
                        }}
                        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    
                    {/* Site Logo and Name */}
                    <Link to="/" className="rivion-topbar-logo">
                        {siteIcon && (
                            <img 
                                src={siteIcon} 
                                alt="Site Logo"
                                className="rivion-topbar-logo-image"
                            />
                        )}
                        <span className="rivion-topbar-site-name">{name}</span>
                    </Link>
                </div>
                
                {/* Center - Empty for now */}
                <div className="rivion-topbar-center">
                </div>
                
                {/* Right - Additional buttons + Search + Theme toggle */}
                <div className="rivion-topbar-right">
                    {/* Additional buttons from settings - hide on dashboard page */}
                    {showAdditionalButtons && additionalButtons.map((button) => (
                        <FuturisticButton
                            key={button.id}
                            className="rivion-additional-button rivion-hide-mobile"
                            onClick={() => handleButtonClick(button.link)}
                            title={button.text}
                            style={{ marginRight: '8px' }}
                        >
                            {button.icon && (
                                renderCustomIcon(button.icon) || (
                                    <FontAwesomeIcon 
                                        icon={getIconComponent(button.icon)} 
                                        style={{ fontSize: '14px' }}
                                    />
                                )
                            )}
                            {button.text && <span>{button.text}</span>}
                        </FuturisticButton>
                    ))}
                    
                    {showSearch && (
                        <div className="rivion-hide-mobile">
                            <FuturisticSearchBar onClick={() => { playOpen(); setSearchVisible(true); }} />
                        </div>
                    )}
                    
                    {/* Language Selector Dropdown */}
                    <div className="rivion-hide-mobile rivion-language-selector">
                        <FuturisticButton
                            onClick={() => { playClick(); setIsDropdownOpen(!isDropdownOpen); }}
                            style={{ marginRight: '8px' }}
                            data-language-selector
                        >
                            <span style={{ fontWeight: 600 }}>{(i18n.language || 'en').toUpperCase()}</span>
                            <div
                                style={{
                                    width: '1px',
                                    height: '16px',
                                    backgroundColor: 'var(--theme-border)',
                                    margin: '0 2px',
                                }}
                            />
                            <img 
                                src={`/assets/lang/${i18n.language || 'en'}.svg`}
                                alt={i18n.language || 'en'}
                                style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </FuturisticButton>
                        
                        {/* Language Dropdown Menu */}
                        {isDropdownOpen && (
                            <FuturisticDropdown 
                                languages={availableLanguages}
                                currentLanguage={i18n.language}
                                onLanguageChange={changeLanguage}
                            />
                        )}
                    </div>
                    
                    <div className="rivion-hide-mobile">
                        <FuturisticThemeToggle />
                    </div>
                    
                    <div className="rivion-hide-mobile">
                        <FuturisticSoundToggle />
                    </div>
                    
                    {/* Matrix Button and Dropdown */}
                    <div className="rivion-matrix-button" style={{ position: 'relative' }}>
                        <FuturisticButton
                            onClick={() => { playClick(); setIsProfileOpen(!isProfileOpen); }}
                            title={t('topbar.matrix')}
                        >
                            <FontAwesomeIcon icon={faCog} />
                            <span className="rivion-matrix-text" style={{
                                fontFamily: '"Orbitron", "Electrolize", sans-serif',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {t('topbar.matrix')}
                            </span>
                        </FuturisticButton>
                        {isProfileOpen && (
                            <FuturisticProfileDropdown 
                                onClose={() => { playClose(); setIsProfileOpen(false); }}
                                onLogout={onTriggerLogout}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Spinner overlay for logout */}
            <SpinnerOverlay visible={isLoggingOut} />
        </div>
    );
};
import React, { useState, useEffect, useRef } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faServer, faHeadset, faPlus, faCreditCard, faComments, faBook, faUsers, faCog, faChartBar, faShieldAlt, faTools, faGift,
    faHome, faCloud, faDatabase, faNetworkWired, faBell, faLock, faSearch, faDownload, faUpload, faCogs,
    faUserShield, faClipboard, faFileAlt, faKey, faWifi, faDesktop, faMobile, faTablet, faGamepad, faHeartbeat,
    faRocket, faStar, faThumbsUp, faEnvelope, faPhone, faMapMarkerAlt, faCalendar, faClock, faEye, faEdit,
    faGlobe, faCheck, faHeart, faBolt, faFeather, faStore, faWallet, faAward, faCube, faCoins, faPuzzlePiece, faSkull,
    faPaw, faGifts, faBox, faAt, faShoppingCart,
    faTimes, faTicketAlt, faTerminal, faTag, faSyncAlt, faStickyNote, faRss, faRobot, faQuoteLeft, faQuestion, faPaperclip
} from '@fortawesome/free-solid-svg-icons';
import { useBleeps } from '@/components/RivionBleepsProvider';

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

const WelcomeCardFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        M ${so},${so}
        L ${width - so},${so}
        L ${width - so},${height - so}
        L ${so + cornerCut},${height - so}
        L ${so},${height - so - cornerCut}
        Z
    `;
    
    return (
        <FrameContainer ref={containerRef}>
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
                {children}
            </FrameContent>
        </FrameContainer>
    );
};


const IconCardSquare = styled.div`
    position: relative;
    width: 87px;
    height: 87px;
    min-width: 87px;
    min-height: 87px;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--theme-primary) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        filter: brightness(1.2);
    }
`;


const IconCardAngled = styled.div`
    position: relative;
    width: 87px;
    height: 87px;
    min-width: 87px;
    min-height: 87px;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--theme-primary) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
    
    &:hover {
        filter: brightness(1.2);
    }
`;

interface DashboardCardData {
    id: number;
    title: string;
    description: string;
    icon: string;
    link: string;
}

interface WelcomeCardData {
    title: string;
    description: string;
}

interface DashboardCardsResponse {
    welcome: WelcomeCardData;
    cards: DashboardCardData[];
}

const BentoBoxSection = () => {
    const [dashboardData, setDashboardData] = useState<DashboardCardsResponse | null>(null);
    const [visibility, setVisibility] = useState({ showTopRow: true, showBottomRow: true });
    const bleeps = useBleeps();

    useEffect(() => {
        const serverData = (window as any).SiteConfiguration?.dashboardCards;
        const visibilityData = (window as any).SiteConfiguration?.bentoBoxVisibility;
        
        if (serverData) {
            console.log('BentoBoxSection: Using server-provided data:', serverData);
            setDashboardData(serverData);
        } else {
            console.log('BentoBoxSection: No server data found, using fallback');
            console.log('BentoBoxSection: Available window data:', (window as any).SiteConfiguration);
        }
        
        if (visibilityData) {
            console.log('BentoBoxSection: Visibility settings:', visibilityData);
            setVisibility(visibilityData);
        }
    }, []);

    const fallbackData = {
        welcome: {
            title: 'Welcome back!',
            description: 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.'
        },
        cards: [
            { id: 1, title: 'Support', description: 'Get help & assistance', icon: 'fa-headset', link: '' },
            { id: 2, title: 'New Service', description: 'Create new servers', icon: 'fa-plus', link: '' },
            { id: 3, title: 'Billing', description: 'Manage payments', icon: 'fa-credit-card', link: '' },
            { id: 4, title: 'Discord', description: 'Join our community', icon: 'fa-comments', link: '' },
            { id: 5, title: 'Knowledge Base', description: 'Documentation & guides', icon: 'fa-book', link: '' }
        ]
    };

    const data = dashboardData || fallbackData;
    
    if (!visibility.showTopRow && !visibility.showBottomRow) {
        return null;
    }
    
    console.log('BentoBoxSection render: dashboardData =', dashboardData);
    console.log('BentoBoxSection render: using data =', data);
    console.log('BentoBoxSection render: visibility =', visibility);
    
    const getIconComponent = (iconName: string) => {
        const iconMap = {
            'fa-server': faServer,
            'fa-headset': faHeadset,
            'fa-plus': faPlus,
            'fa-credit-card': faCreditCard,
            'fa-comments': faComments,
            'fa-book': faBook,
            'fa-users': faUsers,
            'fa-cog': faCog,
            'fa-chart-bar': faChartBar,
            'fa-shield': faShieldAlt,
            'fa-shield-alt': faShieldAlt,
            'fa-tools': faTools,
            'fa-gift': faGift,
            'fa-home': faHome,
            'fa-cloud': faCloud,
            'fa-database': faDatabase,
            'fa-network-wired': faNetworkWired,
            'fa-bell': faBell,
            'fa-lock': faLock,
            'fa-search': faSearch,
            'fa-download': faDownload,
            'fa-upload': faUpload,
            'fa-cogs': faCogs,
            'fa-user-shield': faUserShield,
            'fa-clipboard': faClipboard,
            'fa-file-alt': faFileAlt,
            'fa-key': faKey,
            'fa-wifi': faWifi,
            'fa-desktop': faDesktop,
            'fa-mobile': faMobile,
            'fa-tablet': faTablet,
            'fa-gamepad': faGamepad,
            'fa-heartbeat': faHeartbeat,
            'fa-rocket': faRocket,
            'fa-star': faStar,
            'fa-thumbs-up': faThumbsUp,
            'fa-envelope': faEnvelope,
            'fa-phone': faPhone,
            'fa-map-marker-alt': faMapMarkerAlt,
            'fa-calendar': faCalendar,
            'fa-clock': faClock,
            'fa-eye': faEye,
            'fa-edit': faEdit,
            
            'fa-globe': faGlobe,
            'fa-check': faCheck,
            'fa-heart': faHeart,
            'fa-bolt': faBolt,
            'fa-feather': faFeather,
            'fa-store': faStore,
            'fa-wallet': faWallet,
            'fa-award': faAward,
            'fa-cube': faCube,
            'fa-coins': faCoins,
            'fa-puzzle-piece': faPuzzlePiece,
            'fa-skull': faSkull,
            'fa-paw': faPaw,
            'fa-gifts': faGifts,
            'fa-box': faBox,
            'fa-at': faAt,
            'fa-shopping-cart': faShoppingCart,
            
            'fa-times': faTimes,
            'fa-ticket-alt': faTicketAlt,
            'fa-terminal': faTerminal,
            'fa-tag': faTag,
            'fa-sync-alt': faSyncAlt,
            'fa-sticky-note': faStickyNote,
            'fa-rss': faRss,
            'fa-robot': faRobot,
            'fa-quote-left': faQuoteLeft,
            'fa-question': faQuestion,
            'fa-paperclip': faPaperclip,
            
            'fa-discord': faComments
        };
        return iconMap[iconName as keyof typeof iconMap] || faHeadset;
    };

    const renderCustomIcon = (iconName: string, size: 'text-2xl' | 'text-4xl' = 'text-2xl') => {
        if (iconName === 'fi-brands-discord') {
            const fontSize = size === 'text-4xl' ? '2.5em' : '1.5em';
            return (
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    style={{ 
                        width: fontSize, 
                        height: fontSize, 
                        fill: '#ffffff' 
                    }}
                >
                    <path d="M20.317,4.37c-1.53-0.702-3.17-1.219-4.885-1.515c-0.031-0.006-0.062,0.009-0.079,0.037c-0.211,0.375-0.445,0.865-0.608,1.249c-1.845-0.276-3.68-0.276-5.487,0C9.095,3.748,8.852,3.267,8.641,2.892C8.624,2.864,8.593,2.85,8.562,2.855C6.848,3.15,5.208,3.667,3.677,4.37C3.664,4.375,3.652,4.385,3.645,4.397c-3.111,4.648-3.964,9.182-3.546,13.66c0.002,0.022,0.014,0.043,0.031,0.056c2.053,1.508,4.041,2.423,5.993,3.029c0.031,0.01,0.064-0.002,0.084-0.028c0.462-0.63,0.873-1.295,1.226-1.994c0.021-0.041,0.001-0.09-0.042-0.106c-0.653-0.248-1.274-0.55-1.872-0.892c-0.047-0.028-0.051-0.095-0.008-0.128c0.126-0.094,0.252-0.192,0.372-0.291c0.022-0.018,0.052-0.022,0.078-0.01c3.928,1.793,8.18,1.793,12.061,0c0.026-0.012,0.056-0.009,0.079,0.01c0.12,0.099,0.246,0.198,0.373,0.292c0.044,0.032,0.041,0.1-0.007,0.128c-0.598,0.349-1.219,0.645-1.873,0.891c-0.043,0.016-0.061,0.066-0.041,0.107c0.36,0.698,0.772,1.363,1.225,1.993c0.019,0.027,0.053,0.038,0.084,0.029c1.961-0.607,3.95-1.522,6.002-3.029c0.018-0.013,0.029-0.033,0.031-0.055c0.5-5.177-0.838-9.674-3.548-13.66C20.342,4.385,20.33,4.375,20.317,4.37z M8.02,15.331c-1.183,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C10.177,14.246,9.221,15.331,8.02,15.331z M15.995,15.331c-1.182,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C18.152,14.246,17.206,15.331,15.995,15.331z"/>
                </svg>
            );
        }
        return null;
    };

    const handleCardClick = (link: string) => {
        bleeps.click?.play();
        if (link && link !== '' && link !== '#') {
            window.open(link, '_blank');
        }
    };

    return (
        <div css={tw`mb-8`} style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            {/* Welcome card + 2 icon cards row */}
            {visibility.showBottomRow && (
                <div 
                    css={tw`flex gap-4`} 
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                    className="bento-bottom-row"
                >
                    {/* Welcome Card - Custom frame: TL, TR, BR = 90°, BL = angled */}
                    <div 
                        className="bento-welcome" 
                        style={{ 
                            flex: 1, 
                            minHeight: '80px',
                            display: 'flex'
                        }}
                    >
                        <WelcomeCardFrame>
                            <div css={tw`p-4 flex items-center h-full`}>
                                <div css={tw`flex-1`}>
                                    <h2 css={tw`font-bold text-xl mb-1`} style={{ 
                                        color: 'var(--theme-text-base)',
                                        letterSpacing: '0.05em',
                                        fontFamily: '"Orbitron", "Electrolize", sans-serif',
                                        textTransform: 'uppercase'
                                    }}>
                                        {data.welcome?.title || 'Welcome back!'}
                                    </h2>
                                    <p css={tw`text-sm leading-relaxed`} style={{ color: 'var(--theme-text-muted)' }}>
                                        {data.welcome?.description || 'Manage your servers, monitor performance, and access all your hosting services from this dashboard.'}
                                    </p>
                                </div>
                            </div>
                        </WelcomeCardFrame>
                    </div>

                    {/* Right Column - 2 icon cards (stack vertically on mobile) */}
                    <div className="bento-icon-cards-container" css={tw`flex gap-3 items-stretch`} style={{ flexShrink: 0 }}>
                        {/* First icon card - all 90° corners */}
                        {data.cards[3] && (
                            <IconCardSquare 
                                className="bento-icon-card"
                                onClick={() => handleCardClick(data.cards[3].link)}
                            >
                                {renderCustomIcon(data.cards[3].icon, 'text-4xl') || (
                                    <FontAwesomeIcon 
                                        icon={getIconComponent(data.cards[3].icon)} 
                                        css={tw`text-3xl`}
                                        style={{ color: '#ffffff' }}
                                    />
                                )}
                            </IconCardSquare>
                        )}
                        
                        {/* Second icon card - TL, TR, BL = 90°, BR = angled */}
                        {data.cards[4] && (
                            <IconCardAngled 
                                className="bento-icon-card"
                                onClick={() => handleCardClick(data.cards[4].link)}
                            >
                                {renderCustomIcon(data.cards[4].icon, 'text-4xl') || (
                                    <FontAwesomeIcon 
                                        icon={getIconComponent(data.cards[4].icon)} 
                                        css={tw`text-3xl`}
                                        style={{ color: '#ffffff' }}
                                    />
                                )}
                            </IconCardAngled>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BentoBoxSection;
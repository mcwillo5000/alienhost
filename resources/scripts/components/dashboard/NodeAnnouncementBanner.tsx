import React, { useState, useRef, useEffect } from 'react';
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
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { useBleeps } from '@/components/RivionBleepsProvider';
import { ServerContext } from '@/state/server';


const setCookie = (name: string, value: string, days: number = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
};


const generateAnnouncementId = (nodeId: number, title: string, description: string, index: number): string => {
    const content = `${nodeId}-${index}-${title}-${description}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return `node_announcement_${Math.abs(hash)}`;
};

const BannerWrapper = styled.div`
    position: relative;
    margin-bottom: 1rem;
`;

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

const BannerInner = styled.div`
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const AnnouncementFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                if (width > 0 && height > 0) {
                    setDimensions({ 
                        width: Math.floor(width), 
                        height: Math.floor(height) 
                    });
                }
            }
        };
        
        updateDimensions();
        
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        return () => resizeObserver.disconnect();
    }, []);
    
    const width = dimensions?.width || 0;
    const height = dimensions?.height || 0;
    const strokeWidth = 1;
    const so = strokeWidth / 2;
    const cornerCut = Math.min(24, height * 0.35);
    
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
            {dimensions && (
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
                    
                    {/* Border/stroke line */}
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
            )}
            
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

interface NodeAnnouncement {
    node_id: number;
    node_name: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
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
        'fa-bullhorn': faBell,
        'fa-megaphone': faBell,
        'fa-info-circle': faGlobe,
        'fa-exclamation-triangle': faEdit,
        'fa-discord': faComments
    };
    return iconMap[iconName] || faBell;
};

const renderCustomIcon = (iconName: string, color?: string) => {
    if (iconName === 'fi-brands-discord') {
        return (
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                css={tw`w-6 h-6`}
                style={{ fill: color || 'var(--theme-primary)' }}
            >
                <path d="M20.317,4.37c-1.53-0.702-3.17-1.219-4.885-1.515c-0.031-0.006-0.062,0.009-0.079,0.037c-0.211,0.375-0.445,0.865-0.608,1.249c-1.845-0.276-3.68-0.276-5.487,0C9.095,3.748,8.852,3.267,8.641,2.892C8.624,2.864,8.593,2.85,8.562,2.855C6.848,3.15,5.208,3.667,3.677,4.37C3.664,4.375,3.652,4.385,3.645,4.397c-3.111,4.648-3.964,9.182-3.546,13.66c0.002,0.022,0.014,0.043,0.031,0.056c2.053,1.508,4.041,2.423,5.993,3.029c0.031,0.01,0.064-0.002,0.084-0.028c0.462-0.63,0.873-1.295,1.226-1.994c0.021-0.041,0.001-0.09-0.042-0.106c-0.653-0.248-1.274-0.55-1.872-0.892c-0.047-0.028-0.051-0.095-0.008-0.128c0.126-0.094,0.252-0.192,0.372-0.291c0.022-0.018,0.052-0.022,0.078-0.01c3.928,1.793,8.18,1.793,12.061,0c0.026-0.012,0.056-0.009,0.079,0.01c0.12,0.099,0.246,0.198,0.373,0.292c0.044,0.032,0.041,0.1-0.007,0.128c-0.598,0.349-1.219,0.645-1.873,0.891c-0.043,0.016-0.061,0.066-0.041,0.107c0.36,0.698,0.772,1.363,1.225,1.993c0.019,0.027,0.053,0.038,0.084,0.029c1.961-0.607,3.95-1.522,6.002-3.029c0.018-0.013,0.029-0.033,0.031-0.055c0.5-5.177-0.838-9.674-3.548-13.66C20.342,4.385,20.33,4.375,20.317,4.37z M8.02,15.331c-1.183,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C10.177,14.246,9.221,15.331,8.02,15.331z M15.995,15.331c-1.182,0-2.157-1.086-2.157-2.419s0.955-2.419,2.157-2.419c1.211,0,2.176,1.095,2.157,2.419C18.152,14.246,17.206,15.331,15.995,15.331z"/>
            </svg>
        );
    }
    return null;
};

const SingleBanner = ({ 
    icon, 
    title, 
    description, 
    color, 
    onClose 
}: { 
    icon?: string; 
    title?: string; 
    description?: string; 
    color?: string;
    onClose: () => void;
}) => {
    const bleeps = useBleeps();
    
    const handleClose = () => {
        bleeps.close?.play();
        onClose();
    };
    
    return (
        <BannerWrapper className="node-announcement-banner">
            <AnnouncementFrame>
                <BannerInner>
                    {/* Icon */}
                    {icon && (
                        <div css={tw`flex-shrink-0 mr-4 flex items-center justify-center`}>
                            {renderCustomIcon(icon, 'var(--theme-primary)') || (
                                <FontAwesomeIcon 
                                    icon={getIconComponent(icon)} 
                                    css={tw`text-2xl`}
                                    style={{ 
                                        color: 'var(--theme-primary)'
                                    }}
                                />
                            )}
                        </div>
                    )}
                    
                    {/* Text content */}
                    <div css={tw`flex-1 min-w-0`}>
                        {title && (
                            <h3 css={tw`font-semibold text-lg mb-1`} style={{ 
                                color: 'var(--theme-primary)',
                                letterSpacing: '0.05em',
                                fontFamily: '"Orbitron", "Electrolize", sans-serif',
                                textTransform: 'uppercase'
                            }}>
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p css={tw`text-sm leading-relaxed`} style={{ color: 'var(--theme-text-base)' }}>
                                {description}
                            </p>
                        )}
                    </div>
                    
                    {/* Close button */}
                    <button 
                        onClick={handleClose} 
                        css={tw`ml-4 flex-shrink-0 transition-all duration-200`}
                        style={{ 
                            color: 'var(--theme-text-muted)',
                            background: 'transparent',
                            border: 'none',
                            padding: '0.4rem 0.5rem',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--theme-primary)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--theme-text-muted)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label="Close announcement"
                    >
                        <FontAwesomeIcon icon={faTimes} css={tw`text-lg`} />
                    </button>
                </BannerInner>
            </AnnouncementFrame>
        </BannerWrapper>
    );
};

const NodeAnnouncementBanner: React.FC = () => {
    const serverNode = ServerContext.useStoreState((state) => state.server.data?.node);
    const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
    const [nodeAnnouncements, setNodeAnnouncements] = useState<NodeAnnouncement[]>([]);


    useEffect(() => {
        const siteConfig = (window as any).SiteConfiguration;
        if (siteConfig?.nodeAnnouncements && Array.isArray(siteConfig.nodeAnnouncements)) {
            setNodeAnnouncements(siteConfig.nodeAnnouncements);
        }
    }, []);

    useEffect(() => {
        const dismissed: string[] = [];
        nodeAnnouncements.forEach((announcement, index) => {
            const announcementId = generateAnnouncementId(
                announcement.node_id, 
                announcement.title, 
                announcement.description,
                index
            );
            const cookieValue = getCookie(announcementId);
            if (cookieValue === 'dismissed') {
                dismissed.push(announcementId);
            }
        });
        setDismissedAnnouncements(dismissed);
    }, [nodeAnnouncements]);


    const matchingAnnouncements = nodeAnnouncements
        .map((announcement, index) => ({ ...announcement, _index: index }))
        .filter((announcement) => {
            if (!serverNode) return false;
            if (announcement.node_name !== serverNode) return false;
            
            const announcementId = generateAnnouncementId(
                announcement.node_id, 
                announcement.title, 
                announcement.description,
                announcement._index
            );
            return !dismissedAnnouncements.includes(announcementId);
        });

    const handleDismiss = (announcement: NodeAnnouncement & { _index: number }) => {
        const announcementId = generateAnnouncementId(
            announcement.node_id, 
            announcement.title, 
            announcement.description,
            announcement._index
        );
        

        setCookie(announcementId, 'dismissed', 30);
        

        setDismissedAnnouncements([...dismissedAnnouncements, announcementId]);
    };

    if (matchingAnnouncements.length === 0) {
        return null;
    }

    return (
        <div 
            css={tw`mb-4 mx-4 xl:mx-auto`}
            style={{ maxWidth: '1200px' }}
        >
            {matchingAnnouncements.map((announcement) => (
                <SingleBanner
                    key={`node-${announcement.node_id}-${announcement._index}`}
                    icon={announcement.icon}
                    title={announcement.title}
                    description={announcement.description}
                    color={announcement.color}
                    onClose={() => handleDismiss(announcement)}
                />
            ))}
        </div>
    );
};

export default NodeAnnouncementBanner;

import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useHistory, useLocation } from 'react-router';
import ThemeToggle from '@/components/ThemeToggle';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faHeadset, faServer, faPlus, faCreditCard, faComments, faBook, faUsers, faCog, faChartBar, faShieldAlt, faTools, faGift,
    faHome, faCloud, faDatabase, faNetworkWired, faBell, faLock, faDownload, faUpload, faCogs,
    faUserShield, faClipboard, faFileAlt, faKey, faWifi, faDesktop, faMobile, faTablet, faGamepad, faHeartbeat,
    faRocket, faStar, faThumbsUp, faEnvelope, faPhone, faMapMarkerAlt, faCalendar, faClock, faEye, faEdit,
    faGlobe, faCheck, faHeart, faBolt, faFeather, faStore, faWallet, faAward, faCube, faCoins, faPuzzlePiece, faSkull,
    faPaw, faGifts, faBox, faAt, faShoppingCart, faTimes, faTicketAlt, faTerminal, faTag, faSyncAlt, faStickyNote, 
    faRss, faRobot, faQuoteLeft, faQuestion, faPaperclip } from '@fortawesome/free-solid-svg-icons';

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

export default () => {
    const history = useHistory();
    const location = useLocation();
    const { path } = useRouteMatch();
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name);


    const additionalButtons = getAdditionalButtons();
    

    const handleButtonClick = (link: string) => {
        if (link && link !== '' && link !== '#') {
            window.open(link, '_blank');
        }
    };

    const getSiteIcon = () => {
        if (typeof window !== 'undefined' && (window as any).SiteConfiguration?.siteAssets?.siteIcon) {
            return (window as any).SiteConfiguration.siteAssets.siteIcon;
        }
        return '';
    };

    const getBackgroundSettings = () => {
        if (typeof window !== 'undefined' && (window as any).SiteConfiguration?.backgrounds) {
            return {
                authBackgroundImage: (window as any).SiteConfiguration.backgrounds.authBackgroundImage || '',
                authBackgroundEffect: (window as any).SiteConfiguration.backgrounds.authBackgroundEffect || 'none',
                authLayout: (window as any).SiteConfiguration.backgrounds.authLayout || 'base'
            };
        }
        return {
            authBackgroundImage: '',
            authBackgroundEffect: 'none',
            authLayout: 'base'
        };
    };

    const backgroundSettings = getBackgroundSettings();


    const [screenSize, setScreenSize] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    React.useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const getResponsiveWidths = () => {
        if (screenSize.width <= 768) {
            
            return { formWidth: '100vw', imageWidth: '0vw', showImage: false };
        } else if (screenSize.width <= 1024) {
           
            return { formWidth: '70vw', imageWidth: '30vw', showImage: true };
        } else {
            
            return { formWidth: '50vw', imageWidth: '50vw', showImage: true };
        }
    };

    const responsiveWidths = getResponsiveWidths();

    return (
        <>
            {backgroundSettings.authBackgroundImage && backgroundSettings.authLayout === 'base' && (
                <div 
                    style={{
                        position: 'fixed',
                        top: '-20px',
                        left: '-20px',
                        right: '-20px',
                        bottom: '-20px',
                        width: 'calc(100vw + 40px)',
                        height: 'calc(100vh + 40px)',
                        backgroundImage: `url(${backgroundSettings.authBackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: (() => {
                            switch(backgroundSettings.authBackgroundEffect) {
                                case 'blur': return 'blur(5px)';
                                case 'heavy-blur': return 'blur(15px)';
                                default: return 'none';
                            }
                        })(),
                        opacity: (() => {
                            switch(backgroundSettings.authBackgroundEffect) {
                                case 'overlay': return 0.6;
                                case 'heavy-overlay': return 0.3;
                                default: return 1;
                            }
                        })(),
                        zIndex: 2,
                        pointerEvents: 'none',
                    }}
                />
            )}

            {backgroundSettings.authLayout === 'base' && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'linear-gradient(0deg, color-mix(in srgb, var(--theme-primary) 15%, transparent) 0%, transparent 100%)',
                        zIndex: 8,
                        pointerEvents: 'none',
                    }}
                />
            )}

            {backgroundSettings.authLayout === 'side' ? (
                <>
                    <div 
                        className="auth-header-buttons"
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            right: screenSize.width <= 768 ? '0.75rem' : '1rem', 
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: screenSize.width <= 768 ? '6px' : '8px', 
                            opacity: 0.8,
                        }}
                    >
                        {additionalButtons.map((button) => (
                            <button
                                key={button.id}
                                onClick={() => handleButtonClick(button.link)}
                                title={button.text}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: screenSize.width <= 768 ? '6px 0.6rem' : '7px 0.75rem',
                                    borderRadius: '0',
                                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                                    border: '1px solid var(--theme-border)',
                                    backgroundColor: 'var(--theme-background-secondary)',
                                    color: 'var(--theme-text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: screenSize.width <= 768 ? '0.875rem' : '0.9375rem',
                                    fontWeight: 500,
                                    lineHeight: 1.25,
                                    fontFamily: "'Electrolize', sans-serif",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 15%, transparent)';
                                    e.currentTarget.style.borderColor = 'var(--theme-primary)';
                                    e.currentTarget.style.color = 'var(--theme-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-background-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--theme-border)';
                                    e.currentTarget.style.color = 'var(--theme-text-muted)';
                                }}
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
                            </button>
                        ))}
                        <div style={{ opacity: 0.8 }}>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div 
                        className="auth-header-logo"
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            left: screenSize.width <= 768 ? '0.75rem' : '1.25rem', 
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 20,
                        }}
                    >
                        <div 
                            className="rivion-sidebar-logo"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'default',
                                whiteSpace: 'nowrap',
                                fontSize: screenSize.width <= 768 ? '0.9rem' : '1rem', 
                            }}
                        >
                            {getSiteIcon() && (
                                <img
                                    src={getSiteIcon()}
                                    alt="Site Logo"
                                    style={{
                                        height: '1.5em',
                                        width: 'auto',
                                        marginRight: '8px',
                                        objectFit: 'contain',
                                    }}
                                />
                            )}
                            {name}
                        </div>
                    </div>


                    <div 
                        className="responsive-form-panel"
                        style={{
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            width: responsiveWidths.formWidth,
                            height: '100vh',
                            backgroundColor: 'var(--rivion-background)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: screenSize.width <= 768 ? '1rem' : '2rem',
                            paddingTop: '6rem', 
                            zIndex: 10,
                        }}
                    >
                        <div 
                            className="auth-form-container"
                            style={{
                                width: '100%',
                                maxWidth: screenSize.width <= 768 ? '100%' : '28rem', 
                                padding: screenSize.width <= 768 ? '0 1rem' : '0',
                            }}
                        >
                            <Switch location={location}>
                                <Route path={`${path}/login`} component={LoginContainer} exact />
                                <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
                                <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
                                <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
                                <Route path={`${path}/checkpoint`} />
                                <Route path={'*'}>
                                    <NotFound onBack={() => history.push('/auth/login')} />
                                </Route>
                            </Switch>
                        </div>
                    </div>
                    

                    {responsiveWidths.showImage && (
                        <div 
                            className="responsive-image-panel"
                            style={{
                                position: 'fixed',
                                top: '0',
                                right: '0',
                                width: responsiveWidths.imageWidth,
                                height: '100vh',
                                backgroundColor: backgroundSettings.authBackgroundImage ? 'transparent' : 'var(--rivion-background-secondary)',
                                backgroundImage: backgroundSettings.authBackgroundImage ? `url(${backgroundSettings.authBackgroundImage})` : `linear-gradient(135deg, ${((window as any).SiteConfiguration?.theme?.light_primary) || '#3b82f6'}20 0%, ${((window as any).SiteConfiguration?.theme?.light_secondary) || '#6366f1'}40 100%)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                filter: (() => {
                                    if (!backgroundSettings.authBackgroundImage) return 'none';
                                    switch(backgroundSettings.authBackgroundEffect) {
                                        case 'blur': return 'blur(5px)';
                                        case 'heavy-blur': return 'blur(15px)';
                                        default: return 'none';
                                    }
                                })(),
                                opacity: (() => {
                                    if (!backgroundSettings.authBackgroundImage) return 1;
                                    switch(backgroundSettings.authBackgroundEffect) {
                                        case 'overlay': return 0.6;
                                        case 'heavy-overlay': return 0.3;
                                        default: return 1;
                                    }
                                })(),
                                zIndex: 5,
                            }}
                        >

                            {backgroundSettings.authBackgroundImage && (
                                <div 
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: `linear-gradient(135deg, 
                                            ${((window as any).SiteConfiguration?.theme?.light_primary) || '#3b82f6'}10 0%, 
                                            ${((window as any).SiteConfiguration?.theme?.light_secondary) || '#6366f1'}15 100%)`,
                                        pointerEvents: 'none',
                                    }}
                                />
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div
                    className={'rivion-auth-container'}
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '2rem 1rem',
                        position: 'relative',
                        zIndex: 10,
                    }}
                >

                        <div 
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                zIndex: 20,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: 0.8,
                            }}
                        >

                            {additionalButtons.map((button) => (
                                <button
                                    key={button.id}
                                    onClick={() => handleButtonClick(button.link)}
                                    title={button.text}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '7px 0.75rem',
                                        borderRadius: '0',
                                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                                        border: '1px solid var(--theme-border)',
                                        backgroundColor: 'var(--theme-background-secondary)',
                                        color: 'var(--theme-text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                        lineHeight: 1.25,
                                        fontFamily: "'Electrolize', sans-serif",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 15%, transparent)';
                                        e.currentTarget.style.borderColor = 'var(--theme-primary)';
                                        e.currentTarget.style.color = 'var(--theme-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--theme-background-secondary)';
                                        e.currentTarget.style.borderColor = 'var(--theme-border)';
                                        e.currentTarget.style.color = 'var(--theme-text-muted)';
                                    }}
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
                                </button>
                            ))}
                            <div style={{ opacity: 0.8 }}>
                                <ThemeToggle />
                            </div>
                        </div>


                        <div 
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                left: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                zIndex: 20,
                            }}
                        >
                            <div 
                                className="rivion-sidebar-logo"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'default',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {getSiteIcon() && (
                                    <img
                                        src={getSiteIcon()}
                                        alt="Site Logo"
                                        style={{
                                            height: '1.5em',
                                            width: 'auto',
                                            marginRight: '8px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                )}
                                {name}
                            </div>
                        </div>
                        

                        <div 
                            style={{
                                display: 'flex',
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem 1rem',
                            }}
                        >
                            <div 
                                style={{
                                    width: '100%',
                                    maxWidth: '28rem',
                                }}
                            >
                                <Switch location={location}>
                                    <Route path={`${path}/login`} component={LoginContainer} exact />
                                    <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
                                    <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
                                    <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
                                    <Route path={`${path}/checkpoint`} />
                                    <Route path={'*'}>
                                        <NotFound onBack={() => history.push('/auth/login')} />
                                    </Route>
                                </Switch>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
};
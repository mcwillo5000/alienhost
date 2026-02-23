import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faTimes, 
    faChevronDown,
    faLayerGroup,
    faWrench,
    faKey,
    faLock,
    faChartLine,
    faStore,
    faWallet,
    faLifeRing,
    faSearch,
    faGlobe,
    faVolumeUp,
    faVolumeMute,
    faSun,
    faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import ServerNavigationSection from './ServerNavigationSection';
import { useTranslation } from 'react-i18next';
import FuturisticNavLink, { FuturisticNavAnchor, FuturisticNavButton } from './FuturisticNavLink';
import getAvailableLocales from '@/api/getAvailableLocales';
import SearchModal from '@/components/dashboard/search/SearchModal';
import { useBleeps, useBleepsContext } from '@/components/RivionBleepsProvider';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    type?: 'dashboard' | 'server';
}

export default ({ isOpen, onClose, type = 'dashboard' }: SidebarProps) => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [sectionsCollapsed, setSectionsCollapsed] = useState<{[key: string]: boolean}>({});
    const [searchVisible, setSearchVisible] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    let soundEnabled = true;
    let bleepsSetEnabled = (_: boolean) => {};
    try {
        const bleepsContext = useBleepsContext();
        soundEnabled = bleepsContext.enabled;
        bleepsSetEnabled = bleepsContext.setEnabled;
    } catch {

    }
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const siteConfig = (window as any).SiteConfiguration?.theme;
        const defaultTheme = siteConfig?.defaultTheme || 'dark';
        if (savedTheme) return savedTheme === 'dark';
        if (defaultTheme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
        return defaultTheme === 'dark';
    });
    const [sidebarLinks, setSidebarLinks] = useState({
        newServer: '',
        billing: '',
        support: ''
    });
    const bleeps = useBleeps();

    const playClick = () => bleeps.click?.play();
    const playOpen = () => bleeps.open?.play();
    const playClose = () => bleeps.close?.play();

    useEffect(() => {
        getAvailableLocales()
            .then((locales) => setAvailableLanguages(locales))
            .catch(() => setAvailableLanguages(['en']));
    }, []);

    useEffect(() => {
        const dashboardData = (window as any).SiteConfiguration?.dashboardCards;
        if (dashboardData?.sidebarLinks) {
            setSidebarLinks(dashboardData.sidebarLinks);
        }
    }, []);


    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            onClose();
        }
    }, [location.pathname]);

    const changeLanguage = (lang: string) => {
        playClick();
        i18n.changeLanguage(lang);
        localStorage.setItem('panel_language', lang);
        setIsLanguageOpen(false);
    };

    const toggleSound = () => {
        bleepsSetEnabled(!soundEnabled);
    };

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
        playClick();
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        applyTheme(newTheme);
    };

    const isServerPage = location.pathname.startsWith('/server/');
    const isAccountPage = location.pathname.startsWith('/account');
    const isDashboardPage = location.pathname === '/' || location.pathname === '';

    const toggleSection = (section: string) => {
        setSectionsCollapsed(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const accountNavItems = [
        {
            name: t('sidebar.account'),
            path: '/account',
            icon: faUser,
            exact: true
        },
        {
            name: t('sidebar.apiCredentials'),
            path: '/account/api',
            icon: faKey
        },
        {
            name: t('sidebar.sshKeys'),
            path: '/account/ssh',
            icon: faLock
        },
        {
            name: t('sidebar.activity'),
            path: '/account/activity',
            icon: faChartLine
        }
    ];

    return (
        <>
            <div 
                className={`rivion-sidebar ${isOpen ? 'open' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >

                <div className="rivion-sidebar-mobile-header">
                    <button 
                        className="rivion-sidebar-close"
                        onClick={onClose}
                        aria-label="Close Sidebar"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>


                <div className="rivion-sidebar-content">

                    <div className="rivion-nav-section">
                        <div className="rivion-nav-section-header-static">
                            <h3 className="rivion-nav-section-title">{t('sidebar.dashboard')}</h3>
                        </div>
                        <div className="rivion-nav-list">
                            <FuturisticNavLink 
                                to="/" 
                                exact
                            >
                                <FontAwesomeIcon icon={faLayerGroup} className="rivion-nav-icon" />
                                <span>{t('sidebar.servers')}</span>
                            </FuturisticNavLink>
                            

                            {sidebarLinks.support && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.support} 
                                >
                                    <FontAwesomeIcon icon={faLifeRing} className="rivion-nav-icon" />
                                    <span>{t('sidebar.support')}</span>
                                </FuturisticNavAnchor>
                            )}
                            

                            {sidebarLinks.newServer && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.newServer} 
                                >
                                    <FontAwesomeIcon icon={faStore} className="rivion-nav-icon" />
                                    <span>{t('sidebar.newServer')}</span>
                                </FuturisticNavAnchor>
                            )}
                            
                            {sidebarLinks.billing && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.billing} 
                                >
                                    <FontAwesomeIcon icon={faWallet} className="rivion-nav-icon" />
                                    <span>{t('sidebar.billingArea')}</span>
                                </FuturisticNavAnchor>
                            )}
                            
                            {rootAdmin && (
                                <FuturisticNavAnchor 
                                    href="/admin" 
                                    rel="noreferrer"
                                >
                                    <FontAwesomeIcon icon={faWrench} className="rivion-nav-icon" />
                                    <span>{t('sidebar.adminPanel')}</span>
                                </FuturisticNavAnchor>
                            )}
                        </div>
                    </div>


                    {(isDashboardPage || isAccountPage) && (
                        <div className="rivion-nav-section rivion-mobile-settings-section">
                            <div className="rivion-nav-section-header-static">
                                <h3 className="rivion-nav-section-title">{t('sidebar.settings', 'Settings')}</h3>
                            </div>
                            <div className="rivion-nav-list">

                                {isDashboardPage && (
                                    <FuturisticNavButton onClick={() => { playOpen(); setSearchVisible(true); }}>
                                        <FontAwesomeIcon icon={faSearch} className="rivion-nav-icon" />
                                        <span>{t('sidebar.search', 'Search Servers')}</span>
                                    </FuturisticNavButton>
                                )}


                                <FuturisticNavButton 
                                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                    rightContent={
                                        <>
                                            <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{(i18n.language || 'en').toUpperCase()}</span>
                                            <img 
                                                src={`/assets/lang/${i18n.language || 'en'}.svg`}
                                                alt={i18n.language || 'en'}
                                                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <FontAwesomeIcon 
                                                icon={faChevronDown} 
                                                style={{ 
                                                    fontSize: '10px', 
                                                    transition: 'transform 0.2s',
                                                    transform: isLanguageOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                                }} 
                                            />
                                        </>
                                    }
                                >
                                    <FontAwesomeIcon icon={faGlobe} className="rivion-nav-icon" />
                                    <span>{t('sidebar.language', 'Language')}</span>
                                </FuturisticNavButton>
                                {isLanguageOpen && (
                                    <div style={{
                                        background: 'var(--theme-background-secondary)',
                                        border: '1px solid var(--theme-border)',
                                        borderRadius: '4px',
                                        margin: '4px 16px 8px 16px',
                                        overflow: 'hidden'
                                    }}>
                                        {availableLanguages.map((langRaw) => {
                                            const lang = langRaw || 'en';
                                            return (
                                                <button
                                                    key={lang}
                                                    onClick={() => changeLanguage(lang)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        background: (i18n.language || 'en') === lang ? 'color-mix(in srgb, var(--theme-primary) 15%, transparent)' : 'transparent',
                                                        border: 'none',
                                                        color: (i18n.language || 'en') === lang ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                                                        fontSize: '13px',
                                                        fontWeight: (i18n.language || 'en') === lang ? 600 : 400,
                                                        cursor: 'pointer',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    <img 
                                                        src={`/assets/lang/${lang}.svg`}
                                                        alt={lang}
                                                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                    <span style={{ textTransform: 'uppercase' }}>{lang}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}


                                {!(window as any).SiteConfiguration?.theme?.disableThemeToggle && (
                                    <FuturisticNavButton 
                                        onClick={toggleTheme}
                                        rightContent={
                                            <span>{isDark ? t('sidebar.dark', 'Dark') : t('sidebar.light', 'Light')}</span>
                                        }
                                    >
                                        <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="rivion-nav-icon" />
                                        <span>{t('sidebar.theme', 'Theme')}</span>
                                    </FuturisticNavButton>
                                )}


                                <FuturisticNavButton 
                                    onClick={toggleSound}
                                    rightContent={
                                        <span>{soundEnabled ? t('sidebar.on', 'On') : t('sidebar.off', 'Off')}</span>
                                    }
                                >
                                    <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} className="rivion-nav-icon" />
                                    <span>{t('sidebar.sound', 'Sound Effects')}</span>
                                </FuturisticNavButton>
                            </div>
                        </div>
                    )}


                    {type === 'server' ? (
                        <ServerNavigationSection />
                    ) : null}


                    {isAccountPage && (
                        <div className="rivion-nav-section rivion-account-nav-section">
                            <div 
                                className="rivion-nav-section-header"
                                onClick={() => toggleSection('account')}
                            >
                                <h3 className="rivion-nav-section-title">{t('sidebar.account')}</h3>
                                <FontAwesomeIcon 
                                    icon={faChevronDown} 
                                    className="rivion-nav-section-toggle" 
                                />
                            </div>
                            <div className="rivion-nav-list">
                                {accountNavItems.map((item) => (
                                    <FuturisticNavLink 
                                        key={item.path}
                                        to={item.path}
                                        exact={item.exact}
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="rivion-nav-icon" />
                                        <span>{item.name}</span>
                                    </FuturisticNavLink>
                                ))}
                            </div>
                        </div>
                    )}


                    {isServerPage && (
                        <div className="rivion-nav-section rivion-mobile-settings-section-bottom">
                            <div className="rivion-nav-section-header-static">
                                <h3 className="rivion-nav-section-title">{t('sidebar.settings', 'Settings')}</h3>
                            </div>
                            <div className="rivion-nav-list">

                                <FuturisticNavButton 
                                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                    rightContent={
                                        <>
                                            <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{(i18n.language || 'en').toUpperCase()}</span>
                                            <img 
                                                src={`/assets/lang/${i18n.language || 'en'}.svg`}
                                                alt={i18n.language || 'en'}
                                                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <FontAwesomeIcon 
                                                icon={faChevronDown} 
                                                style={{ 
                                                    fontSize: '10px', 
                                                    transition: 'transform 0.2s',
                                                    transform: isLanguageOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                                }} 
                                            />
                                        </>
                                    }
                                >
                                    <FontAwesomeIcon icon={faGlobe} className="rivion-nav-icon" />
                                    <span>{t('sidebar.language', 'Language')}</span>
                                </FuturisticNavButton>
                                {isLanguageOpen && (
                                    <div style={{
                                        background: 'var(--theme-background-secondary)',
                                        border: '1px solid var(--theme-border)',
                                        borderRadius: '4px',
                                        margin: '4px 16px 8px 16px',
                                        overflow: 'hidden'
                                    }}>
                                        {availableLanguages.map((langRaw) => {
                                            const lang = langRaw || 'en';
                                            return (
                                                <button
                                                    key={lang}
                                                    onClick={() => changeLanguage(lang)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        background: (i18n.language || 'en') === lang ? 'color-mix(in srgb, var(--theme-primary) 15%, transparent)' : 'transparent',
                                                        border: 'none',
                                                        color: (i18n.language || 'en') === lang ? 'var(--theme-primary)' : 'var(--theme-text-base)',
                                                        fontSize: '13px',
                                                        fontWeight: (i18n.language || 'en') === lang ? 600 : 400,
                                                        cursor: 'pointer',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    <img 
                                                        src={`/assets/lang/${lang}.svg`}
                                                        alt={lang}
                                                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                    <span style={{ textTransform: 'uppercase' }}>{lang}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}


                                {!(window as any).SiteConfiguration?.theme?.disableThemeToggle && (
                                    <FuturisticNavButton 
                                        onClick={toggleTheme}
                                        rightContent={
                                            <span>{isDark ? t('sidebar.dark', 'Dark') : t('sidebar.light', 'Light')}</span>
                                        }
                                    >
                                        <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="rivion-nav-icon" />
                                        <span>{t('sidebar.theme', 'Theme')}</span>
                                    </FuturisticNavButton>
                                )}


                                <FuturisticNavButton 
                                    onClick={toggleSound}
                                    rightContent={
                                        <span>{soundEnabled ? t('sidebar.on', 'On') : t('sidebar.off', 'Off')}</span>
                                    }
                                >
                                    <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} className="rivion-nav-icon" />
                                    <span>{t('sidebar.sound', 'Sound Effects')}</span>
                                </FuturisticNavButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {searchVisible && (
                <SearchModal 
                    appear 
                    visible={searchVisible} 
                    onDismissed={() => { playClose(); setSearchVisible(false); }} 
                />
            )}
        </>
    );
};
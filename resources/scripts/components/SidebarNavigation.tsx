import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBars, 
    faTimes, 
    faServer,
    faTerminal,
    faDatabase,
    faUsers,
    faHdd,
    faNetworkWired,
    faRocket,
    faCog,
    faClipboard,
    faLayerGroup,
    faCogs,
    faWrench,
    faFolder,
    faClock,
    faKey,
    faLock,
    faChartLine,
    faUser,
    faPlus,
    faFileInvoiceDollar,
    faHeadset
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { useTranslation } from 'react-i18next';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import FuturisticNavLink, { FuturisticNavAnchor } from '@/components/elements/rivion/FuturisticNavLink';

interface SidebarProps {
    className?: string;
}

export default ({ className }: SidebarProps) => {
    const location = useLocation();
    const { t } = useTranslation();
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isCollapsed, setIsCollapsed] = useState(false);


    const [sidebarLinks, setSidebarLinks] = useState({
        newServer: '',
        billing: '',
        support: ''
    });

    useEffect(() => {
        const dashboardData = (window as any).SiteConfiguration?.dashboardCards;
        if (dashboardData?.sidebarLinks) {
            setSidebarLinks(dashboardData.sidebarLinks);
        }
    }, []);

    const server = ServerContext.useStoreState ? 
        ServerContext.useStoreState((state) => state.server.data) : null;
    const permissions = ServerContext.useStoreState ? 
        ServerContext.useStoreState((state) => state.server.permissions) : [];

    const isServerPage = location.pathname.startsWith('/server/');
    const isAccountPage = location.pathname.startsWith('/account');
    const isDashboardPage = location.pathname === '/' || location.pathname === '';

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const serverNavItems = [
        {
            name: 'Console',
            path: '/',
            icon: faTerminal,
            permission: null,
            exact: true
        },
        {
            name: 'Files',
            path: '/files',
            icon: faFolder,
            permission: 'file.*'
        },
        {
            name: 'Databases',
            path: '/databases',
            icon: faDatabase,
            permission: 'database.*'
        },
        {
            name: 'Schedules',
            path: '/schedules',
            icon: faClock,
            permission: 'schedule.*'
        },
        {
            name: 'Users',
            path: '/users',
            icon: faUsers,
            permission: 'user.*'
        },
        {
            name: 'Backups',
            path: '/backups',
            icon: faHdd,
            permission: 'backup.*'
        },
        {
            name: 'Network',
            path: '/network',
            icon: faNetworkWired,
            permission: 'allocation.*'
        },
        {
            name: 'Startup',
            path: '/startup',
            icon: faRocket,
            permission: 'startup.*'
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: faCog,
            permission: ['settings.*', 'file.sftp']
        },
        {
            name: 'Activity',
            path: '/activity',
            icon: faClipboard,
            permission: 'activity.*'
        }
    ];


    const accountNavItems = [
        {
            name: 'Account',
            path: '/account',
            icon: faUser,
            exact: true
        },
        {
            name: 'API Credentials',
            path: '/account/api',
            icon: faKey
        },
        {
            name: 'SSH Keys',
            path: '/account/ssh',
            icon: faLock
        },
        {
            name: 'Activity',
            path: '/account/activity',
            icon: faChartLine
        }
    ];

    return (
        <>
            <div className={`rivion-sidebar ${isCollapsed ? 'collapsed' : ''} ${className || ''}`}>
                <div className="rivion-sidebar-header">
                    <div className="rivion-sidebar-logo">
                        <Link to="/" className="rivion-logo-link">
                            {!isCollapsed && <span className="rivion-logo-text">{name}</span>}
                        </Link>
                    </div>
                    <button 
                        className="rivion-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} />
                    </button>
                </div>

                
                <div className="rivion-sidebar-content">
                    
                    <div className="rivion-sidebar-section">
                        {!isCollapsed && <div className="rivion-sidebar-section-title">Navigation</div>}
                        
                        <FuturisticNavLink 
                            to="/" 
                            end
                            className="rivion-sidebar-item"
                        >
                            <FontAwesomeIcon icon={faLayerGroup} className="rivion-sidebar-icon" />
                            {!isCollapsed && <span>Dashboard</span>}
                        </FuturisticNavLink>

                        {rootAdmin && (
                            <FuturisticNavAnchor 
                                href="/admin" 
                                rel="noreferrer" 
                                className="rivion-sidebar-item"
                            >
                                <FontAwesomeIcon icon={faWrench} className="rivion-sidebar-icon" />
                                {!isCollapsed && <span>Admin</span>}
                            </FuturisticNavAnchor>
                        )}
                    </div>

                    {isDashboardPage && (
                        <div className="rivion-sidebar-section">
                            {!isCollapsed && <div className="rivion-sidebar-section-title">Quick Links</div>}
                            
                            {sidebarLinks.newServer && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.newServer} 
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>{t('sidebar.newServer')}</span>}
                                </FuturisticNavAnchor>
                            )}
                            
                            {sidebarLinks.billing && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.billing} 
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>{t('sidebar.billingArea')}</span>}
                                </FuturisticNavAnchor>
                            )}
                            
                            {sidebarLinks.support && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.support} 
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faHeadset} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>{t('sidebar.support')}</span>}
                                </FuturisticNavAnchor>
                            )}
                        </div>
                    )}

                    {isServerPage && server && (
                        <div className="rivion-sidebar-section">
                            {!isCollapsed && (
                                <div className="rivion-sidebar-section-title">
                                    <FontAwesomeIcon icon={faServer} />
                                    <span className="rivion-server-name">{server.name}</span>
                                </div>
                            )}
                            
                            {serverNavItems.map((item) => {
                                if (item.permission) {
                                    return (
                                        <Can key={item.path} action={item.permission} matchAny>
                                            <FuturisticNavLink 
                                                to={`/server/${server.id}${item.path}`}
                                                end={item.exact}
                                                className="rivion-sidebar-item"
                                            >
                                                <FontAwesomeIcon icon={item.icon} className="rivion-sidebar-icon" />
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </FuturisticNavLink>
                                        </Can>
                                    );
                                }

                                return (
                                    <FuturisticNavLink 
                                        key={item.path}
                                        to={`/server/${server.id}${item.path}`}
                                        end={item.exact}
                                        className="rivion-sidebar-item"
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="rivion-sidebar-icon" />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </FuturisticNavLink>
                                );
                            })}

                            {rootAdmin && (
                                <FuturisticNavAnchor 
                                    href={`/admin/servers/view/${server.internalId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faCogs} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>Admin View</span>}
                                </FuturisticNavAnchor>
                            )}
                            
                            {sidebarLinks.newServer && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.newServer} 
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>{t('sidebar.newServer')}</span>}
                                </FuturisticNavAnchor>
                            )}
                            
                            {sidebarLinks.billing && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.billing} 
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>{t('sidebar.billingArea')}</span>}
                                </FuturisticNavAnchor>
                            )}
                            
                            {sidebarLinks.support && (
                                <FuturisticNavAnchor 
                                    href={sidebarLinks.support} 
                                    className="rivion-sidebar-item"
                                >
                                    <FontAwesomeIcon icon={faHeadset} className="rivion-sidebar-icon" />
                                    {!isCollapsed && <span>{t('sidebar.support')}</span>}
                                </FuturisticNavAnchor>
                            )}
                        </div>
                    )}

                    {isAccountPage && (
                        <>
                            <div className="rivion-sidebar-section">
                                {!isCollapsed && <div className="rivion-sidebar-section-title">Account</div>}
                                
                                {accountNavItems.map((item) => (
                                    <FuturisticNavLink 
                                        key={item.path}
                                        to={item.path}
                                        end={item.exact}
                                        className="rivion-sidebar-item"
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="rivion-sidebar-icon" />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </FuturisticNavLink>
                                ))}
                            </div>

                            <div className="rivion-sidebar-section">
                                {!isCollapsed && <div className="rivion-sidebar-section-title">Quick Links</div>}
                                
                                {sidebarLinks.newServer && (
                                    <FuturisticNavAnchor 
                                        href={sidebarLinks.newServer} 
                                        className="rivion-sidebar-item"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="rivion-sidebar-icon" />
                                        {!isCollapsed && <span>{t('sidebar.newServer')}</span>}
                                    </FuturisticNavAnchor>
                                )}
                                
                                {sidebarLinks.billing && (
                                    <FuturisticNavAnchor 
                                        href={sidebarLinks.billing} 
                                        className="rivion-sidebar-item"
                                    >
                                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="rivion-sidebar-icon" />
                                        {!isCollapsed && <span>{t('sidebar.billingArea')}</span>}
                                    </FuturisticNavAnchor>
                                )}
                                
                                {sidebarLinks.support && (
                                    <FuturisticNavAnchor 
                                        href={sidebarLinks.support} 
                                        className="rivion-sidebar-item"
                                    >
                                        <FontAwesomeIcon icon={faHeadset} className="rivion-sidebar-icon" />
                                        {!isCollapsed && <span>{t('sidebar.support')}</span>}
                                    </FuturisticNavAnchor>
                                )}
                            </div>
                        </>
                    )}
                </div>


                <div className="rivion-sidebar-footer">
                </div>
            </div>

            {!isCollapsed && (
                <div 
                    className="rivion-sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};
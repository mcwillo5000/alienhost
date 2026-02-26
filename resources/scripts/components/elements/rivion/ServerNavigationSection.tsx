import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTerminal,
    faDatabase,
    faUsers,
    faNetworkWired,
    faRocket,
    faCog,
    faLayerGroup,
    faFolder,
    faClock,
    faHistory,
    faInfoCircle,
    faWrench,
    faGamepad,
    faPuzzlePiece,
    faCubes,
    faGlobe,
    faTools,
    faBox
} from '@fortawesome/free-solid-svg-icons';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import { useTranslation } from 'react-i18next';
import FuturisticNavLink, { FuturisticNavAnchor } from './FuturisticNavLink';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

interface NavItem {
    name: string;
    path: string;
    icon: any;
    permission: string | null;
    pageKey?: string;            // matches PHP $availableServerSections key
    exact?: boolean;
    allowedEggs?: number[];      
    hiddenForEggs?: number[];
    allowedNests?: number[];
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const renderNavItems = (items: NavItem[], serverId: string, eggId: number, nestId: number, permissions: string[]) => {
    // Role users have 'role.server_access' injected into their permissions by GetUserPermissionsService.
    // For role users with page restrictions, only show items whose pageKey is in 'page.{key}' permissions.
    const isRoleUser = permissions.includes('role.server_access');

    return items
        .filter((item) => {
            // Role-user page visibility filter (runs before egg/nest filter).
            if (isRoleUser && item.pageKey) {
                if (!permissions.includes(`page.${item.pageKey}`)) {
                    return false;
                }
            }
            if (item.allowedEggs && item.allowedEggs.length > 0) {
                return item.allowedEggs.includes(eggId);
            }
            if (item.hiddenForEggs && item.hiddenForEggs.length > 0) {
                return !item.hiddenForEggs.includes(eggId);
            }
            if (item.allowedNests && item.allowedNests.length > 0) {
                return item.allowedNests.includes(nestId);
            }
            return true;
        })
        .map((item) => {
            const linkPath = `/server/${serverId}${item.path}`;

            if (item.permission) {
                return (
                    <Can key={item.path} action={item.permission} matchAny>
                        <FuturisticNavLink to={linkPath} exact={item.exact}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                        </FuturisticNavLink>
                    </Can>
                );
            }

            return (
                <FuturisticNavLink key={item.path} to={linkPath} exact={item.exact}>
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.name}</span>
                </FuturisticNavLink>
            );
        });
};

export default () => {
    const { t } = useTranslation();
    const server = ServerContext.useStoreState((state) => state.server.data);
    const permissions = ServerContext.useStoreState((state) => state.server.permissions) as string[];
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    
    if (!server) return null;
    
    const serverId = server.id;
    const serverInternalId = server.internalId;
    const eggId = server.eggId; 
    const nestId = server.nestId; 
    
    const sections: NavSection[] = [
        {
            title: t('sidebar.overview', 'Overview'),
            items: [
                { name: t('sidebar.serverInfo'), path: '/', icon: faInfoCircle, permission: null, pageKey: 'serverinfo', exact: true },
                { name: t('sidebar.console'), path: '/console', icon: faTerminal, permission: null, pageKey: 'console', exact: true },
            ],
        },
        {
            title: t('sidebar.configuration', 'Configuration'),
            items: [
                { name: t('sidebar.schedules'), path: '/schedules', icon: faClock, permission: 'schedule.*', pageKey: 'schedules' },
                { name: t('sidebar.network'), path: '/network', icon: faNetworkWired, permission: 'allocation.*', pageKey: 'network' },
                { name: t('sidebar.startup'), path: '/startup', icon: faRocket, permission: 'startup.*', pageKey: 'startup' },
                { name: t('sidebar.settings'), path: '/settings', icon: faCog, permission: 'settings.*', pageKey: 'settings' },
                { name: t('sidebar.subdomain', 'Subdomain'), path: '/subdomain', icon: faNetworkWired, permission: null, pageKey: 'subdomain' },
            ],
        },
        {
            title: t('sidebar.management', 'Management'),
            items: [
                { name: t('sidebar.fileManager'), path: '/files', icon: faFolder, permission: 'file.*', pageKey: 'files' },
                { name: t('sidebar.databases'), path: '/databases', icon: faDatabase, permission: 'database.*', pageKey: 'databases' },
                { name: t('sidebar.backups'), path: '/backups', icon: faLayerGroup, permission: 'backup.*', pageKey: 'backups' },
                { name: t('sidebar.minecraftPlugins', 'Plugins'), path: '/minecraft-plugins', icon: faPuzzlePiece, permission: 'file.*', pageKey: 'minecraft-plugins', allowedNests: [1] },
                { name: t('sidebar.mods', 'Mods'), path: '/mods', icon: faBox, permission: 'file.*', pageKey: 'mods', allowedNests: [1] },
                { name: t('sidebar.modpacks', 'Modpacks'), path: '/modpacks', icon: faCubes, permission: 'file.*', pageKey: 'modpacks', allowedNests: [1] },
                { name: t('sidebar.playerManager', 'Player Manager'), path: '/minecraft/player-manager', icon: faGamepad, permission: null, pageKey: 'player-manager', allowedNests: [1] },
                { name: t('sidebar.gameConfig', 'Game Config'), path: '/game-config', icon: faLayerGroup, permission: null, pageKey: 'game-config' },
                { name: t('sidebar.hytaleModsManagement', 'Hytale Mods'), path: '/hytale/mods', icon: faBox, permission: 'file.*', pageKey: 'hytale-mods', allowedNests: [5] },
                { name: t('sidebar.hytaleWorlds', 'Hytale Worlds'), path: '/hytale/worlds', icon: faGlobe, permission: 'file.*', pageKey: 'hytale-worlds', allowedNests: [5] },
                { name: t('sidebar.hytalePrefabs', 'Hytale Prefabs'), path: '/hytale/prefabs', icon: faLayerGroup, permission: 'file.*', pageKey: 'hytale-prefabs', allowedNests: [5] },
                { name: t('sidebar.hytaleGameSettings', 'Hytale Game Settings'), path: '/hytale/game-settings', icon: faTools, permission: 'file.*', pageKey: 'hytale-game-settings', allowedNests: [5] },
                { name: t('sidebar.hytalePlayers', 'Hytale Players'), path: '/hytale/players', icon: faUsers, permission: null, pageKey: 'hytale-players', allowedNests: [5] },
            ],
        },
        {
            title: t('sidebar.accessAndLogs', 'Access & Logs'),
            items: [
                { name: t('sidebar.users'), path: '/users', icon: faUsers, permission: 'user.*', pageKey: 'users' },
                { name: t('sidebar.activity'), path: '/activity', icon: faHistory, permission: 'activity.*', pageKey: 'activity' },
            ],
        },
        {
            title: t('sidebar.utils', 'Utils'),
            items: [
                { name: t('sidebar.importer', 'Importer'), path: '/importer', icon: faWrench, permission: null, pageKey: 'importer' },
            ],
        },
    ];

    return (
        <>
            {sections.map((section) => (
                <div key={section.title} className="rivion-nav-section">
                    <div className="rivion-nav-section-header-static">
                        <h3 className="rivion-nav-section-title">{section.title}</h3>
                    </div>
                    <div className="rivion-nav-list">
                        {renderNavItems(section.items, serverId, eggId, nestId, permissions)}
                    </div>
                </div>
            ))}

            {rootAdmin && (
                <div className="rivion-nav-section">
                    <div className="rivion-nav-section-header-static">
                        <h3 className="rivion-nav-section-title">{t('sidebar.admin', 'Admin')}</h3>
                    </div>
                    <div className="rivion-nav-list">
                        <FuturisticNavAnchor
                            href={`/admin/servers/view/${serverInternalId}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FontAwesomeIcon icon={faWrench} />
                            <span>{t('sidebar.adminView')}</span>
                        </FuturisticNavAnchor>
                    </div>
                </div>
            )}
        </>
    );
};
import React, { lazy } from 'react';
import ServerConsole from '@/components/server/console/ServerConsoleContainer';
import DatabasesContainer from '@/components/server/databases/DatabasesContainer';
import ScheduleContainer from '@/components/server/schedules/ScheduleContainer';
import UsersContainer from '@/components/server/users/UsersContainer';
import BackupContainer from '@/components/server/backups/BackupContainer';
import NetworkContainer from '@/components/server/network/NetworkContainer';
import StartupContainer from '@/components/server/startup/StartupContainer';
import FileManagerContainer from '@/components/server/files/FileManagerContainer';
import ModpacksContainer from '@/components/server/minecraft-modpacks/ModpacksContainer';
import MinecraftPluginContainer from '@/components/server/minecraft-plugins/MinecraftPluginContainer';
import MinecraftInstalledPluginsContainer from '@/components/server/minecraft-plugins/MinecraftInstalledPluginsContainer';
import SettingsContainer from '@/components/server/settings/SettingsContainer';
import AccountOverviewContainer from '@/components/dashboard/AccountOverviewContainer';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import ActivityLogContainer from '@/components/dashboard/activity/ActivityLogContainer';
import ServerActivityLogContainer from '@/components/server/ServerActivityLogContainer';
import SubdomainContainer from '@/components/server/subdomain/SubdomainContainer';
import ModContainer from '@/components/server/mods/ModContainer';
import HytaleModContainer from '@/components/server/hytalemods/ModContainer';
import HytaleWorldContainer from '@/components/server/hytaleworlds/WorldContainer';
import HytalePrefabsContainer from '@/components/server/hytaleprefabs/PrefabsContainer';
import HytaleSettingsContainer from '@/components/server/hytalegamesettings/HytaleSettingsContainer';
import HytalePlayerManagerContainer from '@/components/server/hytale-players/HytalePlayerManagerContainer';
import ServerImporterContainer from '@/components/server/serverimporter/ServerImporterContainer';
import GameConfigContainer from '@/components/server/game-config/GameConfigContainer';

// Each of the router files is already code split out appropriately — so
// all of the items above will only be loaded in when that router is loaded.
//
// These specific lazy loaded routes are to avoid loading in heavy screens
// for the server dashboard when they're only needed for specific instances.
const FileEditContainer = lazy(() => import('@/components/server/files/FileEditContainer'));
const ScheduleEditContainer = lazy(() => import('@/components/server/schedules/ScheduleEditContainer'));

interface RouteDefinition {
    path: string;
    // If undefined is passed this route is still rendered into the router itself
    // but no navigation link is displayed in the sub-navigation menu.
    name: string | undefined;
    component: React.ComponentType;
    exact?: boolean;
}

interface ServerRouteDefinition extends RouteDefinition {
    permission: string | string[] | null;
    eggIds?: number[];
}

interface Routes {
    // All of the routes available under "/account"
    account: RouteDefinition[];
    // All of the routes available under "/server/:id"
    server: ServerRouteDefinition[];
}

export default {
    account: [
        {
            path: '/',
            name: 'Account',
            component: AccountOverviewContainer,
            exact: true,
        },
        {
            path: '/api',
            name: 'API Credentials',
            component: AccountApiContainer,
        },
        {
            path: '/ssh',
            name: 'SSH Keys',
            component: AccountSSHContainer,
        },
        {
            path: '/activity',
            name: 'Activity',
            component: ActivityLogContainer,
        },
    ],
    server: [
        {
            path: '/',
            permission: null,
            name: 'Console',
            component: ServerConsole,
            exact: true,
        },
        {
            path: '/files',
            permission: 'file.*',
            name: 'Files',
            component: FileManagerContainer,
        },
        {
            path: '/files/:action(edit|new)',
            permission: 'file.*',
            name: undefined,
            component: FileEditContainer,
        },
        {
            path: '/databases',
            permission: 'database.*',
            name: 'Databases',
            component: DatabasesContainer,
        },
        {
            path: '/schedules',
            permission: 'schedule.*',
            name: 'Schedules',
            component: ScheduleContainer,
        },
        {
            path: '/schedules/:id',
            permission: 'schedule.*',
            name: undefined,
            component: ScheduleEditContainer,
        },
        {
            path: '/users',
            permission: 'user.*',
            name: 'Users',
            component: UsersContainer,
        },
        {
            path: '/backups',
            permission: 'backup.*',
            name: 'Backups',
            component: BackupContainer,
        },
        {
            path: '/network',
            permission: 'allocation.*',
            name: 'Network',
            component: NetworkContainer,
        },
        {
            path: '/subdomain',
            permission: 'subdomain.*',
            name: 'Subdomain',
            component: SubdomainContainer,
        },
        {
            path: '/startup',
            permission: 'startup.*',
            name: 'Startup',
            component: StartupContainer,
        },
        {
            path: '/settings',
            permission: ['settings.*', 'file.sftp'],
            name: 'Settings',
            component: SettingsContainer,
        },
        {
            path: '/activity',
            permission: 'activity.*',
            name: 'Activity',
            component: ServerActivityLogContainer,
        },
        {
            path: '/mods',
            permission: 'file.*',
            name: 'Mods',
            component: ModContainer,
        },
        {
            path: '/hytale/mods',
            permission: 'file.*',
            name: 'Hytale Mods',
            component: HytaleModContainer,
        },
        {
            path: '/hytale/worlds',
            permission: 'file.*',
            name: 'Hytale Worlds',
            component: HytaleWorldContainer,
        },
        {
            path: '/hytale/prefabs',
            permission: 'file.*',
            name: 'Hytale Prefabs',
            component: HytalePrefabsContainer,
        },
        {
            path: '/hytale/game-settings',
            permission: 'file.*',
            name: 'Game Settings',
            component: HytaleSettingsContainer,
        },
        {
            path: '/hytale/players',
            permission: 'file.*',
            name: 'Hytale Players',
            component: HytalePlayerManagerContainer,
        },
        {
            path: '/modpacks',
            permission: 'file.*',
            name: 'Modpacks',
            component: ModpacksContainer,
        },
        {
            path: '/minecraft-plugins',
            permission: 'file.*',
            name: 'Plugins',
            component: MinecraftPluginContainer,
        },
        {
            path: '/minecraft-plugins/installed',
            permission: 'file.*',
            name: undefined,
            component: MinecraftInstalledPluginsContainer,

        },
        {
            path: '/importer',
            name: 'Importer',
            permission: 'file.delete',
            component: ServerImporterContainer,
        },
        {
            path: '/game-config',
            permission: 'file.*',
            name: 'Game Config',
            component: GameConfigContainer,
        },
    ],
} as Routes;

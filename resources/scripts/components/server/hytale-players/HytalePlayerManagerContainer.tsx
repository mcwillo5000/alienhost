import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import useSWR from 'swr';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog/index';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faCog,
    faCopy,
    faCrown,
    faEdit,
    faExclamationTriangle,
    faInfoCircle,
    faPlus,
    faPuzzlePiece,
    faSearch,
    faShieldAlt,
    faTimes,
    faTrash,
    faUserCheck,
    faUserPlus,
    faUserShield,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import Label from '@/components/elements/Label';
import { Input } from '@/components/elements/inputs/index';
import Select from '@/components/elements/Select';
import {
    getHytaleData,
    createGroup,
    updateGroup,
    deleteGroup,
    addPlayerToGroup,
    removePlayerFromGroup,
    toggleWhitelist,
    addToWhitelist,
    removeFromWhitelist,
    addBan,
    removeBan,
    HytalePlayerData,
    BanEntry,
    lookupHytalePlayer,
    getHytaleAvatarUrl,
    HytalePlayerInfo,
    getRegisteredPlayers,
    deleteRegisteredPlayer,
    changePlayerGamemode,
    RegisteredPlayer,
} from '@/api/server/hytale-players/hytalePlayerManager';
import HytalePermissionSelector from './HytalePermissionSelector';
import { HYTALE_PERMISSIONS } from '@/api/server/hytale-players/HytalePermissions';
type TabType = 'players' | 'permissions' | 'whitelist' | 'bans';
const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};
const getGroupIcon = (groupName: string) => {
    if (groupName === 'Default') return faCog;
    if (groupName === 'OP') return faCrown;
    return faPuzzlePiece;
};
interface PlayerDisplayProps {
    playerUuid: string;
    playerInfo: HytalePlayerInfo | null | undefined;
    size?: number;
    showUuid?: boolean;
}
const CONSOLE_UUID = '00000000-0000-0000-0000-000000000000';
function PlayerDisplay({ playerUuid, playerInfo, size = 32, showUuid = true }: PlayerDisplayProps) {
    const isConsole = playerUuid === CONSOLE_UUID;
    const avatarUrl = getHytaleAvatarUrl(playerInfo?.id || playerUuid, size);
    const username = playerInfo?.username;
    const displayUuid = playerInfo?.id || playerUuid;
    const displayName = username || playerUuid;
    if (isConsole) {
        return (
            <div className={'flex items-center gap-2'}>
                <div
                    className={'rounded flex items-center justify-center'}
                    style={{ width: size, height: size, backgroundColor: 'var(--theme-background-secondary)', color: 'var(--theme-text-muted)' }}
                >
                    <FontAwesomeIcon icon={faUserShield} />
                </div>
                <span className={'font-medium'} style={{ color: 'var(--theme-text-base)' }}>Console</span>
            </div>
        );
    }
    return (
        <div className={'flex items-center gap-2'}>
            <img
                src={avatarUrl}
                alt={displayName}
                className={'rounded'}
                style={{ width: size, height: size }}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
            <div className={'flex flex-col'}>
                <span className={'font-medium'} style={{ color: 'var(--theme-text-base)' }}>{displayName}</span>
                {showUuid && displayUuid !== displayName && (
                    <code className={'font-mono text-xs break-all'} style={{ color: 'var(--theme-text-muted)' }}>
                        {displayUuid}
                    </code>
                )}
            </div>
        </div>
    );
}
export default function HytalePlayerManagerContainer() {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('players');
    const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
    const [playersLoading, setPlayersLoading] = useState(false);
    const [deletePlayerModalVisible, setDeletePlayerModalVisible] = useState(false);
    const [selectedPlayerToDelete, setSelectedPlayerToDelete] = useState<RegisteredPlayer | null>(null);
    const [playersSearchQuery, setPlayersSearchQuery] = useState('');
    const [playerDetailModalVisible, setPlayerDetailModalVisible] = useState(false);
    const [selectedPlayerDetail, setSelectedPlayerDetail] = useState<RegisteredPlayer | null>(null);
    const [editingGamemode, setEditingGamemode] = useState<string>('');
    const [newGroupModalVisible, setNewGroupModalVisible] = useState(false);
    const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
    const [deleteGroupModalVisible, setDeleteGroupModalVisible] = useState(false);
    const [addPlayerToGroupModalVisible, setAddPlayerToGroupModalVisible] = useState(false);
    const [newWhitelistModalVisible, setNewWhitelistModalVisible] = useState(false);
    const [newBanModalVisible, setNewBanModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [groupName, setGroupName] = useState('');
    const [groupPermissions, setGroupPermissions] = useState<string[]>([]);
    const [grantAllPermission, setGrantAllPermission] = useState(false);
    const [playerUuid, setPlayerUuid] = useState('');
    const [banReason, setBanReason] = useState('');
    const isValidUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const [playerInfoCache, setPlayerInfoCache] = useState<Record<string, HytalePlayerInfo | null>>({});
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult, setLookupResult] = useState<HytalePlayerInfo | null>(null);
    useEffect(() => {
        clearFlashes('hytale:players');
    }, [activeTab]);
    const handlePlayerLookup = async (query: string) => {
        if (!query.trim() || query.length < 3) {
            setLookupResult(null);
            return;
        }
        setLookupLoading(true);
        try {
            const result = await lookupHytalePlayer(query.trim());
            setLookupResult(result);
            if (result) {
                setPlayerInfoCache((prev) => ({ ...prev, [result.id]: result, [result.raw_id]: result }));
            }
        } catch (error) {
            console.error('Player lookup failed:', error);
            setLookupResult(null);
        } finally {
            setLookupLoading(false);
        }
    };
    const fetchPlayerInfo = async (playerUuid: string) => {
        if (playerInfoCache[playerUuid] !== undefined) return;
        try {
            const result = await lookupHytalePlayer(playerUuid);
            setPlayerInfoCache((prev) => ({ ...prev, [playerUuid]: result }));
        } catch (error) {
            setPlayerInfoCache((prev) => ({ ...prev, [playerUuid]: null }));
        }
    };
    const { data, mutate } = useSWR<HytalePlayerData>(
        ['hytale-players', uuid],
        () => getHytaleData(uuid),
        { refreshInterval: 30000 }
    );
    useEffect(() => {
        if (!data) return;
        const allPlayerUuids = new Set<string>();
        if (data.permissions?.users) {
            Object.keys(data.permissions.users).forEach((pUuid) => allPlayerUuids.add(pUuid));
        }
        if (data.whitelist?.list) {
            data.whitelist.list.forEach((pUuid) => allPlayerUuids.add(pUuid));
        }
        if (data.bans) {
            data.bans.forEach((ban) => {
                allPlayerUuids.add(ban.target);
                if (ban.by) allPlayerUuids.add(ban.by);
            });
        }
        allPlayerUuids.forEach((pUuid) => {
            if (playerInfoCache[pUuid] === undefined) {
                fetchPlayerInfo(pUuid);
            }
        });
    }, [data]);
    const loadRegisteredPlayers = async () => {
        setPlayersLoading(true);
        try {
            const players = await getRegisteredPlayers(uuid);
            setRegisteredPlayers(players);
        } catch (error) {
            console.error('Failed to load registered players:', error);
            clearAndAddHttpError({ key: 'hytale:players', error });
        } finally {
            setPlayersLoading(false);
        }
    };
    useEffect(() => {
        if (activeTab === 'players') {
            loadRegisteredPlayers();
        }
    }, [activeTab]);
    const handleDeletePlayer = async () => {
        if (!selectedPlayerToDelete) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            await deleteRegisteredPlayer(uuid, selectedPlayerToDelete.uuid);
            setRegisteredPlayers((prev) => prev.filter((p) => p.uuid !== selectedPlayerToDelete.uuid));
            setDeletePlayerModalVisible(false);
            setSelectedPlayerToDelete(null);
        } catch (error) {
            clearAndAddHttpError({ key: 'hytale:players', error });
        } finally {
            setIsLoading(false);
        }
    };
    const filteredRegisteredPlayers = registeredPlayers.filter((player) => {
        if (!playersSearchQuery.trim()) return true;
        const query = playersSearchQuery.toLowerCase();
        return (
            player.username.toLowerCase().includes(query) ||
            player.uuid.toLowerCase().includes(query) ||
            player.world.toLowerCase().includes(query) ||
            player.gamemode.toLowerCase().includes(query)
        );
    });
    if (!data) {
        return (
            <ServerContentBlock title={'Hytale Players'}>
                <Spinner size={'large'} centered />
            </ServerContentBlock>
        );
    }
    const permissions = data.permissions || { users: {}, groups: {} };
    const groups = permissions.groups || {};
    const users = permissions.users || {};
    const whitelist = data.whitelist || { enabled: false, list: [] };
    const bans = data.bans || [];
    const handleCreateGroup = async () => {
        if (isLoading || !groupName.trim()) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const permsToSend = grantAllPermission ? ['*'] : groupPermissions;
            const newData = await createGroup(uuid, groupName.trim(), permsToSend);
            await mutate({ ...data, permissions: newData }, false);
            setGroupName('');
            setGroupPermissions([]);
            setGrantAllPermission(false);
            setNewGroupModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleUpdateGroup = async () => {
        if (isLoading || !selectedGroup) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const permsToSend = grantAllPermission ? ['*'] : groupPermissions;
            const newData = await updateGroup(uuid, selectedGroup, permsToSend);
            await mutate({ ...data, permissions: newData }, false);
            setSelectedGroup('');
            setGroupPermissions([]);
            setGrantAllPermission(false);
            setEditGroupModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeleteGroup = async () => {
        if (isLoading || !selectedGroup) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const newData = await deleteGroup(uuid, selectedGroup);
            await mutate({ ...data, permissions: newData }, false);
            setSelectedGroup('');
            setDeleteGroupModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const resolvePlayerUuid = async (input: string): Promise<string | null> => {
        const trimmed = input.trim();
        if (isValidUuid(trimmed)) {
            return trimmed;
        }
        try {
            const result = await lookupHytalePlayer(trimmed);
            if (result?.id) {
                setPlayerInfoCache((prev) => ({ ...prev, [result.id]: result }));
                return result.id;
            }
        } catch (error) {
            console.error('Failed to resolve player UUID:', error);
        }
        return null;
    };
    const handleAddPlayerToGroup = async () => {
        if (isLoading || !playerUuid.trim() || !selectedGroup) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const resolvedUuid = await resolvePlayerUuid(playerUuid);
            if (!resolvedUuid) {
                clearAndAddHttpError({ error: new Error('Player not found'), key: 'hytale:players' });
                return;
            }
            const newData = await addPlayerToGroup(uuid, resolvedUuid, selectedGroup);
            await mutate({ ...data, permissions: newData }, false);
            setPlayerUuid('');
            setAddPlayerToGroupModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleRemovePlayerFromGroup = async (pUuid: string, group: string) => {
        if (isLoading) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const newData = await removePlayerFromGroup(uuid, pUuid, group);
            await mutate({ ...data, permissions: newData }, false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleChangePlayerGroup = async (pUuid: string, oldGroups: string[], currentSelectedGroup: string, newGroup: string) => {
        if (isLoading || !newGroup || currentSelectedGroup === newGroup) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            let newData = data.permissions;
            if (currentSelectedGroup) {
                newData = await removePlayerFromGroup(uuid, pUuid, currentSelectedGroup);
            }
            newData = await addPlayerToGroup(uuid, pUuid, newGroup);
            await mutate({ ...data, permissions: newData }, false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleToggleWhitelist = async () => {
        if (isLoading) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const newData = await toggleWhitelist(uuid, !data.whitelist.enabled);
            await mutate({ ...data, whitelist: newData }, false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleAddToWhitelist = async () => {
        if (isLoading || !playerUuid.trim()) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const resolvedUuid = await resolvePlayerUuid(playerUuid);
            if (!resolvedUuid) {
                clearAndAddHttpError({ error: new Error('Player not found'), key: 'hytale:players' });
                return;
            }
            const newData = await addToWhitelist(uuid, resolvedUuid);
            await mutate({ ...data, whitelist: newData }, false);
            setPlayerUuid('');
            setNewWhitelistModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleRemoveFromWhitelist = async (pUuid: string) => {
        if (isLoading) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const newData = await removeFromWhitelist(uuid, pUuid);
            await mutate({ ...data, whitelist: newData }, false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleAddBan = async () => {
        if (isLoading || !playerUuid.trim() || !banReason.trim()) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const resolvedUuid = await resolvePlayerUuid(playerUuid);
            if (!resolvedUuid) {
                clearAndAddHttpError({ error: new Error('Player not found'), key: 'hytale:players' });
                return;
            }
            const newData = await addBan(uuid, resolvedUuid, banReason.trim());
            await mutate({ ...data, bans: newData }, false);
            setPlayerUuid('');
            setBanReason('');
            setNewBanModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleRemoveBan = async (pUuid: string) => {
        if (isLoading) return;
        setIsLoading(true);
        clearFlashes('hytale:players');
        try {
            const newData = await removeBan(uuid, pUuid);
            await mutate({ ...data, bans: newData }, false);
        } catch (error) {
            clearAndAddHttpError({ error, key: 'hytale:players' });
        } finally {
            setIsLoading(false);
        }
    };
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };
    const shortenUuid = (uuid: string) => {
        return uuid.length > 12 ? `${uuid.substring(0, 8)}...` : uuid;
    };
    return (
        <ServerContentBlock title={'Hytale Players'}>
            {/* Create Group Modal */}
            <Dialog
                open={newGroupModalVisible}
                onClose={() => setNewGroupModalVisible(false)}
                title={'Create Permission Group'}
            >
                <form
                    id={'create-group-form'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateGroup();
                    }}
                >
                    <Label>Group Name</Label>
                    <Input.Text
                        placeholder={'Admin'}
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className={'mb-4'}
                    />
                    <Label>Permissions</Label>
                    <HytalePermissionSelector
                        selectedPermissions={groupPermissions}
                        onChange={setGroupPermissions}
                        disabled={isLoading}
                        grantAllPermission={grantAllPermission}
                        onGrantAllChange={setGrantAllPermission}
                    />
                    <Dialog.Footer>
                        <Button.Text onClick={() => setNewGroupModalVisible(false)}>Cancel</Button.Text>
                        <Button disabled={isLoading || !groupName.trim()} type={'submit'} form={'create-group-form'}>
                            Create Group
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog>
            {/* Edit Group Modal */}
            <Dialog
                open={editGroupModalVisible}
                onClose={() => setEditGroupModalVisible(false)}
                title={`Edit Group: ${selectedGroup}`}
            >
                <form
                    id={'edit-group-form'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdateGroup();
                    }}
                >
                    <Label>
                        {grantAllPermission
                            ? 'All permissions granted (*)'
                            : `${groupPermissions.length} of ${HYTALE_PERMISSIONS.length} permissions selected`
                        }
                    </Label>
                    <HytalePermissionSelector
                        selectedPermissions={groupPermissions}
                        onChange={setGroupPermissions}
                        disabled={isLoading}
                        grantAllPermission={grantAllPermission}
                        onGrantAllChange={setGrantAllPermission}
                    />
                    <Dialog.Footer>
                        <Button.Text onClick={() => setEditGroupModalVisible(false)}>Cancel</Button.Text>
                        <Button disabled={isLoading} type={'submit'} form={'edit-group-form'}>
                            Save Changes
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog>
            {/* Delete Player Confirmation */}
            <Dialog.Confirm
                open={deletePlayerModalVisible}
                onClose={() => {
                    setDeletePlayerModalVisible(false);
                    setSelectedPlayerToDelete(null);
                }}
                onConfirmed={handleDeletePlayer}
                title={'Delete Player'}
                confirm={'Delete'}
            >
                <div className={'p-4 rounded-md bg-red-600/20 border border-red-600 mb-4'}>
                    <div className={'flex items-center'}>
                        <FontAwesomeIcon icon={faExclamationTriangle} className={'mr-2'} />
                        <span className={'font-semibold'}>Warning</span>
                    </div>
                    <p className={'mt-2 text-sm'}>
                        This will permanently delete the player data file for <strong>{selectedPlayerToDelete?.username}</strong>.
                        This action cannot be undone.
                    </p>
                </div>
            </Dialog.Confirm>
            {/* Player Detail Modal */}
            <Dialog
                open={playerDetailModalVisible}
                onClose={() => {
                    setPlayerDetailModalVisible(false);
                    setSelectedPlayerDetail(null);
                }}
            >
                {selectedPlayerDetail && (
                    <div className={'flex flex-col'}>
                        {/* Custom Title with Avatar */}
                        <div className={'flex items-center gap-3 mb-4 -mt-2'}>
                            <img
                                src={getHytaleAvatarUrl(selectedPlayerDetail.uuid, 32)}
                                alt={selectedPlayerDetail.username}
                                className={'w-8 h-8 rounded'}
                            />
                            <div className={'flex-1'}>
                                <span className={'text-xl'} style={{ color: 'var(--theme-text-base)' }}>{selectedPlayerDetail.username}</span>
                                <p style={{ color: 'var(--theme-text-muted)' }}>{selectedPlayerDetail.uuid}</p>
                            </div>
                        </div>
                        {/* Main Layout: Body Left, Details Right */}
                        <div className={'flex gap-3'}>
                            {/* Left: Player Body */}
                            <div className={'flex items-center justify-center rounded-lg px-8 py-4 self-stretch min-w-[140px]'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                <img
                                    src={`https://crafthead.net/hytale/body/${selectedPlayerDetail.uuid}`}
                                    alt={selectedPlayerDetail.username}
                                    className={'w-28 h-auto'}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = getHytaleAvatarUrl(selectedPlayerDetail.uuid, 128);
                                    }}
                                />
                            </div>
                            {/* Right: Details Grid */}
                            <div className={'flex-1 grid grid-cols-2 gap-3'}>
                                {/* UUID */}
                                <div className={'col-span-2 rounded-lg p-3'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                    <div className={'flex items-center gap-2 text-sm mb-1'} style={{ color: 'var(--theme-text-muted)' }}>
                                        <FontAwesomeIcon icon={faInfoCircle} className={'text-xs'} />
                                        <span>UUID</span>
                                    </div>
                                    <div className={'flex items-center justify-between'}>
                                        <code className={'text-xs font-mono truncate mr-2'} style={{ color: 'var(--theme-text-base)' }}>{selectedPlayerDetail.uuid}</code>
                                        <Button.Text
                                            className={'!p-1'}
                                            onClick={() => copyToClipboard(selectedPlayerDetail.uuid)}
                                            title={'Copy UUID'}
                                        >
                                            <FontAwesomeIcon icon={faCopy} className={'text-xs'} />
                                        </Button.Text>
                                    </div>
                                </div>
                                {/* Gamemode */}
                                <div className={'rounded-lg p-3'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                    <div className={'flex items-center gap-2 text-sm mb-1'} style={{ color: 'var(--theme-text-muted)' }}>
                                        <FontAwesomeIcon icon={faUsers} className={'text-xs'} />
                                        <span>Gamemode</span>
                                    </div>
                                    <Select
                                        value={editingGamemode}
                                        onChange={(e) => setEditingGamemode(e.target.value)}
                                        className={'!py-1 !px-2 !text-sm'}
                                        style={{ backgroundColor: 'var(--theme-background-secondary)', borderColor: 'var(--theme-border)' }}
                                    >
                                        <option value={'Adventure'}>Adventure</option>
                                        <option value={'Creative'}>Creative</option>
                                    </Select>
                                </div>
                                {/* World */}
                                <div className={'rounded-lg p-3'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                    <div className={'flex items-center gap-2 text-sm mb-1'} style={{ color: 'var(--theme-text-muted)' }}>
                                        <FontAwesomeIcon icon={faSearch} className={'text-xs'} />
                                        <span>World</span>
                                    </div>
                                    <div className={'flex items-center justify-between'}>
                                        <span className={'text-sm'} style={{ color: 'var(--theme-text-base)' }}>{selectedPlayerDetail.world || '—'}</span>
                                        {selectedPlayerDetail.world && (
                                            <Button.Text
                                                className={'!p-1'}
                                                onClick={() => copyToClipboard(selectedPlayerDetail.world)}
                                                title={'Copy world'}
                                            >
                                                <FontAwesomeIcon icon={faCopy} className={'text-xs'} />
                                            </Button.Text>
                                        )}
                                    </div>
                                </div>
                                {/* Username */}
                                <div className={'rounded-lg p-3'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                    <div className={'flex items-center gap-2 text-sm mb-1'} style={{ color: 'var(--theme-text-muted)' }}>
                                        <FontAwesomeIcon icon={faUsers} className={'text-xs'} />
                                        <span>Username</span>
                                    </div>
                                    <div className={'flex items-center justify-between'}>
                                        <span className={'text-sm'} style={{ color: 'var(--theme-text-base)' }}>{selectedPlayerDetail.username}</span>
                                        <Button.Text
                                            className={'!p-1'}
                                            onClick={() => copyToClipboard(selectedPlayerDetail.username)}
                                            title={'Copy username'}
                                        >
                                            <FontAwesomeIcon icon={faCopy} className={'text-xs'} />
                                        </Button.Text>
                                    </div>
                                </div>
                                {/* Position */}
                                <div className={'rounded-lg p-3'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                    <div className={'flex items-center gap-2 text-sm mb-1'} style={{ color: 'var(--theme-text-muted)' }}>
                                        <FontAwesomeIcon icon={faSearch} className={'text-xs'} />
                                        <span>Position</span>
                                    </div>
                                    <div className={'flex items-center justify-between'}>
                                        <code className={'font-mono text-sm'} style={{ color: 'var(--theme-text-base)' }}>
                                            {selectedPlayerDetail.position
                                                ? `${Math.round(selectedPlayerDetail.position.x)} ${Math.round(selectedPlayerDetail.position.y)} ${Math.round(selectedPlayerDetail.position.z)}`
                                                : '0 0 0'
                                            }
                                        </code>
                                        <Button.Text
                                            className={'!p-1'}
                                            onClick={() => {
                                                const pos = selectedPlayerDetail.position;
                                                copyToClipboard(pos ? `${Math.round(pos.x)} ${Math.round(pos.y)} ${Math.round(pos.z)}` : '0 0 0');
                                            }}
                                            title={'Copy position'}
                                        >
                                            <FontAwesomeIcon icon={faCopy} className={'text-xs'} />
                                        </Button.Text>
                                    </div>
                                </div>
                                {/* Stats Row */}
                                <div className={'col-span-2 grid grid-cols-4 gap-2'}>
                                    {/* Health */}
                                    <div className={'rounded-lg p-2 text-center'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                        <div className={'text-red-400 text-base font-bold'}>
                                            {selectedPlayerDetail.stats?.health ?? 100}
                                        </div>
                                        <div className={'text-[10px]'} style={{ color: 'var(--theme-text-muted)' }}>Health</div>
                                    </div>
                                    {/* Oxygen */}
                                    <div className={'rounded-lg p-2 text-center'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                        <div className={'text-cyan-400 text-base font-bold'}>
                                            {selectedPlayerDetail.stats?.oxygen ?? 100}
                                        </div>
                                        <div className={'text-[10px]'} style={{ color: 'var(--theme-text-muted)' }}>Oxygen</div>
                                    </div>
                                    {/* Mana */}
                                    <div className={'rounded-lg p-2 text-center'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                        <div className={'text-blue-400 text-base font-bold'}>
                                            {selectedPlayerDetail.stats?.mana ?? 0}
                                        </div>
                                        <div className={'text-[10px]'} style={{ color: 'var(--theme-text-muted)' }}>Mana</div>
                                    </div>
                                    {/* Stamina */}
                                    <div className={'rounded-lg p-2 text-center'} style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                                        <div className={'text-yellow-400 text-base font-bold'}>
                                            {selectedPlayerDetail.stats?.stamina ?? 10}
                                        </div>
                                        <div className={'text-[10px]'} style={{ color: 'var(--theme-text-muted)' }}>Stamina</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Dialog.Footer>
                            <Button.Text onClick={() => {
                                setPlayerDetailModalVisible(false);
                                setSelectedPlayerDetail(null);
                            }}>Close</Button.Text>
                            <Button
                                disabled={isLoading || editingGamemode === selectedPlayerDetail.gamemode}
                                onClick={async () => {
                                    if (editingGamemode === selectedPlayerDetail.gamemode) return;
                                    setIsLoading(true);
                                    try {
                                        await changePlayerGamemode(uuid, selectedPlayerDetail.uuid, selectedPlayerDetail.username, editingGamemode);
                                        const updatedPlayers = await getRegisteredPlayers(uuid);
                                        setRegisteredPlayers(updatedPlayers);
                                        setPlayerDetailModalVisible(false);
                                        setSelectedPlayerDetail(null);
                                    } catch (error) {
                                        clearAndAddHttpError({ error, key: 'hytale:players' });
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                            >
                                Save Changes
                            </Button>
                        </Dialog.Footer>
                    </div>
                )}
            </Dialog>
            {/* Delete Group Confirmation */}
            <Dialog.Confirm
                open={deleteGroupModalVisible}
                onClose={() => setDeleteGroupModalVisible(false)}
                onConfirmed={handleDeleteGroup}
                title={'Delete Group'}
                confirm={'Delete'}
            >
                <div className={'p-4 rounded-md bg-red-600/20 border border-red-600 mb-4'}>
                    <div className={'flex items-center'}>
                        <FontAwesomeIcon icon={faExclamationTriangle} className={'mr-2'} />
                        <span className={'font-semibold'}>Warning</span>
                    </div>
                    <p className={'mt-2 text-sm'}>
                        This action cannot be undone. All players assigned to this group will lose their permissions.
                    </p>
                </div>
                <p>
                    Are you sure you want to delete the group <strong>{selectedGroup}</strong>?
                </p>
            </Dialog.Confirm>
            {/* Add Player to Group Modal */}
            <Dialog
                open={addPlayerToGroupModalVisible}
                onClose={() => {
                    setAddPlayerToGroupModalVisible(false);
                    setLookupResult(null);
                }}
                title={'Add Player to Group'}
            >
                <form
                    id={'add-player-to-group-form'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddPlayerToGroup();
                    }}
                >
                    <Label>Group</Label>
                    <Select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className={'mb-4'}
                    >
                        {Object.keys(groups).map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                    <Label>Player Username or UUID</Label>
                    <div className={'flex gap-2'}>
                        <Input.Text
                            className={'flex-1'}
                            placeholder={'Username or UUID'}
                            value={playerUuid}
                            onChange={(e) => setPlayerUuid(e.target.value)}
                        />
                        <Button.Text
                            type={'button'}
                            disabled={lookupLoading || !playerUuid.trim()}
                            onClick={() => handlePlayerLookup(playerUuid)}
                        >
                            {lookupLoading ? <Spinner size={'small'} /> : 'Lookup'}
                        </Button.Text>
                    </div>
                    {lookupResult && (
                        <div className={'mt-3 p-3 rounded-md'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                            <div className={'flex items-center gap-3'}>
                                <img
                                    src={getHytaleAvatarUrl(lookupResult.id, 48)}
                                    alt={lookupResult.username}
                                    className={'rounded'}
                                    style={{ width: 48, height: 48 }}
                                />
                                <div>
                                    <div className={'font-semibold'} style={{ color: 'var(--theme-text-base)' }}>{lookupResult.username}</div>
                                    <code className={'text-xs'} style={{ color: 'var(--theme-text-muted)' }}>{lookupResult.id}</code>
                                </div>
                            </div>
                            <Button.Text
                                type={'button'}
                                className={'mt-2 w-full'}
                                onClick={() => setPlayerUuid(lookupResult.id)}
                            >
                                Use this player
                            </Button.Text>
                        </div>
                    )}
                    <Dialog.Footer>
                        <Button.Text onClick={() => {
                            setAddPlayerToGroupModalVisible(false);
                            setLookupResult(null);
                        }}>Cancel</Button.Text>
                        <Button disabled={isLoading || !playerUuid.trim()} type={'submit'} form={'add-player-to-group-form'}>
                            Add Player
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog>
            {/* Add to Whitelist Modal */}
            <Dialog
                open={newWhitelistModalVisible}
                onClose={() => {
                    setNewWhitelistModalVisible(false);
                    setLookupResult(null);
                }}
                title={'Add to Whitelist'}
            >
                <form
                    id={'add-whitelist-form'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToWhitelist();
                    }}
                >
                    <Label>Player Username or UUID</Label>
                    <div className={'flex gap-2'}>
                        <Input.Text
                            className={'flex-1'}
                            placeholder={'Username or UUID'}
                            value={playerUuid}
                            onChange={(e) => setPlayerUuid(e.target.value)}
                        />
                        <Button.Text
                            type={'button'}
                            disabled={lookupLoading || !playerUuid.trim()}
                            onClick={() => handlePlayerLookup(playerUuid)}
                        >
                            {lookupLoading ? <Spinner size={'small'} /> : 'Lookup'}
                        </Button.Text>
                    </div>
                    {lookupResult && (
                        <div className={'mt-3 p-3 rounded-md'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                            <div className={'flex items-center gap-3'}>
                                <img
                                    src={getHytaleAvatarUrl(lookupResult.id, 48)}
                                    alt={lookupResult.username}
                                    className={'rounded'}
                                    style={{ width: 48, height: 48 }}
                                />
                                <div>
                                    <div className={'font-semibold'} style={{ color: 'var(--theme-text-base)' }}>{lookupResult.username}</div>
                                    <code className={'text-xs'} style={{ color: 'var(--theme-text-muted)' }}>{lookupResult.id}</code>
                                </div>
                            </div>
                            <Button.Text
                                type={'button'}
                                className={'mt-2 w-full'}
                                onClick={() => setPlayerUuid(lookupResult.id)}
                            >
                                Use this player
                            </Button.Text>
                        </div>
                    )}
                    <Dialog.Footer>
                        <Button.Text onClick={() => {
                            setNewWhitelistModalVisible(false);
                            setLookupResult(null);
                        }}>Cancel</Button.Text>
                        <Button disabled={isLoading || !playerUuid.trim()} type={'submit'} form={'add-whitelist-form'}>
                            Add to Whitelist
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog>
            {/* Add Ban Modal */}
            <Dialog
                open={newBanModalVisible}
                onClose={() => {
                    setNewBanModalVisible(false);
                    setLookupResult(null);
                }}
                title={'Ban Player'}
            >
                <form
                    id={'ban-player-form'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddBan();
                    }}
                >
                    <Label>Player Username or UUID</Label>
                    <div className={'flex gap-2 mb-4'}>
                        <Input.Text
                            className={'flex-1'}
                            placeholder={'Username or UUID'}
                            value={playerUuid}
                            onChange={(e) => setPlayerUuid(e.target.value)}
                        />
                        <Button.Text
                            type={'button'}
                            disabled={lookupLoading || !playerUuid.trim()}
                            onClick={() => handlePlayerLookup(playerUuid)}
                        >
                            {lookupLoading ? <Spinner size={'small'} /> : 'Lookup'}
                        </Button.Text>
                    </div>
                    {lookupResult && (
                        <div className={'mb-4 p-3 rounded-md'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                            <div className={'flex items-center gap-3'}>
                                <img
                                    src={getHytaleAvatarUrl(lookupResult.id, 48)}
                                    alt={lookupResult.username}
                                    className={'rounded'}
                                    style={{ width: 48, height: 48 }}
                                />
                                <div>
                                    <div className={'font-semibold'} style={{ color: 'var(--theme-text-base)' }}>{lookupResult.username}</div>
                                    <code className={'text-xs'} style={{ color: 'var(--theme-text-muted)' }}>{lookupResult.id}</code>
                                </div>
                            </div>
                            <Button.Text
                                type={'button'}
                                className={'mt-2 w-full'}
                                onClick={() => setPlayerUuid(lookupResult.id)}
                            >
                                Use this player
                            </Button.Text>
                        </div>
                    )}
                    <Label>Reason</Label>
                    <Input.Text
                        placeholder={'Cheating, Griefing, etc.'}
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                    />
                    <Dialog.Footer>
                        <Button.Text onClick={() => {
                            setNewBanModalVisible(false);
                            setLookupResult(null);
                        }}>Cancel</Button.Text>
                        <Button.Danger disabled={isLoading || !playerUuid.trim() || !banReason.trim()} type={'submit'} form={'ban-player-form'}>
                            Ban Player
                        </Button.Danger>
                    </Dialog.Footer>
                </form>
            </Dialog>
            <FlashMessageRender byKey={'hytale:players'} className={'mb-4'} />
            {/* Tab Navigation */}
            <div className={'flex flex-col w-full'}>
                <div className={'mb-4 flex flex-col md:flex-row md:justify-between justify-center md:items-center content-between w-full'}>
                    <h1 className={'text-2xl font-medium'}>Hytale Player Manager</h1>
                    <div className={'flex flex-row gap-2 mt-2 md:mt-0'}>
                        <Button.Text
                            disabled={activeTab === 'players'}
                            onClick={() => setActiveTab('players')}
                        >
                            <FontAwesomeIcon icon={faUsers} className={'mr-2'} />
                            Players
                        </Button.Text>
                        <Button.Text
                            disabled={activeTab === 'permissions'}
                            onClick={() => setActiveTab('permissions')}
                        >
                            <FontAwesomeIcon icon={faShieldAlt} className={'mr-2'} />
                            Permissions
                        </Button.Text>
                        <Button.Text
                            disabled={activeTab === 'whitelist'}
                            onClick={() => setActiveTab('whitelist')}
                        >
                            <FontAwesomeIcon icon={faUserCheck} className={'mr-2'} />
                            Allowlist
                        </Button.Text>
                        <Button.Text
                            disabled={activeTab === 'bans'}
                            onClick={() => setActiveTab('bans')}
                        >
                            <FontAwesomeIcon icon={faBan} className={'mr-2'} />
                            Banned
                        </Button.Text>
                    </div>
                </div>
                {/* Players Tab */}
                {activeTab === 'players' && (
                    <div>
                        {/* Players Table */}
                        <div className={'rounded-lg overflow-hidden shadow-lg'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                            {/* Header with Search */}
                            <div className={'p-4 flex items-center gap-4'} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                <div className={'flex items-center flex-shrink-0'}>
                                    <FontAwesomeIcon icon={faUsers} className={'mr-2'} style={{ color: 'var(--theme-text-base)' }} />
                                    <span className={'font-semibold'} style={{ color: 'var(--theme-text-base)' }}>Players</span>
                                </div>
                                {/* Search Input - Center */}
                                <div className={'flex-1 relative max-w-md mx-auto'}>
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className={'absolute left-3 top-1/2 transform -translate-y-1/2'}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                    />
                                    <input
                                        type={'text'}
                                        placeholder={'Search players...'}
                                        value={playersSearchQuery}
                                        onChange={(e) => setPlayersSearchQuery(e.target.value)}
                                        className={'w-full py-2 px-3 pl-9 rounded-md text-sm focus:outline-none transition-colors'}
                                        style={{ backgroundColor: 'var(--theme-background-primary)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-base)' }}
                                    />
                                </div>
                                <span className={'text-sm flex-shrink-0'} style={{ color: 'var(--theme-text-muted)' }}>
                                    {filteredRegisteredPlayers.length} players
                                </span>
                            </div>
                            {playersLoading ? (
                                <div className={'p-8'} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                                    <Spinner size={'large'} centered />
                                </div>
                            ) : filteredRegisteredPlayers.length === 0 ? (
                                <div className={'p-8 text-center'} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                                    {playersSearchQuery ? 'No players found matching your search.' : 'No registered players found.'}
                                </div>
                            ) : (
                                <div className={'overflow-x-auto'}>
                                    <table className={'w-full table-fixed'}>
                                        <thead>
                                            <tr className={'text-left text-xs uppercase tracking-wider'} style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)', color: 'var(--theme-text-muted)' }}>
                                                <th className={'py-3 px-4 font-medium w-[280px]'}>Player</th>
                                                <th className={'py-3 px-4 font-medium w-[140px]'}>Position</th>
                                                <th className={'py-3 px-4 font-medium w-[100px]'}>World</th>
                                                <th className={'py-3 px-4 font-medium w-[100px]'}>Mode</th>
                                                <th className={'py-3 px-4 font-medium text-right w-[80px]'}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRegisteredPlayers.map((player, index) => (
                                                <tr
                                                    key={player.uuid}
                                                    className={'transition-colors'}
                                                    style={{ borderTop: '1px solid var(--theme-border)', backgroundColor: index % 2 === 0 ? 'rgba(var(--theme-primary-rgb), 0.02)' : 'transparent' }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.06)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(var(--theme-primary-rgb), 0.02)' : 'transparent')}
                                                >
                                                    <td className={'py-3 px-4'}>
                                                        <div className={'flex items-center gap-3'}>
                                                            <img
                                                                src={getHytaleAvatarUrl(player.uuid, 32)}
                                                                alt={player.username}
                                                                className={'rounded-md w-8 h-8'}
                                                style={{ backgroundColor: 'var(--theme-background-secondary)' }}
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                            <div className={'flex flex-col min-w-0'}>
                                                                <div className={'flex items-center gap-1.5 flex-wrap'}>
                                                                    <span className={'font-medium truncate'} style={{ color: 'var(--theme-text-base)' }}>
                                                                        {player.username}
                                                                    </span>
                                                                    {/* OP Badge */}
                                                                    {(() => {
                                                                        const playerData = users[player.uuid];
                                                                        if (!playerData) return null;
                                                                        const playerGroups: string[] = Array.isArray(playerData)
                                                                            ? playerData
                                                                            : ((playerData as { groups?: string[] })?.groups || []);
                                                                        const hasOp = playerGroups.some((g: string) => groups[g]?.includes('*'));
                                                                        return hasOp ? (
                                                                            <span className={'px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}>
                                                                                OP
                                                                            </span>
                                                                        ) : null;
                                                                    })()}
                                                                    {/* Whitelist Badge */}
                                                                    {(whitelist.list || []).includes(player.uuid) && (
                                                                        <span className={'px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30'}>
                                                                            WL
                                                                        </span>
                                                                    )}
                                                                    {/* Ban Badge */}
                                                                    {bans.some((ban: BanEntry) => ban.target === player.uuid) && (
                                                                        <span className={'px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30'}>
                                                                            BAN
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <code className={'text-[11px] truncate'} style={{ color: 'var(--theme-text-muted)' }}>
                                                                    {player.uuid}
                                                                </code>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={'py-3 px-4'}>
                                                        {player.position ? (
                                                            <code className={'text-xs font-mono'} style={{ color: 'var(--theme-text-muted)' }}>
                                                                {Math.round(player.position.x)}, {Math.round(player.position.y)}, {Math.round(player.position.z)}
                                                            </code>
                                                        ) : (
                                                            <span style={{ color: 'var(--theme-text-muted)' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td className={'py-3 px-4'}>
                                                        <span className={'text-sm'} style={{ color: 'var(--theme-text-base)' }}>
                                                            {player.world || '—'}
                                                        </span>
                                                    </td>
                                                    <td className={'py-3 px-4'}>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${player.gamemode === 'Adventure' ? 'bg-emerald-500/15 text-emerald-400' :
                                                            player.gamemode === 'Creative' ? 'bg-sky-500/15 text-sky-400' :
                                                                'bg-neutral-500/20 text-neutral-300'
                                                            }`}>
                                                            {player.gamemode}
                                                        </span>
                                                    </td>
                                                    <td className={'py-3 px-4 text-right'}>
                                                        <div className={'flex items-center justify-end gap-2'}>
                                                            <Button.Text
                                                                className={'!p-1.5 !rounded'}
                                                                onClick={() => {
                                                                    setSelectedPlayerDetail(player);
                                                                    setEditingGamemode(player.gamemode || 'Adventure');
                                                                    setPlayerDetailModalVisible(true);
                                                                }}
                                                                title={'View Player Details'}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} className={'text-sm'} />
                                                            </Button.Text>
                                                            <Button.Danger
                                                                className={'!p-1.5 !rounded'}
                                                                onClick={() => {
                                                                    setSelectedPlayerToDelete(player);
                                                                    setDeletePlayerModalVisible(true);
                                                                }}
                                                                title={'Delete Player'}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className={'text-sm'} />
                                                            </Button.Danger>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Permissions Tab */}
                {activeTab === 'permissions' && (
                    <div className={'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                        {/* Left Side - Groups */}
                        <div>
                            <div className={'p-4 rounded-md mb-4'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                                <div className={'flex items-center justify-between'}>
                                    <div className={'flex items-center'}>
                                        <FontAwesomeIcon icon={faUserShield} className={'mr-2'} />
                                        <span className={'font-semibold text-lg'}>Permission Groups</span>
                                    </div>
                                    <Button
                                        className={'!py-1 !px-3'}
                                        onClick={() => {
                                            setGroupName('');
                                            setGroupPermissions([]);
                                            setGrantAllPermission(false);
                                            setNewGroupModalVisible(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className={'mr-2'} />
                                        New Group
                                    </Button>
                                </div>
                            </div>
                            <div className={'space-y-3'}>
                                {Object.entries(groups).map(([name, perms]) => (
                                    <div
                                        key={name}
                                        className={'rounded-md p-4 transition-all'}
                                        style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
                                    >
                                        <div className={'flex justify-between items-center'}>
                                            <div className={'flex items-center'}>
                                                <FontAwesomeIcon
                                                    icon={getGroupIcon(name)}
                                                    className={`mr-2 ${name === 'OP' ? 'text-yellow-400' : name === 'Default' ? 'text-neutral-400' : 'text-blue-400'}`}
                                                />
                                                <span className={'font-semibold text-lg'}>{name}</span>
                                                <span className={'ml-2 text-sm'} style={{ color: 'var(--theme-text-muted)' }}>
                                                    ({(perms || []).length} permission{(perms || []).length !== 1 ? 's' : ''})
                                                </span>
                                            </div>
                                            <div className={'flex gap-2'}>
                                                <Button.Text
                                                    className={'!p-2'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedGroup(name);
                                                        const hasAllPermission = (perms || []).includes('*');
                                                        setGrantAllPermission(hasAllPermission);
                                                        setGroupPermissions(hasAllPermission ? [] : (perms || []));
                                                        setEditGroupModalVisible(true);
                                                    }}
                                                    title={'Edit Group'}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Button.Text>
                                                <Button.Danger
                                                    className={'!p-2'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedGroup(name);
                                                        setDeleteGroupModalVisible(true);
                                                    }}
                                                    title={'Delete Group'}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button.Danger>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(groups).length === 0 && (
                                    <p className={'text-sm'} style={{ color: 'var(--theme-text-muted)' }}>No permission groups created yet.</p>
                                )}
                            </div>
                        </div>
                        {/* Right Side - Players */}
                        <div>
                            <div className={'p-4 rounded-md mb-4'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                                <div className={'flex items-center justify-between'}>
                                    <div className={'flex items-center'}>
                                        <FontAwesomeIcon icon={faUsers} className={'mr-2'} />
                                        <span className={'font-semibold text-lg'}>Players</span>
                                    </div>
                                    <Button
                                        className={'!py-1 !px-3'}
                                        disabled={Object.keys(groups).length === 0}
                                        onClick={() => {
                                            setSelectedGroup(Object.keys(groups)[0] || '');
                                            setPlayerUuid('');
                                            setLookupResult(null);
                                            setAddPlayerToGroupModalVisible(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} className={'mr-2'} />
                                        Add Player
                                    </Button>
                                </div>
                            </div>
                            {Object.keys(users).length === 0 ? (
                                <p className={'text-sm'} style={{ color: 'var(--theme-text-muted)' }}>No players have been assigned to any groups yet.</p>
                            ) : (
                                <div className={'space-y-2'}>
                                    {Object.entries(users).map(([pUuid, playerData]) => {
                                        const playerGroups: string[] = Array.isArray(playerData)
                                            ? playerData
                                            : ((playerData as { groups?: string[] })?.groups || []);
                                        return (
                                            <div
                                                key={pUuid}
                                                className={'rounded-md p-3 transition-all flex items-center justify-between gap-3'}
                                                style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
                                            >
                                                <div className={'flex-shrink-0'}>
                                                    <PlayerDisplay
                                                        playerUuid={pUuid}
                                                        playerInfo={playerInfoCache[pUuid]}
                                                        size={32}
                                                    />
                                                </div>
                                                <div className={'flex items-center gap-2 flex-1 justify-end'}>
                                                    <Select
                                                        value={playerGroups[0] || ''}
                                                        onChange={(e) => handleChangePlayerGroup(pUuid, playerGroups, playerGroups[0] || '', e.target.value)}
                                                        disabled={isLoading}
                                                        className={'!py-1 !px-2 min-w-[120px]'}
                                                    >
                                                        {Object.keys(groups).map((groupName) => (
                                                            <option key={groupName} value={groupName}>
                                                                {groupName}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                    <Button.Danger
                                                        className={'!p-2'}
                                                        disabled={isLoading}
                                                        onClick={() => {
                                                            playerGroups.forEach((group) => {
                                                                handleRemovePlayerFromGroup(pUuid, group);
                                                            });
                                                        }}
                                                        title={'Remove from all groups'}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button.Danger>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Whitelist Tab */}
                {activeTab === 'whitelist' && (
                    <>
                        <div className={'p-4 rounded-md mb-4'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                            <div className={'flex items-center'}>
                                <FontAwesomeIcon icon={faUserCheck} className={'mr-2'} />
                                <span className={'font-semibold text-lg'}>Allowlist</span>
                            </div>
                            <p className={'mt-2'} style={{ color: 'var(--theme-text-base)' }}>
                                When enabled, only players on the allowlist can join the server.
                            </p>
                        </div>
                        <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'}>
                            {/* Enable/Disable Toggle - First Row */}
                            <div
                                className={`cursor-pointer transition-all p-4 rounded-md flex justify-center items-center min-h-[60px] border-r-4 ${whitelist.enabled ? 'border-r-green-500' : 'border-r-red-500'}`}
                                style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                onClick={handleToggleWhitelist}
                            >
                                <FontAwesomeIcon
                                    icon={whitelist.enabled ? faCheck : faTimes}
                                    className={`mr-2 ${whitelist.enabled ? 'text-green-400' : 'text-red-400'}`}
                                />
                                <span>{whitelist.enabled ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            {/* Player List */}
                            {(whitelist.list || []).map((pUuid) => (
                                <div
                                    key={pUuid}
                                    className={'transition-all p-4 rounded-md flex justify-between items-center'}
                                    style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
                                >
                                    <PlayerDisplay
                                        playerUuid={pUuid}
                                        playerInfo={playerInfoCache[pUuid]}
                                        size={40}
                                    />
                                    <Button.Danger
                                        className={'!p-2 flex-shrink-0'}
                                        disabled={isLoading}
                                        onClick={() => handleRemoveFromWhitelist(pUuid)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button.Danger>
                                </div>
                            ))}
                            {/* Add Player Button */}
                            <div
                                className={'cursor-pointer transition-all p-4 rounded-md flex justify-center items-center min-h-[60px]'}
                                style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
                                onClick={() => {
                                    setPlayerUuid('');
                                    setLookupResult(null);
                                    setNewWhitelistModalVisible(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus} className={'mr-2'} />
                                <span>Add Player</span>
                            </div>
                        </div>
                        {(whitelist.list || []).length === 0 && (
                            <p className={'text-sm mt-4'} style={{ color: 'var(--theme-text-muted)' }}>No players on the allowlist yet. Add players above.</p>
                        )}
                    </>
                )}
                {/* Bans Tab */}
                {activeTab === 'bans' && (
                    <>
                        <div className={'p-4 rounded-md mb-4'} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                            <div className={'flex items-center'}>
                                <FontAwesomeIcon icon={faBan} className={'mr-2'} />
                                <span className={'font-semibold text-lg'}>Banned Players</span>
                            </div>
                            <p className={'mt-2'} style={{ color: 'var(--theme-text-base)' }}>
                                Banned players cannot join the server until they are unbanned.
                            </p>
                        </div>
                        {bans.length === 0 ? (
                            <p className={'text-sm'} style={{ color: 'var(--theme-text-muted)' }}>No players are currently banned.</p>
                        ) : (
                            <div className={'overflow-x-auto'}>
                                <table className={'w-full'}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--theme-background-secondary)', borderBottom: '1px solid var(--theme-border)' }}>
                                            <th className={'text-left p-3 rounded-tl-md'}>Player</th>
                                            <th className={'text-left p-3'}>Reason</th>
                                            <th className={'text-left p-3'}>Type</th>
                                            <th className={'text-left p-3'}>Banned By</th>
                                            <th className={'text-left p-3'}>Date</th>
                                            <th className={'text-right p-3 rounded-tr-md'}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bans.map((ban: BanEntry) => (
                                            <tr key={ban.target} className={'transition-colors'} style={{ borderBottom: '1px solid var(--theme-border)' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.05)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <td className={'p-3'}>
                                                    <PlayerDisplay
                                                        playerUuid={ban.target}
                                                        playerInfo={playerInfoCache[ban.target]}
                                                        size={32}
                                                    />
                                                </td>
                                                <td className={'p-3'}>
                                                    <span className={'text-sm'}>{ban.reason}</span>
                                                </td>
                                                <td className={'p-3'}>
                                                    <span className={'bg-red-600/30 text-red-300 px-2 py-1 rounded text-sm'}>
                                                        {ban.type}
                                                    </span>
                                                </td>
                                                <td className={'p-3'}>
                                                    <PlayerDisplay
                                                        playerUuid={ban.by}
                                                        playerInfo={playerInfoCache[ban.by]}
                                                        size={24}
                                                        showUuid={false}
                                                    />
                                                </td>
                                                <td className={'p-3'}>
                                                    <span className={'text-sm'} style={{ color: 'var(--theme-text-muted)' }}>
                                                        {formatTimestamp(ban.timestamp)}
                                                    </span>
                                                </td>
                                                <td className={'p-3 text-right'}>
                                                    <Button.Text
                                                        className={'!p-2'}
                                                        disabled={isLoading}
                                                        onClick={() => handleRemoveBan(ban.target)}
                                                    >
                                                        Unban
                                                    </Button.Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className={'mt-4'}>
                            <Button.Danger
                                onClick={() => {
                                    setPlayerUuid('');
                                    setBanReason('');
                                    setLookupResult(null);
                                    setNewBanModalVisible(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus} className={'mr-2'} />
                                Ban Player
                            </Button.Danger>
                        </div>
                    </>
                )}
            </div>
        </ServerContentBlock>
    );
}

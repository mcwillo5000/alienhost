import http from '@/api/http';
export interface HytalePlayerInfo {
    id: string;
    raw_id: string;
    username: string;
    avatar: string;
}
export interface PlayerDBResponse {
    code: string;
    message: string;
    success: boolean;
    data: {
        player: HytalePlayerInfo;
    };
}
export const lookupHytalePlayer = async (query: string): Promise<HytalePlayerInfo | null> => {
    try {
        const response = await fetch(`https://playerdb.co/api/player/hytale/${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Pterodactyl-Panel (+https://pterodactyl.io)',
            },
        });
        if (!response.ok) {
            return null;
        }
        const data: PlayerDBResponse = await response.json();
        if (data.success && data.data?.player) {
            return data.data.player;
        }
        return null;
    } catch (error) {
        console.error('Failed to lookup Hytale player:', error);
        return null;
    }
};
export const getHytaleAvatarUrl = (uuidOrUsername: string, size: number = 64): string => {
    return `https://crafthead.net/hytale/avatar/${encodeURIComponent(uuidOrUsername)}/${size}`;
};
export const getHytaleHelmUrl = (uuidOrUsername: string, size: number = 64): string => {
    return `https://crafthead.net/hytale/helm/${encodeURIComponent(uuidOrUsername)}/${size}`;
};
export interface PlayerPermissionData {
    groups: string[];
}
export interface PermissionsData {
    users: Record<string, PlayerPermissionData>;
    groups: Record<string, string[]>;
}
export interface WhitelistData {
    enabled: boolean;
    list: string[];
}
export interface BanEntry {
    type: string;
    target: string;
    by: string;
    timestamp: number;
    reason: string;
}
export interface HytalePlayerData {
    permissions: PermissionsData;
    whitelist: WhitelistData;
    bans: BanEntry[];
}
export const getHytaleData = async (uuid: string): Promise<HytalePlayerData> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/hytale-players`);
    const result = data.data || {};
    return {
        permissions: result.permissions || { users: {}, groups: {} },
        whitelist: result.whitelist || { enabled: false, list: [] },
        bans: result.bans || [],
    };
};
export const getPermissions = async (uuid: string): Promise<PermissionsData> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/hytale-players/permissions`);
    return data.data;
};
export const createGroup = async (uuid: string, name: string, permissions: string[] = []): Promise<PermissionsData> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/hytale-players/permissions/group`, {
        name,
        permissions,
    });
    return data.data;
};
export const updateGroup = async (uuid: string, name: string, permissions: string[]): Promise<PermissionsData> => {
    const { data } = await http.put(`/api/client/servers/${uuid}/hytale-players/permissions/group`, {
        name,
        permissions,
    });
    return data.data;
};
export const deleteGroup = async (uuid: string, name: string): Promise<PermissionsData> => {
    const { data } = await http.delete(`/api/client/servers/${uuid}/hytale-players/permissions/group`, {
        data: { name },
    });
    return data.data;
};
export const addPlayerToGroup = async (uuid: string, playerUuid: string, group: string): Promise<PermissionsData> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/hytale-players/permissions/player`, {
        player_uuid: playerUuid,
        group,
    });
    return data.data;
};
export const removePlayerFromGroup = async (uuid: string, playerUuid: string, group: string): Promise<PermissionsData> => {
    const { data } = await http.delete(`/api/client/servers/${uuid}/hytale-players/permissions/player`, {
        data: { player_uuid: playerUuid, group },
    });
    return data.data;
};
export const getWhitelist = async (uuid: string): Promise<WhitelistData> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/hytale-players/whitelist`);
    return data.data;
};
export const toggleWhitelist = async (uuid: string, enabled: boolean): Promise<WhitelistData> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/hytale-players/whitelist/toggle`, {
        enabled,
    });
    return data.data;
};
export const addToWhitelist = async (uuid: string, playerUuid: string): Promise<WhitelistData> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/hytale-players/whitelist/player`, {
        player_uuid: playerUuid,
    });
    return data.data;
};
export const removeFromWhitelist = async (uuid: string, playerUuid: string): Promise<WhitelistData> => {
    const { data } = await http.delete(`/api/client/servers/${uuid}/hytale-players/whitelist/player`, {
        data: { player_uuid: playerUuid },
    });
    return data.data;
};
export const getBans = async (uuid: string): Promise<BanEntry[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/hytale-players/bans`);
    return data.data;
};
export const addBan = async (
    uuid: string,
    playerUuid: string,
    reason: string,
    bannedBy: string = '00000000-0000-0000-0000-000000000000',
    type: string = 'infinite'
): Promise<BanEntry[]> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/hytale-players/bans`, {
        player_uuid: playerUuid,
        reason,
        banned_by: bannedBy,
        type,
    });
    return data.data;
};
export const removeBan = async (uuid: string, playerUuid: string): Promise<BanEntry[]> => {
    const { data } = await http.delete(`/api/client/servers/${uuid}/hytale-players/bans`, {
        data: { player_uuid: playerUuid },
    });
    return data.data;
};
export interface PlayerStats {
    oxygen: number;
    health: number;
    mana: number;
    stamina: number;
}
export interface RegisteredPlayer {
    uuid: string;
    username: string;
    position: {
        x: number;
        y: number;
        z: number;
    } | null;
    world: string;
    gamemode: string;
    stats?: PlayerStats;
    modified_at: string | null;
}
export const getRegisteredPlayers = async (uuid: string): Promise<RegisteredPlayer[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/hytale-players/players`);
    return data.data || [];
};
export const deleteRegisteredPlayer = async (uuid: string, playerUuid: string): Promise<void> => {
    await http.delete(`/api/client/servers/${uuid}/hytale-players/players`, {
        data: { player_uuid: playerUuid },
    });
};
export const changePlayerGamemode = async (
    uuid: string,
    playerUuid: string,
    playerName: string,
    gamemode: string
): Promise<{ success: boolean; command_sent: boolean }> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/hytale-players/players/gamemode`, {
        player_uuid: playerUuid,
        player_name: playerName,
        gamemode: gamemode,
    });
    return data;
};

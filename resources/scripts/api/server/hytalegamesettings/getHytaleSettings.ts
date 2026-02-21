import http from '@/api/http';
export interface HytaleSettings {
    serverName: string;
    motd: string;
    serverPassword: string;
    maxPlayers: number;
    gamemode: 'Adventure' | 'Creative' | 'Spectator';
    worldName: string;
    viewDistanceRadius: number;
}
export default (uuid: string): Promise<HytaleSettings> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/hytale/settings`)
            .then(({ data }) => resolve(data.attributes))
            .catch(reject);
    });
};

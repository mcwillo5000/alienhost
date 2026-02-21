import http from '@/api/http';
export interface WorldConfig {
    WorldGen: {
        Name: string;
    };
    Seed: number;
    IsPvpEnabled: boolean;
    IsFallDamageEnabled: boolean;
    GameTime: string;
    IsGameTimePaused: boolean;
    Death?: {
        ItemsLossMode: string;
        ItemsAmountLossPercentage?: number;
        ItemsDurabilityLossPercentage?: number;
    };
    DaytimeDurationSeconds?: number;
    NighttimeDurationSeconds?: number;
    IsTicking: boolean;
    IsSpawningNPC: boolean;
    IsSpawnMarkersEnabled: boolean;
    IsBlockTicking: boolean;
    IsAllNPCFrozen: boolean;
    PregenerateRadius?: number;
}
export default (uuid: string, worldName: string): Promise<WorldConfig> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/hytale/worlds/${worldName}`)
            .then(({ data }) => resolve(data.attributes))
            .catch(reject);
    });
};

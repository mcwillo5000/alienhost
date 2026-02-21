import http from '@/api/http';
export interface GameConfigFile {
    path: string;
    name: string;
    type: string;
}
export interface GameTypeResponse {
    gameType: string;
    configFiles: GameConfigFile[];
}
export interface ConfigFilesResponse {
    files: GameConfigFile[];
}
export interface ConfigContentResponse {
    content: string;
    parsed: Record<string, any>;
    type: string;
}
export interface UpdateConfigResponse {
    success: boolean;
    message: string;
}
export const detectGameType = (server: string): Promise<GameTypeResponse> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${server}/game-config/detect`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
export const getConfigFiles = (server: string, gameType: string): Promise<ConfigFilesResponse> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${server}/game-config/files`, {
            params: { gameType },
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
export const getConfigContent = (server: string, file: string, type: string): Promise<ConfigContentResponse> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${server}/game-config/content`, {
            params: { file, type },
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
export const updateConfig = (server: string, file: string, content: string): Promise<UpdateConfigResponse> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${server}/game-config/update`, {
            file,
            content,
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

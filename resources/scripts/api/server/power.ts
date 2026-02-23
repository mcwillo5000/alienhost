import http from '@/api/http';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const setServerPowerState = (uuid: string, signal: PowerAction): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/power`, { signal })
            .then(() => resolve())
            .catch(reject);
    });
};

export default setServerPowerState;
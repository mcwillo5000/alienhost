import http from '@/api/http';

export default (uuid: string, prefabId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/hytale-prefabs/remove/${prefabId}`)
            .then(() => resolve())
            .catch(reject);
    });
};

import http from '@/api/http';

export default (uuid: string, modId: string, provider?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/mods/remove/${modId}`, {
            params: { provider },
        })
            .then(() => resolve())
            .catch(reject);
    });
};

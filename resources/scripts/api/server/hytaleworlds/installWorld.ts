import http from '@/api/http';
interface InstallWorldResponse {
    download_id: string;
    message: string;
}
export default (uuid: string, worldId: string, version: string): Promise<InstallWorldResponse> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/hytale-worlds/install`, {
            world_id: worldId,
            version: version,
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

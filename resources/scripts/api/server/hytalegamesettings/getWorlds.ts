import http from '@/api/http';
export interface HytaleWorld {
    name: string;
    size: number;
    modified: string | null;
}
export default (uuid: string): Promise<HytaleWorld[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/hytale/worlds`)
            .then(({ data }) => resolve(data.data))
            .catch(reject);
    });
};

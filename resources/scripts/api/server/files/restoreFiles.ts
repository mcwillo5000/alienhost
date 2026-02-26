import http from '@/api/http';

export default async (uuid: string, files: number[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/restore`, { files })
            .then(() => resolve())
            .catch(reject);
    });
};

import http from '@/api/http';

export default (uuid: string, url: string | null): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/settings/crashlogs`, { url })
            .then(() => resolve())
            .catch(reject);
    });
};

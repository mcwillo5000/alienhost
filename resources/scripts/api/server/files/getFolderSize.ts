import http from '@/api/http';

const getFolderSize = (uuid: string, folder: string): Promise<{ size: number }> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/size`, { folder }, { timeout: 12000 })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export default getFolderSize;
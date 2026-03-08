import http from '@/api/http';

export default (uuid: string): Promise<{ disableRemoteImport: boolean }> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/extensions/databaseimportexport/${uuid}`)
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};

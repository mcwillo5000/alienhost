import http from '@/api/http';

export default (uuid: string, database: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(
            `/api/client/extensions/databaseimportexport/${uuid}/${database}/export`,
            {},
            {
                timeout: 300000,
                timeoutErrorMessage:
                    'It looks like this export is taking a long time to be finished. Consider using a dedicated tool for this database.',
            }
        )
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};

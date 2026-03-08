import http from '@/api/http';

export default (uuid: string, database: string, sql: string, wipe: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/extensions/databaseimportexport/${uuid}/${database}/import`, sql, {
            headers: {
                'Content-Type': 'text/plain',
            },
            timeout: 300000,
            params: {
                wipe,
            },
            timeoutErrorMessage:
                'It looks like this import is taking a long time to be finished. Consider splitting your file into smaller portions.',
        })
            .then(() => resolve())
            .catch(reject);
    });
};

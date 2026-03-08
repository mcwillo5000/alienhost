import http from '@/api/http';

export default (
    uuid: string,
    database: string,
    host: string,
    port: number,
    remoteDatabase: string,
    remoteUsername: string,
    remotePassword: string,
    wipe: boolean
): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(
            `/api/client/extensions/databaseimportexport/${uuid}/${database}/import/remote`,
            {
                host,
                port,
                database: remoteDatabase,
                username: remoteUsername,
                password: remotePassword,
                wipe,
            },
            {
                timeout: 300000,
                timeoutErrorMessage: 'It looks like this import is taking a long time to be finished.',
            }
        )
            .then(() => resolve())
            .catch(reject);
    });
};

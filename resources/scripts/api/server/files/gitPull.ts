import http from '@/api/http';

export default async (
    uuid: string,
    directory: string,
    token: string,
    saveToken: boolean,
    hardReset: boolean
): Promise<void> => {
    await http.post(
        `/api/client/servers/${uuid}/files/git/pull`,
        { root: directory, token, saveToken, hardReset },
        {
            timeout: 300000,
            timeoutErrorMessage:
                'It looks like this archive is taking a long time to be cloned. Once completed the cloned files will appear.',
        }
    );
};

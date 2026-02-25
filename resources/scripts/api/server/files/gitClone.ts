import http from '@/api/http';

export default async (
    uuid: string,
    directory: string,
    url: string,
    branch: string,
    token: string,
    saveToken: boolean
): Promise<void> => {
    await http.post(
        `/api/client/servers/${uuid}/files/git/clone`,
        { root: directory, url, branch, token, saveToken },
        {
            timeout: 300000,
            timeoutErrorMessage:
                'It looks like this archive is taking a long time to be cloned. Once completed the cloned files will appear.',
        }
    );
};

import http from '@/api/http';

interface InstallModParams {
    modName?: string;
    modIcon?: string;
    modAuthor?: string;
}

export default (uuid: string, modId: string, version: string, params?: InstallModParams): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/hytale-mods/install`, {
            mod_id: modId,
            version: version,
            mod_name: params?.modName || '',
            mod_icon: params?.modIcon || '',
            mod_author: params?.modAuthor || '',
        })
            .then(() => resolve())
            .catch(reject);
    });
};

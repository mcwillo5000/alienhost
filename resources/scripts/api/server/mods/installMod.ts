import http from '@/api/http';

export default (uuid: string, modId: string, version: string, provider: string = 'modrinth', modName?: string, modIcon?: string, modAuthor?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/mods/install`, {
            mod_id: modId,
            version: version,
            provider: provider,
            mod_name: modName || '',
            mod_icon: modIcon || '',
            mod_author: modAuthor || '',
        })
            .then(() => resolve())
            .catch(reject);
    });
};

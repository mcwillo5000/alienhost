import http from '@/api/http';
export default (uuid: string, prefabId: string, version: string, prefabName?: string, prefabIcon?: string, prefabAuthor?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/hytale-prefabs/install`, {
            prefab_id: prefabId,
            version: version,
            prefab_name: prefabName || '',
            prefab_icon: prefabIcon || '',
            prefab_author: prefabAuthor || '',
        })
            .then(() => resolve())
            .catch(reject);
    });
};

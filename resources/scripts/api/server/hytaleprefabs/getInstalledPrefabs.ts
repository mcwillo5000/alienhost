import http from '@/api/http';

export interface InstalledPrefab {
    prefab_id: string;
    version_id: string;
    prefab_name: string;
    prefab_icon: string;
    prefab_author: string;
    file_name: string;
    installed_at: string;
    latest_version_id: string | null;
    latest_version_name: string | null;
    has_update: boolean;
}

export default (uuid: string): Promise<InstalledPrefab[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/hytale-prefabs/installed-prefabs`)
            .then(({ data }) => resolve(data.data || []))
            .catch(reject);
    });
};

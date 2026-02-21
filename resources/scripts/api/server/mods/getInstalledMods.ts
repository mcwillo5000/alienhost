import http from '@/api/http';

export interface InstalledMod {
    mod_id: string;
    provider: string;
    version_id: string;
    mod_name: string;
    mod_icon: string;
    mod_author: string;
    file_name: string;
    installed_at: string;
    latest_version_id: string | null;
    latest_version_name: string | null;
    has_update: boolean;
}

export default (uuid: string): Promise<InstalledMod[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/mods/installed-mods`)
            .then(({ data }) => resolve(data.data || []))
            .catch(reject);
    });
};

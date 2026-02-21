import http from '@/api/http';

export type ReinstallType = 'keep_files' | 'delete_files' | 'factory_reset';

export default (uuid: string, reinstallType: ReinstallType = 'keep_files'): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/settings/reinstall`, {
            reinstall_type: reinstallType,
        })
            .then(() => resolve())
            .catch(reject);
    });
};
import http from '@/api/http';
import { rawDataToServerSubuser } from '@/api/server/users/getServerSubusers';
import { Subuser } from '@/state/server/subusers';

interface Params {
    denyfiles: string[];
    hidefiles: boolean;
}

export default (uuid: string, params: Params, subuser: Subuser): Promise<Subuser> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/users/${subuser.uuid}/files`, {
            denyfiles: params.denyfiles,
            hidefiles: params.hidefiles,
        })
            .then((data) => resolve(rawDataToServerSubuser(data.data)))
            .catch(reject);
    });
};

import useSWR from 'swr';

import http from '@/api/http';
import { ServerContext } from '@/state/server';

export interface MinecraftSoftware {
    buildType: string;
    versionName: string;
}

export const rawDataToMinecraftSoftware = (data: any): MinecraftSoftware => ({
    buildType: data.buildType,
    versionName: data.versionName,
});

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    return useSWR<MinecraftSoftware>(['server:minecraft-software', uuid], async () => {
        const { data } = await http.get(`/api/client/servers/${uuid}/minecraft-software`);

        return data;
    });
};

import React from 'react';
import http from '@/api/http';
import { ServerContext } from '@/state/server';
import useSWR from 'swr';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { NavLink } from 'react-router-dom';
import MinecraftInstalledPluginCard from './MinecraftInstalledPluginCard';
import { InstalledMinecraftProject } from '@/api/definitions/minecraftProject';
import { Button } from '@/components/elements/button';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const shortUuid = ServerContext.useStoreState((state) => state.server.data!.id);

    const {
        data: plugins,
        isValidating,
        mutate,
    } = useSWR<InstalledMinecraftProject[]>(['minecraft-installed-plugins', uuid], async () => {
        const { data } = await http.get(`/api/client/servers/${uuid}/minecraft-plugins/installed`);
        return data;
    });

    return (
        <ServerContentBlock title={'Installed Minecraft Plugins'} showFlashKey='minecraft-plugins'>
            <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold flex items-center'>
                    Installed Plugins{plugins && ` (${plugins.length})`}
                    {isValidating && <Spinner size={'small'} css={tw`inline-block ml-2`}></Spinner>}
                </h2>
                <NavLink to={`/server/${shortUuid}/minecraft-plugins`}>
                    <Button className='h-12'>Browse Plugins</Button>
                </NavLink>
            </div>
            <div className='grid lg:grid-cols-3 gap-2 mt-3'>
                {plugins && (
                    <>
                        {plugins.map((plugin) => (
                            <MinecraftInstalledPluginCard mutate={mutate} plugin={plugin} key={plugin.path} />
                        ))}
                    </>
                )}
            </div>
        </ServerContentBlock>
    );
};

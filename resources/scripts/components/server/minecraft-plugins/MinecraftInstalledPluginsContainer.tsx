import React from 'react';
import http from '@/api/http';
import { ServerContext } from '@/state/server';
import useSWR from 'swr';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import FlashMessageRender from '@/components/FlashMessageRender';
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
            <FlashMessageRender byKey={'minecraft-plugins'} css={tw`mb-4`} />
            <FuturisticContentBox title={'Installed Plugins'}>
                <div css={tw`flex justify-between items-center mb-4`}>
                    <div css={tw`flex items-center gap-2`}>
                        <span
                            css={tw`text-sm font-medium`}
                            style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                        >
                            {plugins ? `${plugins.length} plugin${plugins.length !== 1 ? 's' : ''} installed` : 'Loading...'}
                        </span>
                        {isValidating && <Spinner size={'small'} css={tw`inline-block`} />}
                    </div>
                    <NavLink to={`/server/${shortUuid}/minecraft-plugins`}>
                        <Button>Browse Plugins</Button>
                    </NavLink>
                </div>
                {plugins && plugins.length > 0 ? (
                    <div css={tw`grid lg:grid-cols-3 gap-3`}>
                        {plugins.map((plugin) => (
                            <MinecraftInstalledPluginCard mutate={mutate} plugin={plugin} key={plugin.path} />
                        ))}
                    </div>
                ) : plugins && plugins.length === 0 ? (
                    <div
                        css={tw`flex flex-col items-center justify-center py-12`}
                        style={{ color: 'var(--theme-text-muted)' }}
                    >
                        <svg
                            css={tw`h-12 w-12 mb-3`}
                            xmlSpace='preserve'
                            fillRule='evenodd'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeMiterlimit='1.5'
                            clipRule='evenodd'
                            viewBox='0 0 104 104'
                            aria-hidden='true'
                        >
                            <path fill='none' d='M0 0h103.4v103.4H0z' />
                            <path
                                fill='none'
                                stroke='var(--theme-text-muted)'
                                strokeWidth='5'
                                d='M51.7 92.5V51.7L16.4 31.3l35.3 20.4L87 31.3 51.7 11 16.4 31.3v40.8l35.3 20.4L87 72V31.3L51.7 11'
                            />
                        </svg>
                        <p css={tw`text-sm`} style={{ fontFamily: "'Electrolize', sans-serif" }}>
                            No plugins installed yet.
                        </p>
                    </div>
                ) : null}
            </FuturisticContentBox>
        </ServerContentBlock>
    );
};

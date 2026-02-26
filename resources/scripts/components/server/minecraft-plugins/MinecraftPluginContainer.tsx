import http from '@/api/http';
import { getPaginationSet, PaginatedResult } from '@/api/http';
import Input from '@/components/elements/Input';
import Pagination from '@/components/elements/Pagination';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import { Button } from '@/components/elements/button/index';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import useSWR from 'swr';
import tw from 'twin.macro';
import MinecraftPluginRow from '@/components/server/minecraft-plugins/MinecraftPluginRow';
import getMinecraftSoftware, { MinecraftSoftware } from '@/api/swr/getMinecraftSoftware';
import { NavLink } from 'react-router-dom';

export type MinecraftPluginProvider = 'curseforge' | 'modrinth' | 'hangar' | 'spigotmc' | 'craftaro' | 'polymart';

export interface MinecraftPlugin {
    id: string;
    name: string;
    short_description: string;
    url: string;
    icon_url: string | null;
    external_url: string | null;
}

type MinecraftPluginResponse = PaginatedResult<MinecraftPlugin>;

const pluginLoaders = [
    {
        id: 'bukkit',
        name: 'Bukkit',
    },
    {
        id: 'bungeecord',
        name: 'BungeeCord',
    },
    {
        id: 'folia',
        name: 'Folia',
    },
    {
        id: 'paper',
        name: 'Paper',
    },
    {
        id: 'purpur',
        name: 'Purpur',
    },
    {
        id: 'spigot',
        name: 'Spigot',
    },
    {
        id: 'sponge',
        name: 'Sponge',
    },
    {
        id: 'velocity',
        name: 'Velocity',
    },
    {
        id: 'waterfall',
        name: 'Waterfall',
    },
];

export default () => {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const defaultProvider = (params.get('provider') as MinecraftPluginProvider) || 'modrinth';
    const defaultQuery = params.get('query') || '';
    const defaultPageSize = params.get('pageSize') || 50;
    const defaultPluginLoader = params.get('pluginLoader') || '';
    const defaultMinecraftVersion = params.get('minecraftVersion') || '';
    const defaultPage = Number(params.get('page') || 1);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const shortUuid = ServerContext.useStoreState((state) => state.server.data!.id);
    const [pluginProvider, setPluginProvider] = useState<MinecraftPluginProvider>(defaultProvider);
    const [searchQuery, setSearchQuery] = useState<string>(defaultQuery);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [pluginLoader, setPluginLoader] = useState(defaultPluginLoader);
    const [minecraftVersion, setMinecraftVersion] = useState(defaultMinecraftVersion);
    const [minecraftVersions, setMinecraftVersions] = useState<string[]>([]);
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);

    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const { data: isLinkedToPolymart, mutate } = useSWR<boolean>(
        `minecraft-plugins-is-linked-to-polymart`,
        async () => {
            const { data } = await http.get(`/api/client/servers/${uuid}/minecraft-plugins/is-linked`);
            return data;
        }
    );

    const { data: plugins, error } = useSWR<MinecraftPluginResponse>(
        [
            'minecraft-plugins',
            pluginProvider,
            searchQuery,
            pageSize,
            page,
            isLinkedToPolymart,
            pluginLoader,
            minecraftVersion,
        ],
        async () => {
            const { data } = await http.get(`/api/client/servers/${uuid}/minecraft-plugins`, {
                params: {
                    provider: pluginProvider,
                    search_query: searchQuery,
                    page_size: pageSize,
                    plugin_loader: pluginLoader,
                    page: page,
                    minecraft_version: minecraftVersion,
                },
            });
            return {
                items: data.data || [],
                pagination: getPaginationSet(data.meta.pagination),
            };
        }
    );

    const handleLinkButton = async () => {
        const { data: redirectUrl } = await http.post(`/api/client/servers/${uuid}/minecraft-plugins/link`);
        window.location = redirectUrl;
    };

    const handleDisconnectButton = async () => {
        await http.post(`/api/client/servers/${uuid}/minecraft-plugins/disconnect`);
        mutate();
    };

    useEffect(() => {
        http.get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json', {
            // for CORS
            withCredentials: false,
            transformRequest: [
                function (data, headers) {
                    if (headers) {
                        delete headers['X-Requested-With'];
                    }
                    return data;
                },
            ],
        }).then(({ data }) =>
            setMinecraftVersions(
                data.versions
                    .filter((v: { id: string; type: string }) => v.type === 'release')
                    .map((v: { id: string; type: string }) => v.id)
            )
        );
    }, []);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        const params = new URLSearchParams();
        if (pluginProvider !== 'modrinth') {
            params.set('provider', pluginProvider);
        }
        if (searchQuery.length > 0) {
            params.set('query', searchQuery);
        }
        if (pageSize !== 50) {
            params.set('pageSize', pageSize.toString());
        }
        if (pluginLoader !== '') {
            params.set('pluginLoader', pluginLoader);
        }
        if (minecraftVersion !== '') {
            params.set('minecraftVersion', minecraftVersion);
        }
        if (page > 1) {
            params.set('page', page.toString());
        }

        window.history.replaceState(
            null,
            document.title,
            `/server/${shortUuid}/minecraft-plugins${params.toString().length > 0 ? '?' + params.toString() : ''}`
        );
    }, [pluginProvider, searchQuery, pageSize, page, minecraftVersion, pluginLoader]);

    useEffect(() => {
        if (!plugins) return;
        if (plugins.pagination.currentPage > 1 && !plugins.items.length) {
            setPage(1);
        }
    }, [plugins?.pagination.currentPage]);

    useEffect(() => {
        if (!error) {
            clearFlashes('minecraft-plugins');
            return;
        }
        clearAndAddHttpError({ error, key: 'minecraft-plugins' });
    }, [error]);

    const { data: minecraftBuildInfo } = getMinecraftSoftware();

    const getFilterFromMinecraftBuild = (minecraftBuildInfo: MinecraftSoftware) => {
        if (minecraftBuildInfo.buildType === 'PUFFERFISH') {
            return 'paper';
        }
        return pluginLoaders.find((a) => a.id === minecraftBuildInfo.buildType.toLowerCase())?.id;
    };

    // Set the plugin loader filter from detected software if none
    // is currently selected.
    useEffect(() => {
        if (minecraftBuildInfo) {
            const filter = getFilterFromMinecraftBuild(minecraftBuildInfo);
            if (
                minecraftBuildInfo.buildType &&
                minecraftBuildInfo.buildType !== 'UNKNOWN' &&
                filter &&
                pluginLoader === ''
            ) {
                setPluginLoader(filter);
                if (minecraftBuildInfo.buildType !== 'VELOCITY') {
                    setMinecraftVersion(minecraftBuildInfo.versionName);
                }
            }
        }
    }, [minecraftBuildInfo]);

    return (
        <ServerContentBlock title={'Minecraft Plugins'} showFlashKey='minecraft-plugins'>
            <div css={tw`flex flex-wrap items-end gap-4`}>
                <div css={tw`min-w-[112px]`}>
                    <Label htmlFor='plugin_provider'>Provider</Label>
                    <Select
                        name='plugin_provider'
                        value={pluginProvider}
                        onChange={(event) => setPluginProvider(event.target.value as MinecraftPluginProvider)}
                    >
                        <option value='curseforge'>CurseForge</option>
                        <option value='hangar'>Hangar</option>
                        <option value='modrinth'>Modrinth</option>
                        <option value='polymart'>Polymart</option>
                        <option value='spigotmc'>SpigotMC</option>
                    </Select>
                </div>
                <div>
                    <Label htmlFor={'page_size'}>Page size</Label>
                    <Select
                        name='page_size'
                        value={pageSize}
                        onChange={(event) => {
                            setPageSize(Number(event.target.value));
                        }}
                    >
                        <option value='10'>10</option>
                        <option value='25'>25</option>
                        <option value='50'>50</option>
                    </Select>
                </div>
                {pluginProvider === 'modrinth' && (
                    <div>
                        <Label htmlFor={'plugin_loader'}>Plugin loader</Label>
                        <Select
                            name='plugin_loader'
                            value={pluginLoader}
                            onChange={(event) => {
                                setPluginLoader(event.target.value);
                            }}
                        >
                            <option value=''>All</option>
                            {pluginLoaders.map((loader) => (
                                <option key={loader.id} value={loader.id}>
                                    {loader.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}
                <div>
                    <Label htmlFor={'minecraft_version'}>Minecraft version</Label>
                    <Select
                        name='minecraft_version'
                        value={minecraftVersion}
                        onChange={(event) => {
                            setMinecraftVersion(event.target.value);
                        }}
                    >
                        <option value=''>All</option>
                        {minecraftVersions.map((ver) => (
                            <option key={ver} value={ver}>
                                {ver}
                            </option>
                        ))}
                    </Select>
                </div>
                <div css={tw`w-full md:w-auto md:flex-1`}>
                    <Label htmlFor='search_query'>Search query</Label>
                    <Input
                        type='text'
                        name='search_query'
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value);
                        }}
                    />
                </div>
                {pluginProvider === 'polymart' &&
                    isLinkedToPolymart !== null &&
                    (isLinkedToPolymart ? (
                        <Button css={tw`h-12`} onClick={handleDisconnectButton}>
                            Unlink Polymart account
                        </Button>
                    ) : (
                        <Button css={tw`h-12`} onClick={handleLinkButton}>
                            Link Polymart account
                        </Button>
                    ))}
                <NavLink to={`/server/${shortUuid}/minecraft-plugins/installed`}>
                    <Button className='h-12'>Installed Plugins</Button>
                </NavLink>
            </div>
            <div css={tw`mt-3`}>
                {!error && plugins ? (
                    <Pagination data={plugins} onPageSelect={setPage}>
                        {({ items }) =>
                            items.length > 0 ? (
                                <div className='grid lg:grid-cols-3 gap-2 w-full overflow-x-hidden'>
                                    {items.map((plugin) => (
                                        <MinecraftPluginRow
                                            key={`${page}-${plugin.id}`}
                                            provider={pluginProvider}
                                            plugin={plugin}
                                            pluginLoader={pluginLoader}
                                            minecraftVersion={minecraftVersion}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p css={tw`text-center text-sm text-neutral-300`}>
                                    No &quot;Minecraft: Java Edition&quot; plugins have been found for your query.
                                </p>
                            )
                        }
                    </Pagination>
                ) : (
                    <Spinner centered size='base' />
                )}
            </div>
        </ServerContentBlock>
    );
};

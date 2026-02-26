import http from '@/api/http';
import { Dialog } from '@/components/elements/dialog';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { faExternalLinkAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import {
    MinecraftPlugin,
    MinecraftPluginProvider,
} from '@/components/server/minecraft-plugins/MinecraftPluginContainer';

interface Props {
    provider: MinecraftPluginProvider;
    plugin: MinecraftPlugin;
    pluginLoader: string;
    minecraftVersion: string;
    className?: string;
}

interface MinecraftPluginVersion {
    id: string;
    name: string;
    game_versions: string[];
    download_url: string;
}

export const installPlugin = (uuid: string, provider: string, pluginId: string, versionId: string) => {
    return http.post(`/api/client/servers/${uuid}/minecraft-plugins/install`, {
        provider: provider,
        pluginId: pluginId,
        versionId: versionId,
    });
};

export default ({ provider, plugin, pluginLoader, minecraftVersion, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
    const [installDialogVisible, setInstallDialogVisible] = useState<boolean>(false);
    const [versions, setVersions] = useState<MinecraftPluginVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    const install = () => {
        if (selectedVersion) {
            installPlugin(uuid, provider, plugin.id, selectedVersion)
                .then(() => {
                    clearFlashes();
                    addFlash({
                        key: 'minecraft-plugins',
                        message: `Plugin "${plugin.name}" successfully installed in /home/container/plugins.`,
                        type: 'success',
                    });
                })
                .catch((error) => {
                    clearAndAddHttpError({ error, key: 'minecraft-plugins' });
                });
        }

        setInstallDialogVisible(false);
    };

    useEffect(() => {
        if (installDialogVisible && !versions.length) {
            http.get(`/api/client/servers/${uuid}/minecraft-plugins/versions`, {
                params: {
                    provider: provider,
                    plugin_id: plugin.id,
                    plugin_loader: pluginLoader,
                    minecraft_version: minecraftVersion,
                },
            })
                .then(({ data }) => {
                    setVersions(data);
                    setSelectedVersion(data[0]?.id);
                })
                .catch((error) => {
                    clearAndAddHttpError({ error, key: 'minecraft-plugins' });
                    setInstallDialogVisible(false);
                });
        }
    }, [installDialogVisible]);

    return (
        <>
            <Dialog.Confirm
                title={'Install plugin'}
                confirm={'Install plugin'}
                open={installDialogVisible}
                onClose={() => setInstallDialogVisible(false)}
                onConfirmed={install}
            >
                <p>
                    You requested the installation of the plugin &quot;{plugin.name}&quot; from the {provider} provider.
                    Please select the desired plugin version below.
                </p>
                <Label className={'mt-3'} htmlFor='plugin_version_id'>
                    Plugin version
                </Label>
                <Select
                    name='plugin_version_id'
                    onChange={(event) => {
                        setSelectedVersion(event.target.value);
                    }}
                >
                    {versions.map((version) => (
                        <option key={version.id} value={version.id}>
                            {version.name}
                        </option>
                    ))}
                </Select>
            </Dialog.Confirm>
            <div
                css={tw`flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-150 min-w-0 overflow-hidden`}
                style={{
                    backgroundColor: 'var(--theme-background-secondary)',
                    border: '1px solid var(--theme-border)',
                }}
            >
                <img
                    src={plugin.icon_url ?? 'https://placehold.co/32'}
                    css={tw`rounded w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0`}
                />
                <div css={tw`flex flex-col flex-1 min-w-0`}>
                    {plugin.url ? (
                        <a
                            href={plugin.url}
                            target='_blank'
                            rel='noreferrer'
                            css={tw`text-sm font-medium truncate transition-colors duration-150`}
                            style={{ color: 'var(--theme-text-base)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-base)')}
                        >
                            {plugin.name} <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`ml-1 h-2.5 w-2.5`} />
                        </a>
                    ) : (
                        <p css={tw`text-sm font-medium truncate`} style={{ color: 'var(--theme-text-base)' }}>
                            {plugin.name}
                        </p>
                    )}
                    <p css={tw`text-xs line-clamp-2 mt-0.5`} style={{ color: 'var(--theme-text-muted)' }}>
                        {plugin.short_description}
                    </p>
                </div>
                {plugin.external_url ? (
                    <a
                        title='Go to external URL'
                        target='_blank'
                        rel='noreferrer'
                        css={tw`flex-shrink-0 p-1.5 text-sm transition-colors duration-150`}
                        style={{ color: 'var(--theme-text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                        href={plugin.external_url}
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                ) : (
                    <button
                        title='Install'
                        css={tw`flex-shrink-0 p-1.5 text-sm transition-colors duration-150`}
                        style={{ color: 'var(--theme-text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                        onClick={() => setInstallDialogVisible(true)}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </button>
                )}
            </div>
        </>
    );
};

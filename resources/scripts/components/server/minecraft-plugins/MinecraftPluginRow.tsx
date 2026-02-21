import http from '@/api/http';
import { Dialog } from '@/components/elements/dialog';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import GreyRowBox from '@/components/elements/GreyRowBox';
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
            <GreyRowBox className={className} css={tw`items-center`}>
                <img
                    src={plugin.icon_url ?? 'https://placehold.co/32'}
                    css={tw`rounded-md w-8 h-8 sm:w-12 sm:h-12 object-contain flex items-center justify-center`}
                />
                <div css={tw`ml-3 flex flex-col`}>
                    {plugin.url ? (
                        <a href={plugin.url} target='_blank' rel='noreferrer' css={tw`hover:text-gray-400`}>
                            {plugin.name} <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`ml-1 h-3 w-3`} />
                        </a>
                    ) : (
                        <p>{plugin.name}</p>
                    )}
                    <p css={tw`text-neutral-300 line-clamp-2`}>{plugin.short_description}</p>
                </div>
                {plugin.external_url ? (
                    <a
                        title='Go to external URL'
                        target='_blank'
                        rel='noreferrer'
                        css={tw`ml-auto p-2 text-sm text-neutral-400 hover:text-green-400 transition-colors duration-150`}
                        href={plugin.external_url}
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                ) : (
                    <button
                        title='Install'
                        css={tw`ml-auto p-2 text-sm text-neutral-400 hover:text-green-400 transition-colors duration-150`}
                        onClick={() => setInstallDialogVisible(true)}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </button>
                )}
            </GreyRowBox>
        </>
    );
};

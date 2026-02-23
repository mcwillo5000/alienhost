import http from '@/api/http';
import { Modpack, ModpackProvider } from '@/api/swr/getMinecraftModpacks';
import { Dialog } from '@/components/elements/dialog';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import Switch from '@/components/elements/Switch';
import useFlash from '@/plugins/useFlash';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { faDownload, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Actions, useStoreActions } from 'easy-peasy';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';

interface Props {
    provider: ModpackProvider;
    modpack: Modpack;
    className?: string;
}

interface ModpackVersion {
    id: string;
    name: string;
}

export default ({ provider, modpack, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [installDialogVisible, setInstallDialogVisible] = useState<boolean>(false);
    const [versions, setVersions] = useState<ModpackVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [deleteServerFiles, setDeleteServerFiles] = useState<boolean>(false);
    const { clearAndAddHttpError } = useFlash();
    const { addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const installModpack = () => {
        http.post(`/api/client/servers/${uuid}/minecraft-modpacks/install`, {
            provider,
            modpack_id: modpack.id,
            modpack_version_id: selectedVersion,
            delete_server_files: deleteServerFiles,
        })
            .then(() => {
                addFlash({
                    key: 'modpacks',
                    type: 'success',
                    message: 'Your server has begun the modpack installation process.',
                });
            })
            .catch((error) => {
                clearAndAddHttpError({ error, key: 'modpacks' });
            });

        setInstallDialogVisible(false);
    };

    useEffect(() => {
        if (installDialogVisible && !versions.length) {
            http.get(`/api/client/servers/${uuid}/minecraft-modpacks/versions`, {
                params: {
                    provider,
                    modpack_id: modpack.id,
                },
            })
                .then((response) => {
                    setVersions(response.data);
                    setSelectedVersion(response.data[0]?.id);
                })
                .catch((error) => {
                    clearAndAddHttpError({ error, key: 'modpacks' });
                    setInstallDialogVisible(false);
                });
        }
    }, [installDialogVisible]);

    return (
        <>
            <Dialog.Confirm
                title={'Install modpack'}
                confirm={'Install modpack'}
                open={installDialogVisible}
                onClose={() => setInstallDialogVisible(false)}
                onConfirmed={installModpack}
            >
                <p>
                    You requested the installation of the modpack &quot;{modpack.name}&quot; from the {provider}{' '}
                    provider. Please select the desired modpack version below.
                </p>
                <Label className={'mt-3'} htmlFor='modpack_version_id'>
                    Modpack version
                </Label>
                <Select
                    name='modpack_version_id'
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
                <p css={tw`mt-3`}>
                    Please note that modpack updates can cause world corruption. You are strongly advised to make a
                    backup before updating a modpack.
                </p>
                <div css={tw`mt-6 p-4 rounded`} style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}>
                    <Switch
                        defaultChecked={deleteServerFiles}
                        onChange={() => {
                            setDeleteServerFiles((s) => !s);
                        }}
                        name='delete_files'
                        label='Delete files'
                        description='Delete all your server files before installing the modpack. This is irreversible!'
                    />
                </div>
            </Dialog.Confirm>

            <div
                css={tw`flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-150`}
                style={{
                    backgroundColor: 'var(--theme-background-secondary)',
                    border: '1px solid var(--theme-border)',
                }}
            >
                <img
                    src={modpack.iconUrl ?? 'https://placehold.co/32'}
                    css={tw`rounded w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0`}
                />
                <div css={tw`flex flex-col flex-1 min-w-0`}>
                    {modpack.url ? (
                        <a
                            href={modpack.url}
                            target='_blank'
                            rel='noreferrer'
                            css={tw`text-sm font-medium truncate transition-colors duration-150`}
                            style={{ color: 'var(--theme-text-base)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-base)')}
                        >
                            {modpack.name}
                            <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`ml-1 h-2.5 w-2.5`} />
                        </a>
                    ) : (
                        <p css={tw`text-sm font-medium truncate`} style={{ color: 'var(--theme-text-base)' }}>
                            {modpack.name}
                        </p>
                    )}
                    <p css={tw`text-xs line-clamp-1 mt-0.5`} style={{ color: 'var(--theme-text-muted)' }}>
                        {modpack.description}
                    </p>
                </div>
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
            </div>
        </>
    );
};

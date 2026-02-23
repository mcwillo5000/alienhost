import React, { useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import deleteFiles from '@/api/server/files/deleteFiles';
import { ServerContext } from '@/state/server';
import { Dialog } from '@/components/elements/dialog';
import Code from '@/components/elements/Code';
import { installPlugin } from './MinecraftPluginRow';
import { InstalledMinecraftProject } from '@/api/definitions/minecraftProject';

export default ({
    plugin,
    mutate,
}: {
    plugin: InstalledMinecraftProject;
    mutate: (
        data?:
            | InstalledMinecraftProject[]
            | Promise<InstalledMinecraftProject[]>
            | ((
                  currentValue: InstalledMinecraftProject[]
              ) => Promise<InstalledMinecraftProject[]> | InstalledMinecraftProject[])
            | undefined,
        shouldRevalidate?: boolean
    ) => void;
}) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const remove = () => {
        setDeleteDialogOpen(false);
        deleteFiles(uuid, '/', [plugin.path]);
        mutate((data) => {
            return data.filter((m) => m.path !== plugin.path);
        });
    };

    const update = async () => {
        setUpdateDialogOpen(false);
        if (plugin.provider && plugin.project_id && plugin.update && plugin.update.id) {
            await deleteFiles(uuid, '/', [plugin.path]);
            await installPlugin(uuid, plugin.provider, plugin.project_id, plugin.update.id);
            mutate((data) => {
                return data.map((m) => {
                    if (m.path !== plugin.path || !plugin.update) return m;
                    return {
                        ...m,
                        version_name: plugin.update.name,
                        id: plugin.update.id,
                        update: null,
                    };
                });
            }, false);
        }
    };

    return (
        <>
            <Dialog.Confirm
                title={`Update ${plugin.project_name ?? plugin.path}`}
                confirm={'Update Plugin'}
                open={updateDialogOpen}
                onClose={() => {
                    setUpdateDialogOpen(false);
                }}
                onConfirmed={() => update()}
            >
                <p>The following procedure will take place:</p>
                <ol className='list-decimal list-inside'>
                    <li>
                        Delete <Code>{plugin.path}</Code>
                    </li>
                    <li>
                        Install &quot;{plugin.project_name}&quot; with version <Code>{plugin.update?.name ?? ''}</Code>{' '}
                        from <Code>{plugin.provider ?? ''}</Code> to <Code>plugins/</Code>.
                    </li>
                </ol>
            </Dialog.Confirm>
            <Dialog.Confirm
                title={`Remove ${plugin.project_name ?? plugin.path}`}
                confirm={'Remove Plugin'}
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                }}
                onConfirmed={() => remove()}
            >
                <p>
                    <Code>{plugin.path}</Code> will be deleted.
                </p>
            </Dialog.Confirm>
            <div
                css={tw`flex flex-col w-full p-3 rounded`}
                style={{
                    backgroundColor: 'var(--theme-background-secondary)',
                    border: '1px solid var(--theme-border)',
                }}
            >
                <div css={tw`flex flex-row items-center`}>
                        {plugin.icon_url ? (
                            <img css={tw`h-8 w-8 rounded`} src={plugin.icon_url} />
                        ) : (
                            <svg
                                css={tw`h-8 w-8`}
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
                                    stroke='var(--theme-border)'
                                    strokeWidth='5'
                                    d='M51.7 92.5V51.7L16.4 31.3l35.3 20.4L87 31.3 51.7 11 16.4 31.3v40.8l35.3 20.4L87 72V31.3L51.7 11'
                                />
                            </svg>
                        )}
                        <div css={tw`flex flex-col ml-3`}>
                            <span style={{ color: 'var(--theme-text-base)', fontSize: '0.875rem', fontWeight: 500 }}>
                                {plugin.project_name ?? plugin.path}
                            </span>
                            <span css={tw`text-sm break-all`} style={{ color: 'var(--theme-text-muted)' }}>
                                {plugin.version_name}
                            </span>
                        </div>
                        <div css={tw`flex-shrink-0 ml-auto flex`}>
                            {plugin.update && (
                                <button
                                    title='Update'
                                    css={tw`p-2 text-sm transition-colors duration-150`}
                                    style={{ color: 'var(--theme-text-muted)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                    onClick={() => setUpdateDialogOpen(true)}
                                >
                                    <FontAwesomeIcon icon={faArrowAltCircleUp} />
                                </button>
                            )}
                            <button
                                title='Remove'
                                css={tw`ml-2 p-2 text-sm transition-colors duration-150`}
                                style={{ color: 'var(--theme-text-muted)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
            </div>
        </>
    );
};

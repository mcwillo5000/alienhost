import React, { useState } from 'react';
import GreyRowBox from '@/components/elements/GreyRowBox';
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
            <GreyRowBox>
                <div className='flex flex-col w-full'>
                    <div className='flex flex-row items-center'>
                        {plugin.icon_url ? (
                            <img className='h-8 w-8' src={plugin.icon_url} />
                        ) : (
                            <svg
                                className='h-8 w-8'
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
                                    stroke='#9a9a9a'
                                    strokeWidth='5'
                                    d='M51.7 92.5V51.7L16.4 31.3l35.3 20.4L87 31.3 51.7 11 16.4 31.3v40.8l35.3 20.4L87 72V31.3L51.7 11'
                                />
                            </svg>
                        )}
                        <div className='flex flex-col ml-3'>
                            <span>{plugin.project_name ?? plugin.path}</span>
                            <span className='text-neutral-300 text-sm break-all'>{plugin.version_name}</span>
                        </div>
                        <div className='shrink-0 ml-auto'>
                            {plugin.update && (
                                <button
                                    title='Update'
                                    className='p-2 text-sm text-neutral-400 hover:text-blue-400 transition-colors duration-150'
                                    onClick={() => {
                                        setUpdateDialogOpen(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faArrowAltCircleUp} />
                                </button>
                            )}
                            <button
                                title='Remove'
                                className='ml-3 p-2 text-sm text-neutral-400 hover:text-red-400 transition-colors duration-150'
                                onClick={() => {
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                </div>
            </GreyRowBox>
        </>
    );
};

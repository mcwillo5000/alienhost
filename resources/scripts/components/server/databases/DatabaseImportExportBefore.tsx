import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/elements/button';
import tw from 'twin.macro';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { Dialog } from '@/components/elements/dialog';
import Select from '@/components/elements/Select';
import exportDatabase from './api/exportDatabase';
import importDatabase from './api/importDatabase';
import importRemoteDatabase from './api/importRemoteDatabase';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import Switch from '@/components/elements/Switch';
import { Input } from '@/components/elements/inputs';
import Label from '@/components/elements/Label';
import useSWR from 'swr';
import getData from './api/getData';

export default function DatabaseBefore() {
    const [modal, setModal] = useState<'export' | 'import'>();
    const [database, setDatabase] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [importRemote, setImportRemote] = useState(false);
    const [wipe, setWipe] = useState(false);

    const [remoteHost, setRemoteHost] = useState('');
    const [remotePort, setRemotePort] = useState(3306);
    const [remoteDatabase, setRemoteDatabase] = useState('');
    const [remoteUsername, setRemoteUsername] = useState('');
    const [remotePassword, setRemotePassword] = useState('');

    const importRef = useRef<HTMLInputElement>(null);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const databases = ServerContext.useStoreState((state) => state.databases.data);
    const databaseLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.databases);

    const { clearAndAddHttpError: errorExport } = useFlashKey('database:export-modal');
    const { clearAndAddHttpError: errorImport } = useFlashKey('database:import-modal');

    const { data } = useSWR(['databaseimportexport', uuid], () => getData(uuid), {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    useEffect(() => {
        if (modal) return;

        setDatabase(databases[0]?.id);
        errorExport();
        errorImport();
    }, [modal]);

    useEffect(() => {
        if (!remoteHost) return;

        if (remoteHost.includes('://')) {
            let rawHost = remoteHost.split('://')[1];

            if (rawHost.includes('@')) {
                const [username, host] = rawHost.split('@');

                if (username.includes(':')) {
                    const [user, pass] = username.split(':');
                    setRemoteUsername(user);
                    setRemotePassword(decodeURIComponent(pass));
                } else {
                    setRemoteUsername(username);
                }

                rawHost = host;
            }

            if (rawHost.includes(':')) {
                const data = rawHost.split(':');
                const host = data[0];
                let port = data[1];

                if (port.includes('/')) {
                    setRemoteDatabase(port.split('/')[1]);
                    port = port.split('/')[0];
                }

                setRemoteHost(host);
                setRemotePort(parseInt(port));
            } else {
                if (rawHost.includes('/')) {
                    setRemoteDatabase(rawHost.split('/')[1]);
                    rawHost = rawHost.split('/')[0];
                }

                setRemoteHost(rawHost);
                setRemotePort(3306);
            }
        }
    }, [remoteHost]);

    useEffect(() => {
        setDatabase(databases[0]?.id);
    }, [databases]);

    return (
        <>
            <Dialog title={'Export Database'} open={modal === 'export'} onClose={() => setModal(undefined)}>
                <FlashMessageRender key={'database:export-modal'} />
                <Select
                    onChange={(e) => setDatabase(e.currentTarget.value)}
                    defaultValue={database}
                    disabled={loading}
                    className={'mt-2'}
                >
                    {databases.map((db) => (
                        <option key={`${db.id}_select`} value={db.id}>
                            {db.name}
                        </option>
                    ))}
                </Select>

                <Dialog.Footer>
                    <Button.Text className={'w-full sm:w-auto'} onClick={() => setModal(undefined)}>
                        Cancel
                    </Button.Text>
                    <Button
                        className={'w-full sm:w-auto'}
                        onClick={() => {
                            setLoading(true);

                            exportDatabase(uuid, database!)
                                .then((sql) => {
                                    const element = document.createElement('a');
                                    element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(sql)}`;
                                    element.download = `${databases.find((db) => db.id === database)?.name}.sql`;
                                    element.click();
                                    element.remove();

                                    setModal(undefined);
                                })
                                .catch((error) => {
                                    console.error(error);
                                    errorExport(error);
                                })
                                .finally(() => setLoading(false));
                        }}
                        disabled={!database || loading}
                    >
                        Export Database to SQL
                    </Button>
                </Dialog.Footer>
            </Dialog>
            <Dialog title={'Import Database'} open={modal === 'import'} onClose={() => setModal(undefined)}>
                <FlashMessageRender key={'database:import-modal'} />

                <Select
                    onChange={(e) => setDatabase(e.currentTarget.value)}
                    defaultValue={database}
                    disabled={loading}
                    className={'mt-2'}
                >
                    {databases.map((db) => (
                        <option key={db.id + '_select'} value={db.id}>
                            {db.name}
                        </option>
                    ))}
                </Select>

                <div className={'mt-4 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded'}>
                    <Switch
                        name={'wipe_database'}
                        label={'Wipe Database'}
                        description={
                            'This will remove all existing data from the selected database before importing the new data.'
                        }
                        onChange={(e) => setWipe(e.currentTarget.checked)}
                        readOnly={loading}
                    />
                </div>

                {!data?.disableRemoteImport && (
                    <div className={'mt-4 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded'}>
                        <Switch
                            name={'remote_import'}
                            label={'Remote Import'}
                            description={
                                'This will allow you to import a database from a remote host. This is useful if you have a large database that you do not want to download and then upload to the panel.'
                            }
                            onChange={(e) => setImportRemote(e.currentTarget.checked)}
                            readOnly={loading}
                        />
                    </div>
                )}

                {importRemote && (
                    <div className={'mt-4 w-full grid grid-cols-1 md:grid-rows-1 md:grid-cols-2 gap-2'}>
                        <div className={'flex flex-col'}>
                            <Label>Remote Host</Label>
                            <Input.Text
                                type={'text'}
                                value={remoteHost}
                                onChange={(e) => setRemoteHost(e.currentTarget.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={'flex flex-col'}>
                            <Label>Remote Port</Label>
                            <Input.Text
                                type={'number'}
                                value={remotePort}
                                onChange={(e) => setRemotePort(parseInt(e.currentTarget.value))}
                                disabled={loading}
                            />
                        </div>

                        <div className={'flex flex-col'}>
                            <Label>Remote Database</Label>
                            <Input.Text
                                type={'text'}
                                value={remoteDatabase}
                                onChange={(e) => setRemoteDatabase(e.currentTarget.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={'flex flex-col'}>
                            <Label>Remote Username</Label>
                            <Input.Text
                                type={'text'}
                                value={remoteUsername}
                                onChange={(e) => setRemoteUsername(e.currentTarget.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className={'flex flex-col col-span-full'}>
                            <Label>Remote Password</Label>
                            <Input.Text
                                type={'password'}
                                value={remotePassword}
                                onChange={(e) => setRemotePassword(e.currentTarget.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                )}

                <input ref={importRef} type={'file'} accept={'.sql'} hidden />

                <Dialog.Footer>
                    <Button.Text className={'w-full sm:w-auto'} onClick={() => setModal(undefined)}>
                        Cancel
                    </Button.Text>
                    <Button
                        className={'w-full sm:w-auto'}
                        onClick={() => {
                            setLoading(true);

                            if (importRemote) {
                                importRemoteDatabase(
                                    uuid,
                                    database!,
                                    remoteHost,
                                    remotePort,
                                    remoteDatabase,
                                    remoteUsername,
                                    remotePassword,
                                    wipe
                                )
                                    .then(() => {
                                        setModal(undefined);

                                        setImportRemote(false);
                                        setRemoteHost('');
                                        setRemotePort(3306);
                                        setRemoteDatabase('');
                                        setRemoteUsername('');
                                        setRemotePassword('');
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        errorImport(error);
                                    })
                                    .finally(() => setLoading(false));

                                return;
                            }

                            importRef.current!.click();
                            importRef.current!.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files![0];
                                if (!file) return;

                                file.text().then((sql) => {
                                    importDatabase(uuid, database!, sql, wipe)
                                        .then(() => setModal(undefined))
                                        .catch((error) => {
                                            console.error(error);
                                            errorImport(error);
                                        })
                                        .finally(() => setLoading(false));
                                });
                            };

                            importRef.current!.addEventListener('cancel', () => {
                                setLoading(false);
                            });
                        }}
                        disabled={!database || loading}
                    >
                        Import {importRemote ? 'Remote' : 'Local'} SQL into Database
                    </Button>
                </Dialog.Footer>
            </Dialog>

            <Can action={'database.view_password'}>
                {databaseLimit > 0 && (
                    <div css={tw`mb-6 flex flex-row flex-wrap items-center justify-end`}>
                        <Button
                            css={tw`mx-1 mb-1 flex justify-start md:flex-grow-0 flex-grow`}
                            onClick={() => setModal('export')}
                            disabled={!databases.length}
                        >
                            Export Database to SQL
                        </Button>
                        <Button
                            css={tw`mx-1 mb-1 flex justify-start md:flex-grow-0 flex-grow`}
                            onClick={() => setModal('import')}
                            disabled={!databases.length}
                        >
                            Import SQL into Database
                        </Button>
                    </div>
                )}
            </Can>
        </>
    );
}

import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import Fade from '@/components/elements/Fade';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';
import compressFiles from '@/api/server/files/compressFiles';
import { ServerContext } from '@/state/server';
import deleteFiles from '@/api/server/files/deleteFiles';
import RenameFileModal from '@/components/server/files/RenameFileModal';
import Portal from '@/components/elements/Portal';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt, faFileArchive, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const MassActionsBar = () => {
    const { t } = useTranslation();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMove, setShowMove] = useState(false);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const selectedFiles = ServerContext.useStoreState((state) => state.files.selectedFiles);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    useEffect(() => {
        if (!loading) setLoadingMessage('');
    }, [loading]);

    const onClickCompress = () => {
        setLoading(true);
        clearFlashes('files');
        setLoadingMessage(t('files.massActions.archiving'));

        compressFiles(uuid, directory, selectedFiles)
            .then(() => mutate())
            .then(() => setSelectedFiles([]))
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setLoading(false));
    };

    const onClickConfirmDeletion = () => {
        setLoading(true);
        setShowConfirm(false);
        clearFlashes('files');
        setLoadingMessage(t('files.massActions.deleting'));

        deleteFiles(uuid, directory, selectedFiles)
            .then(() => {
                mutate((files) => files.filter((f) => selectedFiles.indexOf(f.name) < 0), false);
                setSelectedFiles([]);
            })
            .catch((error) => {
                mutate();
                clearAndAddHttpError({ key: 'files', error });
            })
            .then(() => setLoading(false));
    };

    return (
        <>
            <div css={tw`pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center`}>
                <SpinnerOverlay visible={loading} size={'large'} fixed>
                    {loadingMessage}
                </SpinnerOverlay>
                <Dialog.Confirm
                    title={t('files.massActions.deleteConfirm.title')}
                    open={showConfirm}
                    confirm={t('files.massActions.deleteConfirm.confirm')}
                    onClose={() => setShowConfirm(false)}
                    onConfirmed={onClickConfirmDeletion}
                >
                    <p className={'mb-2'}>
                        {t('files.massActions.deleteConfirm.message')}&nbsp;
                        <span className={'font-semibold'} style={{ color: 'var(--theme-text-base)' }}>{selectedFiles.length} {t('files.massActions.deleteConfirm.files')}</span>? {t('files.massActions.deleteConfirm.permanent')}
                    </p>
                    {selectedFiles.slice(0, 15).map((file) => (
                        <li key={file}>{file}</li>
                    ))}
                    {selectedFiles.length > 15 && <li>{t('files.massActions.deleteConfirm.andOthers', { count: selectedFiles.length - 15 })}</li>}
                </Dialog.Confirm>
                {showMove && (
                    <RenameFileModal
                        files={selectedFiles}
                        visible
                        appear
                        useMoveTerminology
                        onDismissed={() => setShowMove(false)}
                    />
                )}
                <Portal>
                    <div className={'pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50'}>
                        <Fade timeout={75} in={selectedFiles.length > 0} unmountOnExit>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                pointerEvents: 'auto',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                backgroundColor: 'var(--theme-background-secondary)',
                                border: '1px solid var(--theme-border)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                maxWidth: '90vw',
                                width: 'auto'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    <Button 
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Primary}
                                        onClick={() => setShowMove(true)}
                                        style={{
                                            minWidth: '80px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faArrowsAlt} className="mr-1" />
                                        {t('files.massActions.move')}
                                    </Button>
                                    <Button 
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Primary}
                                        onClick={onClickCompress}
                                        style={{
                                            minWidth: '80px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faFileArchive} className="mr-1" />
                                        {t('files.massActions.compress')}
                                    </Button>
                                    <Button.Danger 
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Primary} 
                                        onClick={() => setShowConfirm(true)}
                                        style={{
                                            minWidth: '80px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                        {t('files.massActions.delete')}
                                    </Button.Danger>
                                </div>
                            </div>
                        </Fade>
                    </div>
                </Portal>
            </div>
        </>
    );
};

export default MassActionsBar;

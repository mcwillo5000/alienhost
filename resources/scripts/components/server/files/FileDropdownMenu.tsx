import React, { memo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxOpen,
    faCopy,
    faEllipsisH,
    faFileArchive,
    faFileCode,
    faFileDownload,
    faLevelUpAlt,
    faPencilAlt,
    faTrashAlt,
    faHistory,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import RenameFileModal from '@/components/server/files/RenameFileModal';
import { ServerContext } from '@/state/server';
import { join } from '@/lib/path';
import deleteFiles from '@/api/server/files/deleteFiles';
import restoreFiles from '@/api/server/files/restoreFiles';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import copyFile from '@/api/server/files/copyFile';
import Can from '@/components/elements/Can';
import getFileDownloadUrl from '@/api/server/files/getFileDownloadUrl';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import { FileObject } from '@/api/server/files/loadDirectory';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import DropdownMenu from '@/components/elements/DropdownMenu';
import styled from 'styled-components/macro';
import useEventListener from '@/plugins/useEventListener';
import compressFiles from '@/api/server/files/compressFiles';
import decompressFiles from '@/api/server/files/decompressFiles';
import isEqual from 'react-fast-compare';
import ChmodFileModal from '@/components/server/files/ChmodFileModal';
import { Dialog } from '@/components/elements/dialog';
import { useTranslation } from 'react-i18next';

type ModalType = 'rename' | 'move' | 'chmod';

const StyledRow = styled.div<{ $danger?: boolean }>`
    padding: 0.5rem;
    display: flex;
    align-items: center;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--theme-text-base);
    transition: all 0.15s ease;
    cursor: pointer;
    
    &:hover {
        background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
        color: var(--theme-text-base);
    }
    
    ${(props) =>
        props.$danger && `
        &:hover {
            background: color-mix(in srgb, #ef4444 8%, transparent);
            color: var(--theme-text-base);
        }
    `};
`;

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: IconDefinition;
    title: string;
    $danger?: boolean;
}

const Row = ({ icon, title, ...props }: RowProps) => (
    <StyledRow {...props}>
        <FontAwesomeIcon 
            icon={icon} 
            className="text-xs" 
            fixedWidth 
            style={{ color: 'var(--theme-text-muted)' }} 
        />
        <span className="ml-2" style={{ color: 'var(--theme-text-base)' }}>{title}</span>
    </StyledRow>
);

const DotsButton = styled.div`
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    color: var(--theme-text-muted);
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
        color: var(--theme-primary);
    }
`;

const FileDropdownMenu = ({ file }: { file: FileObject }) => {
    const { t } = useTranslation();
    const onClickRef = useRef<DropdownMenu>(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [modal, setModal] = useState<ModalType | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearAndAddHttpError, clearFlashes } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    useEventListener(`pterodactyl:files:ctx:${file.key}`, (e: CustomEvent) => {
        if (onClickRef.current) {
            const detail = e.detail;
            if (typeof detail === 'object' && detail.x !== undefined) {
                onClickRef.current.triggerMenu(detail.x, detail.y);
            } else {
                onClickRef.current.triggerMenu(detail);
            }
        }
    });

    const doDeletion = () => {
        clearFlashes('files');

        mutate((files) => files.filter((f) => f.key !== file.key), false);

        deleteFiles(uuid, directory, [file.name]).catch((error) => {
            mutate();
            clearAndAddHttpError({ key: 'files', error });
        });
    };

    const doRestore = () => {
        if (!file.trashId) return;
        clearFlashes('files');
        mutate((files) => files.filter((f) => f.key !== file.key), false);
        restoreFiles(uuid, [file.trashId]).catch((error) => {
            mutate();
            clearAndAddHttpError({ key: 'files', error });
        });
    };

    const doCopy = () => {
        setShowSpinner(true);
        clearFlashes('files');

        copyFile(uuid, join(directory, file.name))
            .then(() => mutate())
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    const doDownload = () => {
        setShowSpinner(true);
        clearFlashes('files');

        getFileDownloadUrl(uuid, join(directory, file.name))
            .then((url) => {
                
                window.location = url;
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    const doArchive = () => {
        setShowSpinner(true);
        clearFlashes('files');

        compressFiles(uuid, directory, [file.name])
            .then(() => mutate())
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    const doUnarchive = () => {
        setShowSpinner(true);
        clearFlashes('files');

        decompressFiles(uuid, directory, file.name)
            .then(() => mutate())
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    return (
        <>
            <Dialog.Confirm
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                title={t('files.dropdown.deleteConfirm.title', { type: file.isFile ? t('files.dropdown.deleteConfirm.file') : t('files.dropdown.deleteConfirm.directory') })}
                confirm={t('files.dropdown.deleteConfirm.confirm')}
                onConfirmed={doDeletion}
            >
                {t('files.dropdown.deleteConfirm.message')}&nbsp;
                <span className={'font-semibold'} style={{ color: 'var(--theme-text-base)' }}>{file.name}</span> once deleted.
            </Dialog.Confirm>
            <DropdownMenu
                ref={onClickRef}
                renderToggle={(onClick) => (
                    <DotsButton onClick={onClick}>
                        <FontAwesomeIcon icon={faEllipsisH} />
                        {modal ? (
                            modal === 'chmod' ? (
                                <ChmodFileModal
                                    visible
                                    appear
                                    files={[{ file: file.name, mode: file.modeBits }]}
                                    onDismissed={() => setModal(null)}
                                />
                            ) : (
                                <RenameFileModal
                                    visible
                                    appear
                                    files={[file.name]}
                                    useMoveTerminology={modal === 'move'}
                                    onDismissed={() => setModal(null)}
                                />
                            )
                        ) : null}
                        <SpinnerOverlay visible={showSpinner} fixed size={'large'} />
                    </DotsButton>
                )}
            >
                {file.isTrash ? (
                    <Can action={'file.delete'}>
                        <Row onClick={doRestore} icon={faHistory} title={'Restore'} />
                        <Row onClick={() => setShowConfirmation(true)} icon={faTrashAlt} title={'Delete Permanently'} $danger />
                    </Can>
                ) : (
                    <>
                        <Can action={'file.update'}>
                            <Row onClick={() => setModal('rename')} icon={faPencilAlt} title={t('files.dropdown.rename')} />
                            <Row onClick={() => setModal('move')} icon={faLevelUpAlt} title={t('files.dropdown.move')} />
                            <Row onClick={() => setModal('chmod')} icon={faFileCode} title={t('files.dropdown.chmod')} />
                        </Can>
                        {file.isFile && (
                            <Can action={'file.create'}>
                                <Row onClick={doCopy} icon={faCopy} title={t('files.dropdown.copy')} />
                            </Can>
                        )}
                        {file.isArchiveType() ? (
                            <Can action={'file.create'}>
                                <Row onClick={doUnarchive} icon={faBoxOpen} title={t('files.dropdown.decompress')} />
                            </Can>
                        ) : (
                            <Can action={'file.archive'}>
                                <Row onClick={doArchive} icon={faFileArchive} title={t('files.dropdown.compress')} />
                            </Can>
                        )}
                        {file.isFile && <Row onClick={doDownload} icon={faFileDownload} title={t('files.dropdown.download')} />}
                        <Can action={'file.delete'}>
                            <Row onClick={() => setShowConfirmation(true)} icon={faTrashAlt} title={t('files.dropdown.delete')} $danger />
                        </Can>
                    </>
                )}
            </DropdownMenu>
        </>
    );
};

export default memo(FileDropdownMenu, isEqual);

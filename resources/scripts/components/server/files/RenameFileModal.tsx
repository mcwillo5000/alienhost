import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { join } from '@/lib/path';
import renameFiles from '@/api/server/files/renameFiles';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';
import { useTranslation } from 'react-i18next';

interface FormikValues {
    name: string;
}

type OwnProps = RequiredModalProps & { files: string[]; useMoveTerminology?: boolean };

const RenameFileModal = ({ files, useMoveTerminology, ...props }: OwnProps) => {
    const { t } = useTranslation();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    const submit = ({ name }: FormikValues, { setSubmitting }: FormikHelpers<FormikValues>) => {
        clearFlashes('files');

        const len = name.split('/').length;
        if (files.length === 1) {
            if (!useMoveTerminology && len === 1) {
                
                mutate((data) => data.map((f) => (f.name === files[0] ? { ...f, name } : f)), false);
            } else if (useMoveTerminology || len > 1) {
                
                mutate((data) => data.filter((f) => f.name !== files[0]), false);
            }
        }

        let data;
        if (useMoveTerminology && files.length > 1) {
            data = files.map((f) => ({ from: f, to: join(name, f) }));
        } else {
            data = files.map((f) => ({ from: f, to: name }));
        }

        renameFiles(uuid, directory, data)
            .then((): Promise<any> => (files.length > 0 ? mutate() : Promise.resolve()))
            .then(() => setSelectedFiles([]))
            .catch((error) => {
                mutate();
                setSubmitting(false);
                clearAndAddHttpError({ key: 'files', error });
            })
            .then(() => props.onDismissed());
    };

    const pointsToTrash = (values: FormikValues) =>
        join(directory, values.name)
            .replace(/^(\.\.\/|\/)+/, '')
            .startsWith('.trash');

    return (
        <Formik onSubmit={submit} initialValues={{ name: files.length > 1 ? '' : files[0] || '' }}>
            {({ isSubmitting, values }) => (
                <Modal {...props} dismissable={!isSubmitting} showSpinnerOverlay={isSubmitting}>
                    <Form css={tw`m-0`}>
                        <div css={[tw`flex flex-wrap`, useMoveTerminology ? tw`items-center` : tw`items-end`]}>
                            <div css={tw`w-full sm:flex-1 sm:mr-4`}>
                                <Field
                                    type={'string'}
                                    id={'file_name'}
                                    name={'name'}
                                    label={t('files.renameModal.title')}
                                    description={
                                        useMoveTerminology
                                            ? t('files.renameModal.description')
                                            : undefined
                                    }
                                    autoFocus
                                />
                            </div>
                            <div css={tw`w-full sm:w-auto mt-4 sm:mt-0`}>
                                <Button disabled={pointsToTrash(values)} css={tw`w-full`}>{useMoveTerminology ? t('files.renameModal.move') : t('files.renameModal.rename')}</Button>
                            </div>
                        </div>
                        {pointsToTrash(values) && (
                            <p css={tw`text-xs mt-2 text-gray-300`}>
                                You cannot move this file into the Trash manually.
                            </p>
                        )}
                        {useMoveTerminology && (
                            <p css={[tw`text-xs mt-2`, { color: 'var(--theme-text-muted)' }]}>
                                <strong css={{ color: 'var(--theme-text-base)' }}>{t('files.renameModal.newLocation')}</strong>
                                &nbsp;/home/container/{join(directory, values.name).replace(/^(\.\.\/|\/)+/, '')}
                            </p>
                        )}
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default RenameFileModal;

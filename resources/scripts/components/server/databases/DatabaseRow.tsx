import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerContext } from '@/state/server';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import { httpErrorToHuman } from '@/api/http';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import Can from '@/components/elements/Can';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import { Button as NewButton } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import GreyRowBox from '@/components/elements/GreyRowBox';
import CopyOnClick from '@/components/elements/CopyOnClick';
import getTokenDatabase from '@/api/server/databases/getTokenDatabase';
import { useTranslation } from 'react-i18next';

interface Props {
    database: ServerDatabase;
    className?: string;
}

export default ({ database, className }: Props) => {
    const { t } = useTranslation();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);
    const removeDatabase = ServerContext.useStoreActions((actions) => actions.databases.removeDatabase);

    const openpmaURL = () => {
        getTokenDatabase(uuid, database.id)
            .then(data => {
                if (data) {
                    const now = new Date();
                    now.setTime(now.getTime() + (2 * 60 * 1000));
                    document.cookie = data['cookie_name'] + '=' + data['encryption'] + ';expires=' + now.toUTCString() + ';domain=' + data['cookie_domain'] + ';path=/';
                    const newWindow = window.open(data['url'], '_blank', 'noopener,noreferrer');
                    if (newWindow) newWindow.opener = null;
                }
            })
            .catch(error => {
                console.error(error);
            });
    };

    const jdbcConnectionString = `jdbc:mysql://${database.username}${
        database.password ? `:${encodeURIComponent(database.password)}` : ''
    }@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('The database name must be provided.')
            .oneOf([database.name.split('_', 2)[1], database.name], 'The database name must be provided.'),
    });

    const submit = (values: { confirm: string }, { setSubmitting }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        deleteServerDatabase(uuid, database.id)
            .then(() => {
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addError({ key: 'database:delete', message: httpErrorToHuman(error) });
            });
    };

    return (
        <>
            <Formik onSubmit={submit} initialValues={{ confirm: '' }} validationSchema={schema} isInitialValid={false}>
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                    >
                        <FlashMessageRender byKey={'database:delete'} css={tw`mb-6`} />
                        <h2 css={tw`text-2xl mb-6`} style={{ color: 'var(--theme-text-base)' }}>{t('databases.delete.title')}</h2>
                        <p css={tw`text-sm`} style={{ color: 'var(--theme-text-base)' }}>
                            {t('databases.delete.description')} <strong>{database.name}</strong> {t('databases.delete.description2')}
                        </p>
                        <Form css={tw`m-0 mt-6`}>
                            <Field
                                type={'text'}
                                id={'confirm_name'}
                                name={'confirm'}
                                label={t('databases.delete.confirmName')}
                                description={t('databases.delete.confirmDescription')}
                            />
                            <div css={tw`mt-6 text-right`}>
                                <NewButton 
                                    type={'button'} 
                                    variant={Options.Variant.Secondary}
                                    size={Options.Size.Compact}
                                    css={tw`mr-2`} 
                                    onClick={() => setVisible(false)}
                                >
                                    {t('databases.delete.cancel')}
                                </NewButton>
                                <NewButton 
                                    type={'submit'} 
                                    variant={Options.Variant.Primary}
                                    size={Options.Size.Compact}
                                    disabled={!isValid}
                                >
                                    {t('databases.delete.deleteButton')}
                                </NewButton>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Modal visible={connectionVisible} onDismissed={() => setConnectionVisible(false)}>
                <FlashMessageRender byKey={'database-connection-modal'} css={tw`mb-6`} />
                <h3 css={tw`mb-6 text-2xl`} style={{ color: 'var(--theme-text-base)' }}>{t('databases.connection.title')}</h3>
                <div>
                    <Label>{t('databases.connection.endpoint')}</Label>
                    <CopyOnClick text={database.connectionString}>
                        <Input type={'text'} readOnly value={database.connectionString} />
                    </CopyOnClick>
                </div>
                <div css={tw`mt-6`}>
                    <Label>{t('databases.connection.connectionsFrom')}</Label>
                    <Input type={'text'} readOnly value={database.allowConnectionsFrom} />
                </div>
                <div css={tw`mt-6`}>
                    <Label>{t('databases.connection.username')}</Label>
                    <CopyOnClick text={database.username}>
                        <Input type={'text'} readOnly value={database.username} />
                    </CopyOnClick>
                </div>
                <Can action={'database.view_password'}>
                    <div css={tw`mt-6`}>
                        <Label>{t('databases.connection.password')}</Label>
                        <CopyOnClick text={database.password} showInNotification={false}>
                            <Input type={'text'} readOnly value={database.password} />
                        </CopyOnClick>
                    </div>
                </Can>
                <div css={tw`mt-6`}>
                    <Label>{t('databases.connection.jdbcString')}</Label>
                    <CopyOnClick text={jdbcConnectionString} showInNotification={false}>
                        <Input type={'text'} readOnly value={jdbcConnectionString} />
                    </CopyOnClick>
                </div>
                <div css={tw`mt-6 text-right`}>
                    <Can action={'database.update'}>
                        <RotatePasswordButton databaseId={database.id} onUpdate={appendDatabase} />
                    </Can>
                    <NewButton 
                        variant={Options.Variant.Secondary}
                        size={Options.Size.Compact}
                        onClick={() => setConnectionVisible(false)}
                    >
                        {t('databases.connection.close')}
                    </NewButton>
                </div>
            </Modal>
            <GreyRowBox $hoverable={false} className={className} css={tw`mb-2`}>
                <div css={tw`hidden md:block`}>
                    <FontAwesomeIcon icon={faDatabase} fixedWidth />
                </div>
                <div css={tw`flex-1 ml-4`}>
                    <CopyOnClick text={database.name}>
                        <p css={tw`text-lg`} style={{ color: 'var(--theme-text-base)' }}>{database.name}</p>
                    </CopyOnClick>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={database.connectionString}>
                        <p css={tw`text-sm`} style={{ color: 'var(--theme-text-base)' }}>{database.connectionString}</p>
                    </CopyOnClick>
                    <p css={tw`mt-1 text-2xs uppercase select-none`} style={{ color: 'var(--theme-text-muted)' }}>{t('databases.connection.endpoint')}</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <p css={tw`text-sm`} style={{ color: 'var(--theme-text-base)' }}>{database.allowConnectionsFrom}</p>
                    <p css={tw`mt-1 text-2xs uppercase select-none`} style={{ color: 'var(--theme-text-muted)' }}>{t('databases.connection.connectionsFrom')}</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={database.username}>
                        <p css={tw`text-sm`} style={{ color: 'var(--theme-text-base)' }}>{database.username}</p>
                    </CopyOnClick>
                    <p css={tw`mt-1 text-2xs uppercase select-none`} style={{ color: 'var(--theme-text-muted)' }}>{t('databases.connection.username')}</p>
                </div>
                <div css={tw`ml-8`}>
                    <NewButton 
                        variant={Options.Variant.Secondary}
                        size={Options.Size.Compact}
                        css={tw`mr-2`} 
                        onClick={() => setConnectionVisible(true)}
                    >
                        <FontAwesomeIcon icon={faEye} fixedWidth />
                    </NewButton>
                    {database.allowConnectionsFrom === '%' ? (
                        <Can action={'database.view_on_phpmyadmin'}>
                            <NewButton
                                variant={Options.Variant.Secondary}
                                size={Options.Size.Compact}
                                css={tw`mr-2`}
                                onClick={openpmaURL}
                            >
                                <FontAwesomeIcon icon={faDatabase} fixedWidth />
                            </NewButton>
                        </Can>
                    ) : null}
                    <Can action={'database.delete'}>
                        <NewButton 
                            variant={Options.Variant.Primary}
                            size={Options.Size.Compact}
                            onClick={() => setVisible(true)}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} fixedWidth />
                        </NewButton>
                    </Can>
                </div>
            </GreyRowBox>
        </>
    );
};

import React, { useEffect, useState } from 'react';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import CreateApiKeyForm from '@/components/dashboard/forms/CreateApiKeyForm';
import getApiKeys, { ApiKey } from '@/api/account/getApiKeys';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import deleteApiKey from '@/api/account/deleteApiKey';
import FlashMessageRender from '@/components/FlashMessageRender';
import { format } from 'date-fns';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import { useTranslation } from 'react-i18next';

export default () => {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const { clearAndAddHttpError } = useFlashKey('account');
    const { t } = useTranslation();

    useEffect(() => {
        getApiKeys()
            .then((keys) => setKeys(keys))
            .then(() => setLoading(false))
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const doDeletion = (identifier: string) => {
        setLoading(true);

        clearAndAddHttpError();
        deleteApiKey(identifier)
            .then(() => setKeys((s) => [...(s || []).filter((key) => key.identifier !== identifier)]))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setDeleteIdentifier('');
            });
    };

    return (
        <PageContentBlock title={t('account.api.title')}>
            <FlashMessageRender byKey={'account'} />
            <div css={tw`md:flex flex-nowrap my-10`}>
                <FuturisticContentBox title={t('account.api.createKey.title')} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateApiKeyForm onKeyCreated={(key: ApiKey) => setKeys((s: ApiKey[]) => [...s!, key])} />
                </FuturisticContentBox>
                <FuturisticContentBox title={t('account.api.keys.title')} css={tw`flex-1 overflow-hidden mt-8 md:mt-0 md:ml-8`}>
                    <SpinnerOverlay visible={loading} />
                    <Dialog.Confirm
                        title={t('account.api.keys.deleteConfirm.title')}
                        confirm={t('account.api.keys.deleteConfirm.confirm')}
                        open={!!deleteIdentifier}
                        onClose={() => setDeleteIdentifier('')}
                        onConfirmed={() => doDeletion(deleteIdentifier)}
                    >
                        {t('account.api.keys.deleteConfirm.message', { identifier: deleteIdentifier })}
                    </Dialog.Confirm>
                    {keys.length === 0 ? (
                        <p 
                            css={tw`text-center text-sm`}
                            style={{ color: 'var(--theme-text-muted)' }}
                        >
                            {loading ? t('account.api.keys.loading') : t('account.api.keys.none')}
                        </p>
                    ) : (
                        keys.map((key, index) => (
                            <GreyRowBox
                                key={key.identifier}
                                css={[
                                    tw`flex items-center`,
                                    index > 0 && tw`mt-2`,
                                    {
                                        backgroundColor: 'var(--theme-background-secondary)',
                                        borderColor: 'var(--theme-border)',
                                    }
                                ]}
                            >
                                <FontAwesomeIcon 
                                    icon={faKey} 
                                    css={tw`text-neutral-300`}
                                    style={{ color: 'var(--theme-text-muted)' }}
                                />
                                <div css={tw`ml-4 flex-1 overflow-hidden`}>
                                    <p 
                                        css={tw`text-sm break-words`}
                                        style={{ color: 'var(--theme-text-base)' }}
                                    >
                                        {key.description}
                                    </p>
                                    <p 
                                        css={tw`text-2xs uppercase`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                    >
                                        {t('account.api.keys.lastUsed')}:&nbsp;
                                        {key.lastUsedAt ? format(key.lastUsedAt, 'MMM do, yyyy HH:mm') : t('account.api.keys.never')}
                                    </p>
                                </div>
                                <p css={tw`text-sm ml-4 hidden md:block`}>
                                    <code 
                                        css={tw`font-mono py-1 px-2 rounded`}
                                        style={{
                                            backgroundColor: 'var(--theme-background)',
                                            color: 'var(--theme-text-base)',
                                            border: '1px solid var(--theme-border)',
                                        }}
                                    >
                                        {key.identifier}
                                    </code>
                                </p>
                                <button 
                                    css={tw`ml-4 p-2 text-sm transition-colors duration-150`} 
                                    onClick={() => setDeleteIdentifier(key.identifier)}
                                    style={{ color: 'var(--theme-text-muted)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-danger)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </GreyRowBox>
                        ))
                    )}
                </FuturisticContentBox>
            </div>
        </PageContentBlock>
    );
};
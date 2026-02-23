import React, { useEffect } from 'react';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { useSSHKeys } from '@/api/account/ssh-keys';
import { useFlashKey } from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import CreateSSHKeyForm from '@/components/dashboard/ssh/CreateSSHKeyForm';
import DeleteSSHKeyButton from '@/components/dashboard/ssh/DeleteSSHKeyButton';
import { useTranslation } from 'react-i18next';

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const { data, isValidating, error } = useSSHKeys({
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });
    const { t } = useTranslation();

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={t('account.ssh.title')}>
            <FlashMessageRender byKey={'account'} />
            <div css={tw`md:flex flex-nowrap my-10`}>
                <FuturisticContentBox title={t('account.ssh.addKey.title')} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateSSHKeyForm />
                </FuturisticContentBox>
                <FuturisticContentBox title={t('account.ssh.keys.title')} css={tw`flex-1 overflow-hidden mt-8 md:mt-0 md:ml-8`}>
                    <SpinnerOverlay visible={!data && isValidating} />
                    {!data || !data.length ? (
                        <p 
                            css={tw`text-center text-sm`}
                            style={{ color: 'var(--theme-text-muted)' }}
                        >
                            {!data ? t('account.ssh.keys.loading') : t('account.ssh.keys.none')}
                        </p>
                    ) : (
                        data.map((key, index) => (
                            <GreyRowBox
                                key={key.fingerprint}
                                css={[
                                    tw`flex space-x-4 items-center`, 
                                    index > 0 && tw`mt-2`,
                                    {
                                        backgroundColor: 'var(--theme-background-secondary)',
                                        borderColor: 'var(--theme-border)',
                                    }
                                ]}
                            >
                                <FontAwesomeIcon 
                                    icon={faKey} 
                                    style={{ color: 'var(--theme-text-muted)' }}
                                />
                                <div css={tw`flex-1`}>
                                    <p 
                                        css={tw`text-sm break-words font-medium`}
                                        style={{ color: 'var(--theme-text-base)' }}
                                    >
                                        {key.name}
                                    </p>
                                    <p 
                                        css={tw`text-xs mt-1 font-mono truncate`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                    >
                                        SHA256:{key.fingerprint}
                                    </p>
                                    <p 
                                        css={tw`text-xs mt-1 uppercase`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                    >
                                        {t('account.ssh.keys.addedOn')}:&nbsp;
                                        {format(key.createdAt, 'MMM do, yyyy HH:mm')}
                                    </p>
                                </div>
                                <DeleteSSHKeyButton name={key.name} fingerprint={key.fingerprint} />
                            </GreyRowBox>
                        ))
                    )}
                </FuturisticContentBox>
            </div>
        </PageContentBlock>
    );
};

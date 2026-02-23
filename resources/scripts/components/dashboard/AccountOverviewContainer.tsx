import * as React from 'react';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import styled from 'styled-components/macro';
import MessageBox from '@/components/MessageBox';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
    ${tw`flex flex-wrap`};

    & > div {
        ${tw`w-full`};

        ${breakpoint('sm')`
      width: calc(50% - 1rem);
    `}

        ${breakpoint('md')`
      ${tw`w-auto flex-1`};
    `}
    }
`;

export default () => {
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();
    const { t } = useTranslation();

    return (
        <PageContentBlock title={t('account.overview.title')}>
            {state?.twoFactorRedirect && (
                <MessageBox title={t('account.overview.twoFactorRequired.title')} type={'error'}>
                    {t('account.overview.twoFactorRequired.message')}
                </MessageBox>
            )}

            <Container css={[tw`lg:grid lg:grid-cols-3 mb-10`, state?.twoFactorRedirect ? tw`mt-4` : tw`mt-10`]}>
                <FuturisticContentBox title={t('account.password.title')} showFlashes={'account:password'}>
                    <UpdatePasswordForm />
                </FuturisticContentBox>
                <FuturisticContentBox css={tw`mt-8 sm:mt-0 sm:ml-8`} title={t('account.email.title')} showFlashes={'account:email'}>
                    <UpdateEmailAddressForm />
                </FuturisticContentBox>
                <FuturisticContentBox css={tw`md:ml-8 mt-8 md:mt-0`} title={t('account.twoFactor.title')}>
                    <ConfigureTwoFactorForm />
                </FuturisticContentBox>
            </Container>
        </PageContentBlock>
    );
};
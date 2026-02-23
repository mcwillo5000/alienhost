import React, { useState } from 'react';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import FuturisticFormButton from '@/components/elements/rivion/FuturisticFormButton';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    return (
        <>
            <EditSubuserModal visible={visible} onModalDismissed={() => setVisible(false)} />
            <FuturisticFormButton 
                onClick={() => setVisible(true)}
            >
                {t('users.newUser')}
            </FuturisticFormButton>
        </>
    );
};

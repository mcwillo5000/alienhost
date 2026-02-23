import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { useFlashKey } from '@/plugins/useFlash';
import { deleteSSHKey, useSSHKeys } from '@/api/account/ssh-keys';
import { Dialog } from '@/components/elements/dialog';
import Code from '@/components/elements/Code';
import { useTranslation } from 'react-i18next';

export default ({ name, fingerprint }: { name: string; fingerprint: string }) => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const [visible, setVisible] = useState(false);
    const { mutate } = useSSHKeys();
    const { t } = useTranslation();

    const onClick = () => {
        clearAndAddHttpError();

        Promise.all([
            mutate((data) => data?.filter((value) => value.fingerprint !== fingerprint), false),
            deleteSSHKey(fingerprint),
        ]).catch((error) => {
            mutate(undefined, true).catch(console.error);
            clearAndAddHttpError(error);
        });
    };

    return (
        <>
            <Dialog.Confirm
                open={visible}
                title={t('account.ssh.keys.deleteConfirm.title')}
                confirm={t('account.ssh.keys.deleteConfirm.confirm')}
                onConfirmed={onClick}
                onClose={() => setVisible(false)}
            >
                {t('account.ssh.keys.deleteConfirm.message', { name })}
            </Dialog.Confirm>
            <button 
                css={tw`ml-4 p-2 text-sm transition-colors duration-150`} 
                onClick={() => setVisible(true)}
                style={{ color: 'var(--theme-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-danger)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
            >
                <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        </>
    );
};

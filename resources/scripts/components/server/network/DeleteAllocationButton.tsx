import React, { useState } from 'react';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ServerContext } from '@/state/server';
import deleteServerAllocation from '@/api/server/network/deleteServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { useFlashKey } from '@/plugins/useFlash';
import { Dialog } from '@/components/elements/dialog';
import { useTranslation } from 'react-i18next';

interface Props {
    allocation: number;
}

const DeleteAllocationButton = ({ allocation }: Props) => {
    const { t } = useTranslation();
    const [confirm, setConfirm] = useState(false);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    const { mutate } = getServerAllocations();
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');

    const deleteAllocation = () => {
        clearFlashes();

        mutate((data) => data?.filter((a) => a.id !== allocation), false);
        setServerFromState((s) => ({ ...s, allocations: s.allocations.filter((a) => a.id !== allocation) }));

        deleteServerAllocation(uuid, allocation).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <>
            <Dialog.Confirm
                open={confirm}
                onClose={() => setConfirm(false)}
                title={t('network.deleteAllocation.title')}
                confirm={t('network.deleteAllocation.confirm')}
                onConfirmed={deleteAllocation}
            >
                {t('network.deleteAllocation.description')}
            </Dialog.Confirm>
            <Button.Danger
                size={Options.Size.Small}
                onClick={() => setConfirm(true)}
                css={tw`flex items-center justify-center w-8 h-8 p-0`}
            >
                <FontAwesomeIcon icon={faTrashAlt} css={tw`w-3 h-3`} />
            </Button.Danger>
        </>
    );
};

export default DeleteAllocationButton;

import React, { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/components/elements/InputSpinner';
import { Textarea } from '@/components/elements/Input';
import Can from '@/components/elements/Can';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Allocation } from '@/api/server/getServer';
import styled from 'styled-components/macro';
import { debounce } from 'debounce';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import DeleteAllocationButton from '@/components/server/network/DeleteAllocationButton';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { ip } from '@/lib/formatters';
import Code from '@/components/elements/Code';
import { useTranslation } from 'react-i18next';

const Label = styled.label`
    ${tw`uppercase text-xs mt-1 block px-1 select-none transition-colors duration-150`}
    color: var(--theme-text-muted);
`;

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const setAllocationNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setServerAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const setPrimaryAllocation = () => {
        clearFlashes();
        mutate((data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryServerAllocation(uuid, allocation.id).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <GreyRowBox $hoverable={false} className={'flex-wrap md:flex-nowrap mt-2'}>
            <div className={'flex items-center w-full md:w-auto'}>
                <div className={'pl-4 pr-6'} style={{ color: 'var(--theme-text-muted)' }}>
                    <FontAwesomeIcon icon={faNetworkWired} />
                </div>
                <div className={'mr-4 flex-1 md:w-40'}>
                    {allocation.alias ? (
                        <CopyOnClick text={allocation.alias}>
                            <Code dark className={'w-40 truncate'}>
                                {allocation.alias}
                            </Code>
                        </CopyOnClick>
                    ) : (
                        <CopyOnClick text={ip(allocation.ip)}>
                            <Code dark>{ip(allocation.ip)}</Code>
                        </CopyOnClick>
                    )}
                    <Label>{allocation.alias ? t('network.hostname') : t('network.ipAddress')}</Label>
                </div>
                <div className={'w-16 md:w-24 overflow-hidden'}>
                    <Code dark>{allocation.port}</Code>
                    <Label>{t('network.port')}</Label>
                </div>
            </div>
            <div className={'mt-4 w-full md:mt-0 md:flex-1 md:w-auto'}>
                <InputSpinner visible={loading}>
                    <Textarea
                        placeholder={t('network.notes')}
                        defaultValue={allocation.notes || undefined}
                        onChange={(e) => setAllocationNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>
            <div className={'flex justify-end space-x-2 mt-4 w-full md:mt-0 md:w-48'}>
                {allocation.isDefault ? (
                    <Button 
                        size={Options.Size.Small} 
                        variant={Options.Variant.Primary}
                        disabled
                    >
                        {t('network.primary')}
                    </Button>
                ) : (
                    <>
                        <Can action={'allocation.delete'}>
                            <DeleteAllocationButton allocation={allocation.id} />
                        </Can>
                        <Can action={'allocation.update'}>
                            <Button 
                                size={Options.Size.Small} 
                                variant={Options.Variant.Secondary}
                                onClick={setPrimaryAllocation}
                            >
                                {t('network.makePrimary')}
                            </Button>
                        </Can>
                    </>
                )}
            </div>
        </GreyRowBox>
    );
};

export default memo(AllocationRow, isEqual);

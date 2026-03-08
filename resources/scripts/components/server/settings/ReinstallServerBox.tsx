import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import reinstallServer, { ReinstallType } from '@/api/server/reinstallServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import { useTranslation } from 'react-i18next';
import Select from '@/components/elements/Select';

interface ReinstallOption {
    value: ReinstallType;
    label: string;
    confirmMessage: string;
}

const reinstallOptions: ReinstallOption[] = [
    {
        value: 'keep_files',
        label: 'Keep current files and reinstall server',
        confirmMessage: 'The server will be reinstalled while keeping all existing files.'
    },
    {
        value: 'delete_files',
        label: 'Factory reset Server (Reset all files)',
        confirmMessage: 'ALL FILES on the server will be PERMANENTLY DELETED before reinstalling!'
    },
    {
        value: 'factory_reset',
        label: 'Factory Reset Server (Reset all files and startup variables)',
        confirmMessage: 'ALL FILES will be DELETED and STARTUP VARIABLES will be RESET to defaults!'
    },
];

export default () => {
    const { t } = useTranslation('arix/server/settings');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [reinstallType, setReinstallType] = useState<ReinstallType>('keep_files');
    const [isLoading, setIsLoading] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const selectedOption = reinstallOptions.find(opt => opt.value === reinstallType) || reinstallOptions[0];

    const handleProceedToConfirm = () => {
        setModalVisible(false);
        setTimeout(() => {
            setConfirmModalVisible(true);
        }, 200);
    };

    const reinstall = () => {
        clearFlashes('settings');
        setIsLoading(true);
        reinstallServer(uuid, reinstallType)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Server reinstallation process has started.',
                });
            })
            .catch((error) => {
                console.error(error);
                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .finally(() => {
                setIsLoading(false);
                setConfirmModalVisible(false);
                setReinstallType('keep_files');
            });
    };

    const handleClose = () => {
        setModalVisible(false);
        setReinstallType('keep_files');
    };

    const handleConfirmClose = () => {
        setConfirmModalVisible(false);
        setTimeout(() => {
            setModalVisible(true);
        }, 200);
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <TitledGreyBox title={'Reinstall Server'} css={tw`relative`}>
            <Dialog
                open={modalVisible}
                onClose={handleClose}
                title={'Confirm server reinstallation'}
            >
                <div css={tw`mt-2`}>
                    <p css={tw`text-sm text-neutral-300`}>
                        Your server will be stopped and some files may be deleted or modified during this process.
                        Are you sure you want to continue?
                    </p>

                    <div css={tw`mt-6`}>
                        <label css={tw`block text-sm font-medium text-neutral-200 mb-2`}>
                            What do you want to do with the files on the server?
                        </label>

                        <Select
                            value={reinstallType}
                            onChange={(e) => setReinstallType(e.target.value as ReinstallType)}
                            css={tw`w-full`}
                            style={{
                                backgroundColor: 'var(--theme-background-secondary)',
                                borderColor: 'var(--theme-border)',
                                color: 'var(--theme-text-base)'
                            }}
                        >
                            {reinstallOptions.filter((option) => option.value !== 'factory_reset').map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <Dialog.Footer>
                    <Button.Text onClick={handleClose}>
                        Cancel
                    </Button.Text>
                    <Button.Danger onClick={handleProceedToConfirm}>
                        Continue
                    </Button.Danger>
                </Dialog.Footer>
            </Dialog>

            <Dialog
                open={confirmModalVisible}
                onClose={handleConfirmClose}
                title={'Final confirmation'}
            >
                <div css={tw`mt-2`}>
                    <div css={tw`p-4 bg-red-500/20 border border-red-500/50 rounded-lg mb-4`}>
                        <p css={tw`text-sm text-red-200 font-medium`}>
                            ⚠️ Warning
                        </p>
                        <p css={tw`text-sm text-red-100 mt-1`}>
                            {selectedOption.confirmMessage}
                        </p>
                    </div>

                    <p css={tw`text-sm text-neutral-300`}>
                        You have selected: <strong css={tw`text-neutral-100`}>{selectedOption.label}</strong>
                    </p>
                    <p css={tw`text-sm text-neutral-400 mt-2`}>
                        This action cannot be undone. Are you sure you want to continue?
                    </p>
                </div>

                <Dialog.Footer>
                    <Button.Text onClick={handleConfirmClose} disabled={isLoading}>
                        Go back
                    </Button.Text>
                    <Button.Danger onClick={reinstall} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Confirm reinstall'}
                    </Button.Danger>
                </Dialog.Footer>
            </Dialog>

            <p css={tw`text-sm`}>
                Reinstalling the server will stop it and then run the initial installation script again.&nbsp;
                <strong css={tw`font-medium`}>
                    Some files may be deleted or modified during this process, please back up your data before continuing.
                </strong>
            </p>
            <div css={tw`mt-6 text-right`}>
                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setModalVisible(true)}>
                    Reinstall Server
                </Button.Danger>
            </div>
        </TitledGreyBox>
    );
};

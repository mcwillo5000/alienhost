import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRedo, faStop, faSkull } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface PowerButtonProps {
    className?: string;
}

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const { t } = useTranslation();

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={className}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={t('console.power.killConfirm.title')}
                confirm={t('console.power.killConfirm.confirm')}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                {t('console.power.killConfirm.message')}
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <Button
                    className={'flex-1'}
                    size={Options.Size.Compact}
                    variant={Options.Variant.Start}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    <FontAwesomeIcon icon={faPlay} className="mr-1" />
                    {t('console.power.start')}
                </Button>
            </Can>
            <Can action={'control.restart'}>
                <Button
                    className={'flex-1'}
                    size={Options.Size.Compact}
                    variant={Options.Variant.Restart}
                    disabled={!status}
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    <FontAwesomeIcon icon={faRedo} className="mr-1" />
                    {t('console.power.restart')}
                </Button>
            </Can>
            <Can action={'control.stop'}>
                <Button
                    className={'flex-1'}
                    size={Options.Size.Compact}
                    variant={killable ? Options.Variant.Kill : Options.Variant.Stop}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    <FontAwesomeIcon icon={killable ? faSkull : faStop} className="mr-1" />
                    {killable ? t('console.power.kill') : t('console.power.stop')}
                </Button>
            </Can>
        </div>
    );
};

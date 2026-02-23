import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import Fade from '@/components/elements/Fade';
import Portal from '@/components/elements/Portal';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRedo, faStop, faSkull } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import setServerPowerState from '@/api/server/power';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import useFlash from '@/plugins/useFlash';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

interface PowerActionsBarProps {
    server: Server | null;
    visible: boolean;
    onClose: () => void;
}

const PowerActionsBar = ({ server, visible, onClose }: PowerActionsBarProps) => {
    const [showKillConfirm, setShowKillConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const { addFlash, clearFlashes } = useFlash();

    const getStats = () =>
        getServerResourceUsage(server?.uuid || '')
            .then((data: any) => setStats(data))
            .catch((error: any) => console.error('PowerActionsBar: Failed to fetch server stats', error));

    useEffect(() => {
        if (server && visible) {
            getStats();
            const interval = setInterval(getStats, 10000);
            return () => clearInterval(interval);
        }
        return undefined;
    }, [server?.uuid, visible]);

    const serverStatus = server?.status || 'offline';
    const isSuspended = stats?.isSuspended || serverStatus === 'suspended';
    const isTransferring = server?.isTransferring || false;
    
    const powerState = stats?.status; 
    
    let actualServerState: 'offline' | 'running' | 'unavailable';
    
    if (isSuspended || isTransferring || serverStatus === 'installing' || serverStatus === 'restoring_backup') {
        actualServerState = 'unavailable';
    } else if (!powerState || powerState === 'offline') {
        actualServerState = 'offline';
    } else {
        actualServerState = 'running'; 
    }
     
    const canStart = actualServerState === 'offline';
    const canRestart = actualServerState === 'running'; 
    const canStop = actualServerState === 'running';
    const showKillButton = false; 
    
    const getStatusDisplay = () => {
        if (isSuspended) return 'Suspended';
        if (isTransferring) return 'Transferring';
        if (serverStatus === 'installing') return 'Installing';
        if (serverStatus === 'restoring_backup') return 'Restoring Backup';
        
        if (!powerState || powerState === 'offline') return 'Offline';
        if (powerState === 'running') return 'Online';
        
        return 'Starting'; 
    };

    const sendPowerCommand = (action: PowerAction): Promise<void> => {
        if (!server) return Promise.reject('No server selected');
        
        clearFlashes('dashboard:power');
        return setServerPowerState(server.uuid, action)
            .then(() => {
                addFlash({
                    key: 'dashboard:power',
                    type: 'success',
                    message: `Server ${action} command sent successfully.`,
                });
            })
            .catch((error: any) => {
                addFlash({
                    key: 'dashboard:power',
                    type: 'error',
                    message: error.message || 'An error occurred while sending the power command.',
                });
                throw error;
            });
    };

    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        e.stopPropagation();
        
        if (action === 'kill') {
            return setShowKillConfirm(true);
        }

        setIsLoading(true);
        
        const powerAction = action === 'kill-confirmed' ? 'kill' : action as PowerAction;
        
        sendPowerCommand(powerAction)
            .then(() => {
                setTimeout(onClose, 1000);
            })
            .catch(() => {
            })
            .finally(() => {
                setIsLoading(false);
                setShowKillConfirm(false);
            });
    };

    useEffect(() => {
        if (actualServerState === 'offline') {
            setShowKillConfirm(false);
        }
    }, [actualServerState]);

    if (!server) return null;

    return (
        <>
            <Dialog.Confirm
                open={showKillConfirm}
                hideCloseIcon
                onClose={() => setShowKillConfirm(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(null, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            
            <div css={tw`pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center px-4`}>
                <Portal>
                    <div className={'pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50 px-4'}>
                        <Fade timeout={75} in={visible} unmountOnExit>
                            <div>
                                {/* Desktop Layout */}
                                <div css={tw`hidden md:flex`} style={{
                                    alignItems: 'center',
                                    gap: '1rem',
                                    pointerEvents: 'auto',
                                    borderRadius: '0.5rem',
                                    padding: '1rem 1.5rem',
                                    backgroundColor: 'var(--theme-background-secondary)',
                                    border: '1px solid var(--theme-border)',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                                    minWidth: '20rem'
                                }}>
                                {/* Server info */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    marginRight: '1rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--theme-text-base)',
                                        lineHeight: 1.2
                                    }}>
                                        {server.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--theme-text-muted)',
                                        textTransform: 'capitalize'
                                    }}>
                                        Status: {getStatusDisplay()}
                                    </span>
                                </div>

                                {/* Power action buttons */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <Button
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Start}
                                        disabled={!canStart || isLoading}
                                        onClick={onButtonClick.bind(null, 'start')}
                                    >
                                        <FontAwesomeIcon icon={faPlay} className="mr-1" />
                                        Start
                                    </Button>
                                    
                                    <Button
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Restart}
                                        disabled={!canRestart || isLoading}
                                        onClick={onButtonClick.bind(null, 'restart')}
                                    >
                                        <FontAwesomeIcon icon={faRedo} className="mr-1" />
                                        Restart
                                    </Button>
                                    
                                    <Button
                                        size={Options.Size.Compact}
                                        variant={showKillButton ? Options.Variant.Kill : Options.Variant.Stop}
                                        disabled={!canStop || isLoading}
                                        onClick={onButtonClick.bind(null, showKillButton ? 'kill' : 'stop')}
                                    >
                                        <FontAwesomeIcon icon={showKillButton ? faSkull : faStop} className="mr-1" />
                                        {showKillButton ? 'Kill' : 'Stop'}
                                    </Button>
                                </div>

                                {/* Close button */}
                                <Button
                                    size={Options.Size.Compact}
                                    variant={Options.Variant.Secondary}
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    Close
                                </Button>
                            </div>

                            {/* Mobile Layout */}
                            <div css={tw`flex md:hidden`} style={{
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                gap: '0.75rem',
                                pointerEvents: 'auto',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                backgroundColor: 'var(--theme-background-secondary)',
                                border: '1px solid var(--theme-border)',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                                width: '100%',
                                maxWidth: '24rem'
                            }}>
                                {/* Server info */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    paddingBottom: '0.5rem',
                                    borderBottom: '1px solid var(--theme-border)'
                                }}>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'var(--theme-text-base)',
                                        lineHeight: 1.3,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {server.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--theme-text-muted)',
                                        textTransform: 'capitalize'
                                    }}>
                                        Status: {getStatusDisplay()}
                                    </span>
                                </div>

                                {/* Power action buttons - horizontal row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '0.5rem'
                                }}>
                                    <Button
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Start}
                                        disabled={!canStart || isLoading}
                                        onClick={onButtonClick.bind(null, 'start')}
                                        css={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        <FontAwesomeIcon icon={faPlay} className="mr-1" />
                                        Start
                                    </Button>
                                    
                                    <Button
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Restart}
                                        disabled={!canRestart || isLoading}
                                        onClick={onButtonClick.bind(null, 'restart')}
                                        css={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        <FontAwesomeIcon icon={faRedo} className="mr-1" />
                                        Restart
                                    </Button>
                                    
                                    <Button
                                        size={Options.Size.Compact}
                                        variant={showKillButton ? Options.Variant.Kill : Options.Variant.Stop}
                                        disabled={!canStop || isLoading}
                                        onClick={onButtonClick.bind(null, showKillButton ? 'kill' : 'stop')}
                                        css={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        <FontAwesomeIcon icon={showKillButton ? faSkull : faStop} className="mr-1" />
                                        {showKillButton ? 'Kill' : 'Stop'}
                                    </Button>
                                </div>

                                {/* Close button - full width at bottom */}
                                <Button
                                    size={Options.Size.Compact}
                                    variant={Options.Variant.Secondary}
                                    onClick={onClose}
                                    disabled={isLoading}
                                    css={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Close
                                </Button>
                            </div>
                            </div>
                        </Fade>
                    </div>
                </Portal>
            </div>
        </>
    );
};

export default PowerActionsBar;
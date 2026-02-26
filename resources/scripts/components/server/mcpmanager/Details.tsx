import React, { useState, useContext, useEffect } from 'react';
import { Player, PlayerItemsResponse, WorldInfo, FastQueryResponse } from '@/api/server/mcpmanager';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';
import asDialog from '@/hoc/asDialog';
import GiveItem from './GiveItem';
import {
    faBan,
    faUserCheck,
    faUserShield,
    faTrash,
    faGamepad,
    faSkull,
    faCopy,
    faBoxOpen,
    faHeartbeat,
    faBroom,
    faPlus,
    faMinus,
    faHandRock,
    faCommentDots,
    faMapMarkerAlt,
    faBolt,
    faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/elements/button';
import Select from '@/components/elements/Select';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { Field as FormikField } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import PlayerInventory from './Inventory';
import PlayerStats from './Stats';
import PlayerDetailsTabs from './DetailsTabs';
import Advancements from './Advancements';
import {
    banPlayer,
    unbanPlayer,
    whitelistPlayer,
    unwhitelistPlayer,
    opPlayer,
    deopPlayer,
    clearPlayerInventory,
    wipePlayerData,
    changePlayerGamemode,
    banIp,
    unbanIp,
    giveItem,
    addEffect,
    clearEffect,
    kickPlayerWithReason,
    whisperPlayer,
    teleportPlayer,
    killPlayer,
    modifyPlayerStat,
} from '@/api/server/mcpmanager';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Switch from '@/components/elements/Switch';
import * as Yup from 'yup';
interface Props {
    player: Player;
    serverUuid: string;
    onRefresh: () => void;
    playerItems: PlayerItemsResponse | null;
    worlds: WorldInfo[];
    selectedWorld: string;
    onWorldChange: (world: string) => void;
    rootAdmin: boolean;
    fastQueryData: FastQueryResponse | null;
    onModalStateChange?: (isModalOpen: boolean) => void;
}
const getStatusStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
        padding: '0.125rem 0.625rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        marginRight: '0.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'Orbitron', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
    };
    switch (status) {
        case 'online': return { ...base, backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
        case 'banned': return { ...base, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
        case 'whitelisted': return { ...base, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
        case 'op': return { ...base, backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' };
        default: return { ...base, backgroundColor: 'rgba(115, 115, 115, 0.15)', color: 'var(--theme-text-muted)', border: '1px solid var(--theme-border)' };
    }
};
const PlayerDetails: React.FC<Props> = ({
    player,
    serverUuid,
    onRefresh,
    playerItems,
    worlds,
    selectedWorld,
    onWorldChange,
    rootAdmin,
    fastQueryData,
    onModalStateChange,
}) => {
    const [showBanModal, setShowBanModal] = useState<boolean>(false);
    const [showKickModal, setShowKickModal] = useState<boolean>(false);
    const [showWhisperModal, setShowWhisperModal] = useState<boolean>(false);
    const [showTeleportModal, setShowTeleportModal] = useState<boolean>(false);
    const [showGamemodeModal, setShowGamemodeModal] = useState<boolean>(false);
    const [showBanIpModal, setShowBanIpModal] = useState<boolean>(false);
    const [showGiveItemModal, setShowGiveItemModal] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [selectedSlotType, setSelectedSlotType] = useState<string | null>(null);
    const [showAddEffectModal, setShowAddEffectModal] = useState<boolean>(false);
    const [showOpModal, setShowOpModal] = useState<boolean>(false);
    const [showKillModal, setShowKillModal] = useState<boolean>(false);
    const [showClearInventoryModal, setShowClearInventoryModal] = useState<boolean>(false);
    const [showWipeDataModal, setShowWipeDataModal] = useState<boolean>(false);
    const isAnyModalOpen =
        showBanModal ||
        showKickModal ||
        showWhisperModal ||
        showTeleportModal ||
        showGamemodeModal ||
        showBanIpModal ||
        showGiveItemModal ||
        showAddEffectModal ||
        showOpModal ||
        showKillModal ||
        showClearInventoryModal ||
        showWipeDataModal;
    useEffect(() => {
        if (onModalStateChange) {
            onModalStateChange(isAnyModalOpen);
        }
    }, [isAnyModalOpen, onModalStateChange]);
    const [loading, setLoading] = useState<string | null>(null);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const flashKey = `player-details-${player.uuid || player.name}`;
    const [isBanned, setIsBanned] = useState(
        fastQueryData?.players?.banned?.some((p) => (p.uuid && p.uuid === player.uuid) || p.name === player.name) ||
            false
    );
    const [isIpBanned, setIsIpBanned] = useState(false);
    const [isWhitelisted, setIsWhitelisted] = useState(
        fastQueryData?.players?.whitelisted?.some(
            (p) => (p.uuid && p.uuid === player.uuid) || p.name === player.name
        ) || false
    );
    const [isOp, setIsOp] = useState(
        fastQueryData?.players?.ops?.some((p) => (p.uuid && p.uuid === player.uuid) || p.name === player.name) || false
    );
    useEffect(() => {
        setIsBanned(
            fastQueryData?.players?.banned?.some((p) => (p.uuid && p.uuid === player.uuid) || p.name === player.name) ||
                false
        );
        setIsWhitelisted(
            fastQueryData?.players?.whitelisted?.some(
                (p) => (p.uuid && p.uuid === player.uuid) || p.name === player.name
            ) || false
        );
        setIsOp(
            fastQueryData?.players?.ops?.some((p) => (p.uuid && p.uuid === player.uuid) || p.name === player.name) ||
                false
        );
    }, [fastQueryData, player]);
    const isOnline = fastQueryData?.players?.online?.some((p) => p.name === player.name) || false;
    const handleModifyStat = async (stat: 'health' | 'hunger' | 'experience', amount: number) => {
        setLoading(`modify-${stat}`);
        clearFlashes(flashKey);
        try {
            await modifyPlayerStat(serverUuid, player.uuid || '', player.name, stat, amount);
            addFlash({ key: flashKey, type: 'success', message: `Successfully modified ${stat} for ${player.name}.` });
            onRefresh();
        } catch (error) {
            clearAndAddHttpError({ key: flashKey, error });
        } finally {
            setLoading(null);
        }
    };
    const handlePlayerAction = async (action: string, data?: any) => {
        setLoading(action);
        clearFlashes(flashKey);
        try {
            const uuid = player.uuid || 'unknown';
            let message = '';
            switch (action) {
                case 'unban':
                    await unbanPlayer(serverUuid, uuid);
                    message = `Successfully unbanned player ${player.name}.`;
                    setIsBanned(false);
                    break;
                case 'unbanIp':
                    await unbanIp(serverUuid, uuid, player.ip || '');
                    message = `Successfully unbanned IP for player ${player.name}.`;
                    setIsIpBanned(false);
                    break;
                case 'whitelist':
                    await whitelistPlayer(serverUuid, uuid, player.name);
                    message = `Successfully whitelisted player ${player.name}.`;
                    setIsWhitelisted(true);
                    break;
                case 'unwhitelist':
                    await unwhitelistPlayer(serverUuid, uuid, player.name);
                    message = `Successfully removed ${player.name} from whitelist.`;
                    setIsWhitelisted(false);
                    break;
                case 'op':
                    await opPlayer(serverUuid, uuid, player.name);
                    message = `Successfully made ${player.name} an operator.`;
                    setIsOp(true);
                    break;
                case 'deop':
                    await deopPlayer(serverUuid, uuid, player.name);
                    message = `Successfully removed operator status from ${player.name}.`;
                    setIsOp(false);
                    break;
                case 'kill':
                    await killPlayer(serverUuid, player.name);
                    message = `Successfully killed player ${player.name}.`;
                    break;
                case 'clearInventory':
                    await clearPlayerInventory(serverUuid, uuid, player.name);
                    message = `Successfully cleared inventory for ${player.name}.`;
                    break;
                case 'wipeData':
                    await wipePlayerData(serverUuid, uuid, player.name);
                    message = `Successfully wiped all data for player ${player.name}.`;
                    break;
                case 'unbanIp':
                    await unbanIp(serverUuid, player.uuid || '', player.ip || '');
                    message = `Successfully unbanned IP for player ${player.name}.`;
                    break;
                case 'clearEffect':
                    await clearEffect(serverUuid, uuid, player.name);
                    message = `Successfully cleared all effects from player ${player.name}.`;
                    break;
            }
            if (message) {
                addFlash({ key: flashKey, type: 'success', message });
            }
            onRefresh();
        } catch (error) {
            clearAndAddHttpError({ key: flashKey, error });
        } finally {
            setLoading(null);
        }
    };
    const BanIpDialog = asDialog({ title: 'Ban IP Address' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const submit = (values: { reason: string }, { setSubmitting }: any) => {
            clearFlashes(flashKey);
            banIp(serverUuid, player.uuid || '', player.name, values.reason)
                .then(() => {
                    addFlash({
                        key: flashKey,
                        type: 'success',
                        message: `Successfully banned IP for player ${player.name}.`,
                    });
                    setIsIpBanned(true);
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik onSubmit={submit} initialValues={{ reason: '' }}>
                {({ submitForm, isSubmitting }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <Field autoFocus id='reason' name='reason' label='Ban IP Reason' />
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Ban IP
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const BanPlayerDialog = asDialog({ title: 'Ban Player' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const submit = (values: { reason: string }, { setSubmitting }: any) => {
            clearFlashes(flashKey);
            banPlayer(serverUuid, player.uuid || '', player.name, values.reason)
                .then(() => {
                    addFlash({ key: flashKey, type: 'success', message: `Successfully banned player ${player.name}.` });
                    setIsBanned(true);
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik onSubmit={submit} initialValues={{ reason: '' }}>
                {({ submitForm, isSubmitting }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <Field autoFocus id='reason' name='reason' label='Ban Reason' />
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Ban Player
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const KickPlayerDialog = asDialog({ title: 'Kick Player' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const submit = (values: { reason: string }, { setSubmitting }: any) => {
            clearFlashes(flashKey);
            kickPlayerWithReason(serverUuid, player.name, values.reason)
                .then(() => {
                    addFlash({ key: flashKey, type: 'success', message: `Successfully kicked player ${player.name}.` });
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik onSubmit={submit} initialValues={{ reason: '' }}>
                {({ submitForm, isSubmitting }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <Field autoFocus id='reason' name='reason' label='Kick Reason' />
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Kick Player
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const WhisperPlayerDialog = asDialog({ title: 'Send Message' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const submit = (values: { message: string }, { setSubmitting }: any) => {
            clearFlashes(flashKey);
            whisperPlayer(serverUuid, player.name, values.message)
                .then(() => {
                    addFlash({ key: flashKey, type: 'success', message: `Message sent to ${player.name}.` });
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik onSubmit={submit} initialValues={{ message: '' }}>
                {({ submitForm, isSubmitting }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <Field autoFocus id='message' name='message' label='Message' />
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Send
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const TeleportPlayerDialog = asDialog({ title: 'Teleport Player' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const [teleportMode, setTeleportMode] = useState<'player' | 'coordinates'>('player');
        const submit = (values: { targetPlayer: string; x: string; y: string; z: string }, { setSubmitting }: any) => {
            clearFlashes(flashKey);
            let target: string;
            if (teleportMode === 'player') {
                target = values.targetPlayer;
            } else {
                const x = parseFloat(values.x);
                const y = parseFloat(values.y);
                const z = parseFloat(values.z);
                if (isNaN(x) || isNaN(y) || isNaN(z)) {
                    setSubmitting(false);
                    addFlash({ key: flashKey, type: 'error', message: 'Please enter valid coordinates.' });
                    return;
                }
                target = `${x} ${y} ${z}`;
            }
            teleportPlayer(serverUuid, player.name, target)
                .then(() => {
                    addFlash({
                        key: flashKey,
                        type: 'success',
                        message:
                            teleportMode === 'player'
                                ? `Teleported ${player.name} to ${values.targetPlayer}.`
                                : `Teleported ${player.name} to coordinates ${target}.`,
                    });
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        const onlinePlayers = fastQueryData?.players?.online || [];
        const availablePlayers = onlinePlayers.filter((p) => p.name !== player.name);
        return (
            <Formik
                onSubmit={submit}
                initialValues={{
                    targetPlayer: availablePlayers.length > 0 ? availablePlayers[0].name : '',
                    x: '0',
                    y: '64',
                    z: '0',
                }}
            >
                {({ submitForm, isSubmitting, values, setFieldValue }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <Switch
                                    name='teleportMode'
                                    label='Teleport to coordinates'
                                    description='Toggle to teleport to specific coordinates instead of a player'
                                    defaultChecked={teleportMode === 'coordinates'}
                                    onChange={(e) => setTeleportMode(e.target.checked ? 'coordinates' : 'player')}
                                />
                            </div>
                            {teleportMode === 'player' ? (
                                <FormikField name='targetPlayer'>
                                    {({ field, form }: any) => (
                                        <Select
                                            {...field}
                                            label='Target Player'
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                form.setFieldValue(field.name, e.target.value);
                                            }}
                                            disabled={availablePlayers.length === 0}
                                        >
                                            {availablePlayers.length === 0 ? (
                                                <option value=''>No other players online</option>
                                            ) : (
                                                availablePlayers.map((p) => (
                                                    <option key={p.name} value={p.name}>
                                                        {p.name}
                                                    </option>
                                                ))
                                            )}
                                        </Select>
                                    )}
                                </FormikField>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        <Field
                                            id='x'
                                            name='x'
                                            label='X Coordinate'
                                            type='text'
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                                    setFieldValue('x', value);
                                                }
                                            }}
                                        />
                                        <Field
                                            id='y'
                                            name='y'
                                            label='Y Coordinate'
                                            type='text'
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                                    setFieldValue('y', value);
                                                }
                                            }}
                                        />
                                        <Field
                                            id='z'
                                            name='z'
                                            label='Z Coordinate'
                                            type='text'
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                                    setFieldValue('z', value);
                                                }
                                            }}
                                        />
                                    </div>
                                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.75rem', fontFamily: "'Electrolize', sans-serif" }}>
                                        Enter coordinates where you want to teleport the player. Only numbers and
                                        negative signs are allowed.
                                    </p>
                                </div>
                            )}
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button
                                onClick={submitForm}
                                disabled={isSubmitting || (teleportMode === 'player' && availablePlayers.length === 0)}
                            >
                                Teleport
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const GamemodePlayerDialog = asDialog({ title: 'Change Gamemode' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const submit = (values: { gamemode: string }, { setSubmitting }: any) => {
            clearFlashes(flashKey);
            changePlayerGamemode(serverUuid, player.uuid || '', parseInt(values.gamemode), player.name)
                .then(() => {
                    addFlash({ key: flashKey, type: 'success', message: `Gamemode changed for ${player.name}.` });
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik onSubmit={submit} initialValues={{ gamemode: player.gamemode?.toString() || '0' }}>
                {({ submitForm, isSubmitting }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <FormikField name='gamemode'>
                                {({ field, form }: any) => (
                                    <Select
                                        {...field}
                                        label='Gamemode'
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            form.setFieldValue(field.name, e.target.value);
                                        }}
                                    >
                                        <option value='0'>Survival</option>
                                        <option value='1'>Creative</option>
                                        <option value='2'>Adventure</option>
                                        <option value='3'>Spectator</option>
                                    </Select>
                                )}
                            </FormikField>
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Change Gamemode
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    interface GiveItemDialogProps {
        slot: number | null;
        type: string | null;
    }
    const GiveItemDialog = asDialog({ title: 'Give Item' })(({ slot, type }: GiveItemDialogProps) => {
        console.log('Rendering GiveItemDialog with slot:', slot, 'and type:', type);
        const GiveItemSchema = Yup.object().shape({
            item: Yup.string().required('An item ID is required.'),
            quantity: Yup.number().min(1, 'Quantity must be at least 1.').required('A quantity is required.'),
        });
        const { close } = useContext(DialogWrapperContext);
        const submit = (values: { target: string; item: string; quantity: string }, { setSubmitting }: any) => {
            console.log('Submitting give item with slot:', slot, 'and type:', type);
            clearFlashes(flashKey);
            giveItem(
                serverUuid,
                player.uuid || '',
                values.target,
                values.item,
                parseInt(values.quantity),
                0,
                slot,
                type
            )
                .then(() => {
                    addFlash({
                        key: flashKey,
                        type: 'success',
                        message: `Successfully gave ${values.quantity} of ${values.item} to ${values.target}.`,
                    });
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik
                onSubmit={submit}
                initialValues={{ target: player.name, item: '', quantity: '1' }}
                validationSchema={GiveItemSchema}
            >
                {({ submitForm, isSubmitting, values, setFieldValue, errors }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <FormikField as={Select} name='target' label='Target'>
                                <option value={player.name}>Selected Player ({player.name})</option>
                                <option value='@a'>All Players</option>
                            </FormikField>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flexGrow: 1 }}>
                                    <GiveItem
                                        nama='item'
                                        value={values.item}
                                        onChange={(value) => setFieldValue('item', value)}
                                        onSelect={(item) => setFieldValue('item', item.nama)}
                                        serverVersion={fastQueryData?.info.version?.name}
                                        placeholder='Search for an item...'
                                        label='Item ID'
                                        description='e.g., stone, diamond_sword, apple'
                                        hasError={!!errors.item}
                                        error={errors.item}
                                    />
                                </div>
                                <div style={{ width: '25%' }}>
                                    <Field id='quantity' name='quantity' label='Quantity' type='number' />
                                </div>
                            </div>
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Give Item
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const OpPlayerDialog = asDialog({ title: 'Op Player' })(() => {
        const { close } = useContext(DialogWrapperContext);
        return (
            <>
                <p>Are you sure you want to make {player.name} an operator?</p>
                <Dialog.Footer>
                    <Button.Text onClick={close}>Cancel</Button.Text>
                    <Button.Danger onClick={() => handlePlayerAction('op').then(close)}>Op Player</Button.Danger>
                </Dialog.Footer>
            </>
        );
    });
    const KillPlayerDialog = asDialog({ title: 'Kill Player' })(() => {
        const { close } = useContext(DialogWrapperContext);
        return (
            <>
                <p>Are you sure you want to kill {player.name}?</p>
                <Dialog.Footer>
                    <Button.Text onClick={close}>Cancel</Button.Text>
                    <Button.Danger onClick={() => handlePlayerAction('kill').then(close)}>Kill Player</Button.Danger>
                </Dialog.Footer>
            </>
        );
    });
    const ClearInventoryDialog = asDialog({ title: 'Clear Inventory' })(() => {
        const { close } = useContext(DialogWrapperContext);
        return (
            <>
                <p>Are you sure you want to clear the inventory for {player.name}?</p>
                <Dialog.Footer>
                    <Button.Text onClick={close}>Cancel</Button.Text>
                    <Button.Danger onClick={() => handlePlayerAction('clearInventory').then(close)}>
                        Clear Inventory
                    </Button.Danger>
                </Dialog.Footer>
            </>
        );
    });
    const WipeDataDialog = asDialog({ title: 'Wipe Player Data' })(() => {
        const { close } = useContext(DialogWrapperContext);
        return (
            <>
                <p>Are you sure you want to wipe all data for {player.name}? This cannot be undone.</p>
                <Dialog.Footer>
                    <Button.Text onClick={close}>Cancel</Button.Text>
                    <Button.Danger onClick={() => handlePlayerAction('wipeData').then(close)}>Wipe Data</Button.Danger>
                </Dialog.Footer>
            </>
        );
    });
    const AddEffectDialog = asDialog({ title: 'Add Effect' })(() => {
        const { close } = useContext(DialogWrapperContext);
        const submit = (
            values: { target: string; effect: string; duration: string; amplifier: string },
            { setSubmitting }: any
        ) => {
            clearFlashes(flashKey);
            addEffect(
                serverUuid,
                player.uuid || '',
                values.target,
                values.effect,
                parseInt(values.duration),
                parseInt(values.amplifier)
            )
                .then(() => {
                    addFlash({
                        key: flashKey,
                        type: 'success',
                        message: `Successfully added effect ${values.effect} to ${values.target}.`,
                    });
                    close();
                    onRefresh();
                })
                .catch((error) => {
                    setSubmitting(false);
                    clearAndAddHttpError({ key: flashKey, error });
                });
        };
        return (
            <Formik
                onSubmit={submit}
                initialValues={{ target: player.name, effect: '', duration: '30', amplifier: '1' }}
            >
                {({ submitForm, isSubmitting, values }) => (
                    <>
                        <Form style={{ margin: 0 }}>
                            <FormikField as={Select} name='target' label='Target'>
                                <option value={player.name}>Selected Player ({player.name})</option>
                                <option value='@a'>All Players</option>
                            </FormikField>
                            <Field
                                autoFocus
                                id='effect'
                                name='effect'
                                label='Effect ID'
                                description='e.g., minecraft:speed'
                            />
                            <Field id='duration' name='duration' label='Duration (seconds)' type='number' />
                            <Field id='amplifier' name='amplifier' label='Amplifier' type='number' />
                        </Form>
                        <Dialog.Footer>
                            <Button.Text onClick={close}>Cancel</Button.Text>
                            <Button onClick={submitForm} disabled={isSubmitting}>
                                Add Effect
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        );
    });
    const tabs = [
        {
            id: 'inventory',
            title: 'Inventory',
            icon: faBoxOpen,
            content: (
                <PlayerInventory
                    playerName={player.name}
                    playerItems={playerItems}
                    isLoading={!playerItems}
                    onRefresh={onRefresh}
                    serverVersion={fastQueryData?.info?.version?.name}
                    onGiveItem={(slot: number, type: string) => {
                        setSelectedSlot(slot);
                        setSelectedSlotType(type);
                        setShowGiveItemModal(true);
                    }}
                    onModalStateChange={onModalStateChange}
                />
            ),
        },
        {
            id: 'statistics',
            title: 'Statistics',
            icon: faHeartbeat,
            content: (
                <PlayerStats
                    stats={playerItems?.player_stats}
                    isLoading={!playerItems}
                    error={playerItems?.error}
                    onModifyStat={handleModifyStat}
                    isOnline={isOnline}
                />
            ),
        },
        {
            id: 'advancements',
            title: 'Advancements',
            icon: faPlus,
            content: <Advancements player={player} serverUuid={serverUuid} />,
        },
    ];
    return (
        <FuturisticContentBox>
            <FlashMessageRender byKey={flashKey} style={{ marginBottom: '1rem' }} />
            {showBanModal && <BanPlayerDialog open={showBanModal} onClose={() => setShowBanModal(false)} />}
            {showBanIpModal && <BanIpDialog open={showBanIpModal} onClose={() => setShowBanIpModal(false)} />}
            {showKickModal && <KickPlayerDialog open={showKickModal} onClose={() => setShowKickModal(false)} />}
            {showWhisperModal && (
                <WhisperPlayerDialog open={showWhisperModal} onClose={() => setShowWhisperModal(false)} />
            )}
            {showTeleportModal && (
                <TeleportPlayerDialog open={showTeleportModal} onClose={() => setShowTeleportModal(false)} />
            )}
            {showGamemodeModal && (
                <GamemodePlayerDialog open={showGamemodeModal} onClose={() => setShowGamemodeModal(false)} />
            )}
            {showGiveItemModal && (
                <GiveItemDialog
                    open={showGiveItemModal}
                    onClose={() => {
                        setShowGiveItemModal(false);
                        setSelectedSlot(null);
                        setSelectedSlotType(null);
                    }}
                    slot={selectedSlot}
                    type={selectedSlotType}
                />
            )}
            {showAddEffectModal && (
                <AddEffectDialog open={showAddEffectModal} onClose={() => setShowAddEffectModal(false)} />
            )}
            {showOpModal && <OpPlayerDialog open={showOpModal} onClose={() => setShowOpModal(false)} />}
            {showKillModal && <KillPlayerDialog open={showKillModal} onClose={() => setShowKillModal(false)} />}
            {showClearInventoryModal && (
                <ClearInventoryDialog
                    open={showClearInventoryModal}
                    onClose={() => setShowClearInventoryModal(false)}
                />
            )}
            {showWipeDataModal && (
                <WipeDataDialog open={showWipeDataModal} onClose={() => setShowWipeDataModal(false)} />
            )}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '1rem',
                backgroundColor: 'var(--theme-background)',
                borderBottom: '1px solid var(--theme-border)',
                clipPath: 'polygon(0px 6px, 6px 0px, 100% 0px, 100% 100%, 0px 100%)',
            }}>
                <img
                    src={
                        player.name.startsWith('.')
                            ? `https://minotar.net/helm/herobrine`
                            : `https://minotar.net/helm/${player.uuid}`
                    }
                    alt={player.uuid}
                    style={{
                        width: '4rem',
                        height: '4rem',
                        marginRight: '1rem',
                        border: '2px solid var(--theme-border)',
                        clipPath: 'polygon(0px 5px, 5px 0px, 100% 0px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0px 100%)',
                    }}
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif", margin: 0 }}>{player.name}</h2>
                    {player.uuid && (
                        <CopyOnClick text={player.uuid}>
                            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <code style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', fontFamily: 'monospace', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.uuid}</code>
                                <FontAwesomeIcon icon={faCopy} style={{ marginLeft: '0.5rem', color: 'var(--theme-text-muted)', flexShrink: 0 }} />
                            </div>
                        </CopyOnClick>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {isOnline && <span style={getStatusStyle('online')}>Online</span>}
                        {isBanned && <span style={getStatusStyle('banned')}>Banned</span>}
                        {isIpBanned && <span style={getStatusStyle('banned')}>IP Banned</span>}
                        {isOp && <span style={getStatusStyle('op')}>Operator</span>}
                        {isWhitelisted && <span style={getStatusStyle('whitelisted')}>Whitelisted</span>}
                    </div>
                </div>
            </div>
            <div style={{ padding: '1rem' }}>
                <style>{`
                    .player-manage-buttons-grid {
                        display: grid;
                        grid-template-columns: repeat(1, 1fr);
                        gap: 1rem;
                    }
                    @media (min-width: 768px) {
                        .player-manage-buttons-grid {
                            grid-template-columns: repeat(3, 1fr);
                        }
                    }
                `}</style>
                <div className="player-manage-buttons-grid">
                    <div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>General</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Button
                                size={Button.Sizes.Small}
                                onClick={() => setShowWhisperModal(true)}
                                disabled={!isOnline}
                            >
                                <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '0.5rem' }} /> Message
                            </Button>
                            <Button
                                size={Button.Sizes.Small}
                                onClick={() => setShowTeleportModal(true)}
                                disabled={!isOnline}
                            >
                                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '0.5rem' }} /> Teleport
                            </Button>
                            <Button.Text
                                size={Button.Sizes.Small}
                                onClick={() => setShowGamemodeModal(true)}
                                disabled={!isOnline}
                            >
                                <FontAwesomeIcon icon={faGamepad} style={{ marginRight: '0.5rem' }} /> Gamemode
                            </Button.Text>
                            <Button.Danger
                                size={Button.Sizes.Small}
                                onClick={() => setShowKillModal(true)}
                                disabled={!isOnline || loading === 'kill'}
                            >
                                <FontAwesomeIcon icon={faSkull} style={{ marginRight: '0.5rem' }} /> Kill
                            </Button.Danger>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>Inventory & Effects</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Button
                                size={Button.Sizes.Small}
                                onClick={() => setShowGiveItemModal(true)}
                                disabled={!isOnline}
                            >
                                <FontAwesomeIcon icon={faHandRock} style={{ marginRight: '0.5rem' }} /> Give Item
                            </Button>
                            <Button.Text
                                size={Button.Sizes.Small}
                                onClick={() => setShowAddEffectModal(true)}
                                disabled={!isOnline}
                            >
                                <FontAwesomeIcon icon={faBolt} style={{ marginRight: '0.5rem' }} /> Add Effect
                            </Button.Text>
                            <Button.Text
                                size={Button.Sizes.Small}
                                onClick={() => handlePlayerAction('clearEffect')}
                                disabled={!isOnline || loading === 'clearEffect'}
                            >
                                <FontAwesomeIcon icon={faBroom} style={{ marginRight: '0.5rem' }} /> Clear Effects
                            </Button.Text>
                            <Button.Danger
                                size={Button.Sizes.Small}
                                onClick={() => setShowClearInventoryModal(true)}
                                disabled={!isOnline || loading === 'clearInventory'}
                            >
                                <FontAwesomeIcon icon={faBoxOpen} style={{ marginRight: '0.5rem' }} /> Clear Inventory
                            </Button.Danger>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>Moderation</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {isBanned ? (
                                <Button.Text
                                    size={Button.Sizes.Small}
                                    onClick={() => handlePlayerAction('unban')}
                                    disabled={loading === 'unban'}
                                >
                                    <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '0.5rem' }} /> Unban
                                </Button.Text>
                            ) : (
                                <Button.Danger
                                    size={Button.Sizes.Small}
                                    onClick={() => setShowBanModal(true)}
                                    disabled={loading === 'ban'}
                                >
                                    <FontAwesomeIcon icon={faBan} style={{ marginRight: '0.5rem' }} /> Ban
                                </Button.Danger>
                            )}
                            {isIpBanned ? (
                                <Button.Text
                                    size={Button.Sizes.Small}
                                    onClick={() => handlePlayerAction('unbanIp')}
                                    disabled={loading === 'unbanIp'}
                                >
                                    <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '0.5rem' }} /> Unban IP
                                </Button.Text>
                            ) : (
                                <Button.Danger
                                    size={Button.Sizes.Small}
                                    onClick={() => setShowBanIpModal(true)}
                                    disabled={loading === 'banIp'}
                                >
                                    <FontAwesomeIcon icon={faBan} style={{ marginRight: '0.5rem' }} /> Ban IP
                                </Button.Danger>
                            )}
                            <Button.Text
                                size={Button.Sizes.Small}
                                onClick={() => setShowKickModal(true)}
                                disabled={!isOnline || loading === 'kick'}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '0.5rem' }} /> Kick
                            </Button.Text>
                            {isWhitelisted ? (
                                <Button
                                    size={Button.Sizes.Small}
                                    onClick={() => handlePlayerAction('unwhitelist')}
                                    disabled={loading === 'unwhitelist'}
                                >
                                    <FontAwesomeIcon icon={faMinus} style={{ marginRight: '0.5rem' }} /> Unwhitelist
                                </Button>
                            ) : (
                                <Button
                                    size={Button.Sizes.Small}
                                    onClick={() => handlePlayerAction('whitelist')}
                                    disabled={loading === 'whitelist'}
                                >
                                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} /> Whitelist
                                </Button>
                            )}
                            {isOp ? (
                                <Button.Text
                                    size={Button.Sizes.Small}
                                    onClick={() => handlePlayerAction('deop')}
                                    disabled={loading === 'deop'}
                                >
                                    <FontAwesomeIcon icon={faUserShield} style={{ marginRight: '0.5rem' }} /> De-Op
                                </Button.Text>
                            ) : (
                                <Button.Text
                                    size={Button.Sizes.Small}
                                    onClick={() => setShowOpModal(true)}
                                    disabled={loading === 'op'}
                                >
                                    <FontAwesomeIcon icon={faUserShield} style={{ marginRight: '0.5rem' }} /> Op
                                </Button.Text>
                            )}
                            <Button.Danger
                                size={Button.Sizes.Small}
                                onClick={() => setShowWipeDataModal(true)}
                                disabled={loading === 'wipeData'}
                            >
                                <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem' }} /> Wipe Data
                            </Button.Danger>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '0 1rem 1rem' }}>
                <PlayerDetailsTabs tabs={tabs} />
            </div>
        </FuturisticContentBox>
    );
};
export default PlayerDetails;

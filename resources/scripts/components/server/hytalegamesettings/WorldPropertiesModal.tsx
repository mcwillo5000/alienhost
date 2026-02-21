import React, { useEffect, useState, useContext } from 'react';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import Switch from '@/components/elements/Switch';
import getWorldConfig, { WorldConfig } from '@/api/server/hytalegamesettings/getWorldConfig';
import updateWorldConfig from '@/api/server/hytalegamesettings/updateWorldConfig';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import Label from '@/components/elements/Label';
import FlashMessageRender from '@/components/FlashMessageRender';
interface Props {
    worldName: string;
    onModalClose?: () => void;
}
export default ({ worldName, onModalClose }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { close } = useContext(DialogWrapperContext);
    const { addError, addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const handleClose = () => {
        if (onModalClose) {
            onModalClose();
        }
        close();
    };
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<WorldConfig | null>(null);
    useEffect(() => {
        getWorldConfig(uuid, worldName)
            .then((data) => {
                if (!data.Death) {
                    data.Death = {
                        ItemsLossMode: 'Configured',
                        ItemsAmountLossPercentage: 10,
                        ItemsDurabilityLossPercentage: 10,
                    };
                }
                if (!data.Death.ItemsAmountLossPercentage) {
                    data.Death.ItemsAmountLossPercentage = 10;
                }
                if (!data.Death.ItemsDurabilityLossPercentage) {
                    data.Death.ItemsDurabilityLossPercentage = 10;
                }
                setConfig(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'hytale:world', message: httpErrorToHuman(error) });
                setLoading(false);
            });
    }, [worldName, uuid]);
    const handleSave = () => {
        if (!config) return;
        setSaving(true);
        const settings: any = {
            IsPvpEnabled: config.IsPvpEnabled,
            IsFallDamageEnabled: config.IsFallDamageEnabled,
            GameTime: config.GameTime,
            IsGameTimePaused: config.IsGameTimePaused,
            ItemsLossMode: config.Death?.ItemsLossMode || 'Configured',
            DaytimeDurationSeconds: config.DaytimeDurationSeconds,
            NighttimeDurationSeconds: config.NighttimeDurationSeconds,
            IsTicking: config.IsTicking,
            IsSpawningNPC: config.IsSpawningNPC,
            IsSpawnMarkersEnabled: config.IsSpawnMarkersEnabled,
            IsBlockTicking: config.IsBlockTicking,
            IsAllNPCFrozen: config.IsAllNPCFrozen,
            PregenerateRadius: config.PregenerateRadius || 0,
        };
        if (config.Death?.ItemsLossMode === 'Configured') {
            settings.ItemsAmountLossPercentage = config.Death.ItemsAmountLossPercentage || 10;
            settings.ItemsDurabilityLossPercentage = config.Death.ItemsDurabilityLossPercentage || 10;
        }
        updateWorldConfig(uuid, worldName, settings)
            .then(() => {
                clearFlashes('hytale');
                clearFlashes('hytale:world');
                addFlash({
                    key: 'hytale',
                    type: 'success',
                    message: `World "${worldName}" settings updated successfully.`,
                });
                handleClose();
            })
            .catch((error) => {
                console.error(error);
                clearFlashes('hytale:world');
                addError({ key: 'hytale:world', message: httpErrorToHuman(error) });
            })
            .finally(() => setSaving(false));
    };
    const updateConfig = <K extends keyof WorldConfig>(key: K, value: WorldConfig[K]) => {
        if (!config) return;
        setConfig({ ...config, [key]: value });
    };
    const updateDeathConfig = (value: string) => {
        if (!config) return;
        setConfig({
            ...config,
            Death: {
                ...(config.Death || {}),
                ItemsLossMode: value,
                ItemsAmountLossPercentage: config.Death?.ItemsAmountLossPercentage || 10,
                ItemsDurabilityLossPercentage: config.Death?.ItemsDurabilityLossPercentage || 10,
            },
        });
    };
    const updateDeathPercentage = (key: 'ItemsAmountLossPercentage' | 'ItemsDurabilityLossPercentage', value: number) => {
        if (!config) return;
        setConfig({
            ...config,
            Death: {
                ItemsLossMode: config.Death?.ItemsLossMode || 'Configured',
                ItemsAmountLossPercentage: config.Death?.ItemsAmountLossPercentage || 10,
                ItemsDurabilityLossPercentage: config.Death?.ItemsDurabilityLossPercentage || 10,
                [key]: value,
            },
        });
    };
    return (
        <>
            <FlashMessageRender byKey={'hytale:world'} />
            {!loading && config && (
                <>
                    <TitledGreyBox title={'World Properties'} className={'mb-4'}>
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-2'}>
                            <div>
                                <Label>World Name</Label>
                                <Input type={'text'} value={worldName} readOnly />
                            </div>
                            <div>
                                <Label>World Seed</Label>
                                <Input type={'text'} value={config.Seed?.toString() || 'N/A'} readOnly />
                            </div>
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title={'Game Mechanics'} className={'mb-4'}>
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-2'}>
                            <Switch
                                name={'pvp_enabled'}
                                label={'PvP Enabled'}
                                defaultChecked={config.IsPvpEnabled}
                                onChange={(e) => updateConfig('IsPvpEnabled', e.target.checked)}
                            />
                            <Switch
                                name={'fall_damage'}
                                label={'Fall Damage Enabled'}
                                defaultChecked={config.IsFallDamageEnabled}
                                onChange={(e) => updateConfig('IsFallDamageEnabled', e.target.checked)}
                            />
                            <Switch
                                name={'game_time_paused'}
                                label={'Game Time Paused'}
                                defaultChecked={config.IsGameTimePaused}
                                onChange={(e) => updateConfig('IsGameTimePaused', e.target.checked)}
                            />
                            <div>
                                <Label>Game Time</Label>
                                <Input
                                    type={'text'}
                                    value={config.GameTime}
                                    onChange={(e) => updateConfig('GameTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title={'Inventory Penalty on Death'} className={'mb-4'}>
                        <div className={'mb-3'}>
                            <Label>Penalty on Death</Label>
                            <Select value={config.Death?.ItemsLossMode || 'Configured'} onChange={(e) => updateDeathConfig(e.target.value)}>
                                <option value={'None'}>None</option>
                                <option value={'All'}>Drop All</option>
                                <option value={'Configured'}>Partial Drop</option>
                            </Select>
                        </div>
                        {config.Death?.ItemsLossMode === 'Configured' && (
                            <div className={'grid grid-cols-1 md:grid-cols-2 gap-2'}>
                                <div>
                                    <Label>Resources Loss % (0-100)</Label>
                                    <Input
                                        type={'number'}
                                        value={(config.Death?.ItemsAmountLossPercentage || 10).toString()}
                                        onChange={(e) => updateDeathPercentage('ItemsAmountLossPercentage', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div>
                                    <Label>Durability Loss % (0-100)</Label>
                                    <Input
                                        type={'number'}
                                        value={(config.Death?.ItemsDurabilityLossPercentage || 10).toString()}
                                        onChange={(e) => updateDeathPercentage('ItemsDurabilityLossPercentage', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>
                        )}
                    </TitledGreyBox>
                    <TitledGreyBox title={'Day/Night Cycle'} className={'mb-4'}>
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-2'}>
                            <div>
                                <Label>Daytime Duration (in seconds)</Label>
                                <Input
                                    type={'number'}
                                    value={(config.DaytimeDurationSeconds || 600).toString()}
                                    onChange={(e) => updateConfig('DaytimeDurationSeconds', parseInt(e.target.value) || 600)}
                                    min={1}
                                />
                            </div>
                            <div>
                                <Label>Nighttime Duration (in seconds)</Label>
                                <Input
                                    type={'number'}
                                    value={(config.NighttimeDurationSeconds || 300).toString()}
                                    onChange={(e) => updateConfig('NighttimeDurationSeconds', parseInt(e.target.value) || 300)}
                                    min={1}
                                />
                            </div>
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title={'Simulation Settings'} className={'mb-4'}>
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-2'}>
                            <Switch
                                name={'world_ticking'}
                                label={'World Ticking'}
                                defaultChecked={config.IsTicking}
                                onChange={(e) => updateConfig('IsTicking', e.target.checked)}
                            />
                            <Switch
                                name={'npc_spawning'}
                                label={'NPC Spawning'}
                                defaultChecked={config.IsSpawningNPC}
                                onChange={(e) => updateConfig('IsSpawningNPC', e.target.checked)}
                            />
                            <Switch
                                name={'spawn_markers'}
                                label={'Spawn Markers Enabled'}
                                defaultChecked={config.IsSpawnMarkersEnabled}
                                onChange={(e) => updateConfig('IsSpawnMarkersEnabled', e.target.checked)}
                            />
                            <Switch
                                name={'block_ticking'}
                                label={'Block Ticking'}
                                defaultChecked={config.IsBlockTicking}
                                onChange={(e) => updateConfig('IsBlockTicking', e.target.checked)}
                            />
                            <Switch
                                name={'all_npc_frozen'}
                                label={'All NPCs Frozen'}
                                defaultChecked={config.IsAllNPCFrozen}
                                onChange={(e) => updateConfig('IsAllNPCFrozen', e.target.checked)}
                            />
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title={'World Pregeneration'} className={'mb-4'}>
                        <Label>
                            Size of region to pregenerate at world start (0 to disable)
                        </Label>
                        <Input
                            type={'number'}
                            value={(config.PregenerateRadius || 0).toString()}
                            onChange={(e) => updateConfig('PregenerateRadius', parseInt(e.target.value) || 0)}
                            min={0}
                        />
                    </TitledGreyBox>
                </>
            )}
            <Dialog.Footer>
                <Button.Text className={'w-full sm:w-auto'} onClick={handleClose}>
                    Cancel
                </Button.Text>
                <Button className={'w-full sm:w-auto'} onClick={handleSave} disabled={saving || loading}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Dialog.Footer>
        </>
    );
};

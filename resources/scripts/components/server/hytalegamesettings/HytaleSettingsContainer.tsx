import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import getHytaleSettings, { HytaleSettings } from '@/api/server/hytalegamesettings/getHytaleSettings';
import updateHytaleSettings from '@/api/server/hytalegamesettings/updateHytaleSettings';
import HytaleBasicTab from '@/components/server/hytalegamesettings/HytaleBasicTab';
import HytaleWorldsTab from '@/components/server/hytalegamesettings/HytaleWorldsTab';
import HytaleAdvancedTab from '@/components/server/hytalegamesettings/HytaleAdvancedTab';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Button } from '@/components/elements/button/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faGlobe, faSlidersH, faStar, faEdit, faPencilAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import getWorlds, { HytaleWorld } from '@/api/server/hytalegamesettings/getWorlds';
import { Dialog } from '@/components/elements/dialog';
import WorldPropertiesModal from '@/components/server/hytalegamesettings/WorldPropertiesModal';
import CreateWorldModal from '@/components/server/hytalegamesettings/CreateWorldModal';
import Portal from '@/components/elements/Portal';
import Fade from '@/components/elements/Fade';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const { addError, clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'worlds' | 'advanced'>('basic');
    const [worlds, setWorlds] = useState<HytaleWorld[]>([]);
    const [loadingWorlds, setLoadingWorlds] = useState(false);
    const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [settings, setSettings] = useState<HytaleSettings>({
        serverName: '',
        motd: '',
        serverPassword: '',
        maxPlayers: 100,
        gamemode: 'Adventure',
        worldName: 'default',
        viewDistanceRadius: 13,
    });
    const [originalSettings, setOriginalSettings] = useState<HytaleSettings | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    useEffect(() => {
        clearFlashes('hytale');
        getHytaleSettings(uuid)
            .then((data) => {
                setSettings(data);
                setOriginalSettings(JSON.parse(JSON.stringify(data)));
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'hytale', message: httpErrorToHuman(error) });
                setLoading(false);
            });
    }, [uuid]);
    useEffect(() => {
        loadWorlds();
    }, [activeTab]);
    useEffect(() => {
        if (status === 'starting') {
            addFlash({
                key: 'hytale',
                type: 'warning',
                message: 'Server is currently starting. Settings cannot be modified until the server is online or offline.',
            });
        } else {
            clearFlashes('hytale');
        }
    }, [status]);
    const loadWorlds = () => {
        setLoadingWorlds(true);
        getWorlds(uuid)
            .then((data) => {
                setWorlds(data);
                setLoadingWorlds(false);
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'hytale:worlds', message: httpErrorToHuman(error) });
                setLoadingWorlds(false);
            });
    };
    const handleSetDefault = (worldName: string) => {
        const updatedSettings = { ...settings, worldName };
        setSettings(updatedSettings);
        setHasChanges(true);
        setSaving(true);
        clearFlashes('hytale');
        clearFlashes('hytale:worlds');
        updateHytaleSettings(uuid, updatedSettings)
            .then(() => {
                clearFlashes('hytale');
                addFlash({
                    key: 'hytale',
                    type: 'success',
                    message: `Default world set to "${worldName}" successfully.`,
                });
                setHasChanges(false);
                setOriginalSettings(JSON.parse(JSON.stringify(updatedSettings)));
            })
            .catch((error) => {
                console.error(error);
                clearFlashes('hytale');
                addError({ key: 'hytale', message: httpErrorToHuman(error) });
            })
            .finally(() => setSaving(false));
    };
    const handleSave = () => {
        setSaving(true);
        clearFlashes('hytale');
        clearFlashes('hytale:worlds');
        updateHytaleSettings(uuid, settings)
            .then(() => {
                clearFlashes('hytale');
                addFlash({
                    key: 'hytale',
                    type: 'success',
                    message: 'Hytale settings have been updated successfully.',
                });
                setHasChanges(false);
                setOriginalSettings(JSON.parse(JSON.stringify(settings)));
            })
            .catch((error) => {
                console.error(error);
                clearFlashes('hytale');
                addError({ key: 'hytale', message: httpErrorToHuman(error) });
            })
            .finally(() => setSaving(false));
    };
    const updateSetting = <K extends keyof HytaleSettings>(key: K, value: HytaleSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };
    const handleCreateWorld = () => {
        setShowCreateModal(true);
    };
    const handleWorldCreated = (worldName: string) => {
        setSettings((prev) => ({ ...prev, worldName }));
        setOriginalSettings((prev) => prev ? { ...prev, worldName } : null);
        setShowCreateModal(false);
        loadWorlds();
    };
    return (
        <ServerContentBlock title={'Hytale Game Settings'}>
            <FlashMessageRender byKey={'hytale'} css={tw`mb-4`} />
            {!loading && (
                <div className={'flex gap-4' + (status === 'starting' ? ' opacity-50 pointer-events-none' : '')}>
                    <div className={'w-64 flex-shrink-0'}>
                        <div className={'sticky top-4'}>
                            <TitledGreyBox title={'Navigation'}>
                                <nav className={'flex flex-col gap-1'}>
                                    <button
                                        onClick={() => setActiveTab('basic')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all ${activeTab === 'basic'
                                            ? 'bg-neutral-500 text-white'
                                            : 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faCog} className={'w-4'} />
                                        Basic
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('worlds')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all ${activeTab === 'worlds'
                                            ? 'bg-neutral-500 text-white'
                                            : 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faGlobe} className={'w-4'} />
                                        Worlds
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('advanced')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all ${activeTab === 'advanced'
                                            ? 'bg-neutral-500 text-white'
                                            : 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faSlidersH} className={'w-4'} />
                                        Advanced
                                    </button>
                                </nav>
                            </TitledGreyBox>
                            <TitledGreyBox title={'Worlds Manager'} className={'mt-4'}>
                                <div className={'relative'}>
                                    {!loadingWorlds && worlds.length === 0 && (
                                        <p className={'text-center text-xs text-neutral-400 py-4'}>
                                            No worlds found
                                        </p>
                                    )}
                                    {!loadingWorlds && worlds.length > 0 && (
                                        <div className={'space-y-2'}>
                                            {worlds.map((world) => (
                                                <div key={world.name} className={'bg-neutral-500 rounded px-4 py-3'}>
                                                    <div className={'flex items-center justify-between w-full'}>
                                                        <p className={'text-sm font-medium truncate mr-4'}>{world.name}</p>
                                                        <div className={'flex items-center gap-3 flex-shrink-0'}>
                                                            <button
                                                                onClick={() => handleSetDefault(world.name)}
                                                                className={'transition-all'}
                                                                title={settings.worldName === world.name ? 'Default World' : 'Set as Default'}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={faStar}
                                                                    className={settings.worldName === world.name ? 'text-yellow-500 cursor-default' : 'text-neutral-200 hover:text-yellow-400 opacity-40 hover:opacity-100'}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedWorld(world.name)}
                                                                className={'text-neutral-200 transition-colors'}
                                                                title={'Edit World Settings'}
                                                            >
                                                                <FontAwesomeIcon icon={faPencilAlt} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className={'mt-2'} onClick={handleCreateWorld}>
                                        <div className={'border border-neutral-500 rounded px-4 py-3 group hover:cursor-pointer'}>
                                            <div className={'flex items-center justify-between w-full'}>
                                                <p className={'text-sm font-medium truncate mr-4'}>Create New World</p>
                                                <div className={'flex items-center gap-3 flex-shrink-0'}>
                                                    <FontAwesomeIcon
                                                        icon={faPlus}
                                                        className={'text-neutral-200 group-hover:text-green-400 opacity-40 group-hover:opacity-100'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TitledGreyBox>
                        </div>
                    </div>
                    <div className={'flex-1 min-w-0'}>
                        {activeTab === 'basic' && (
                            <HytaleBasicTab
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                        {activeTab === 'worlds' && (
                            <HytaleWorldsTab
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                        {activeTab === 'advanced' && (
                            <HytaleAdvancedTab
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                    </div>
                </div>
            )}
            <Dialog
                open={selectedWorld !== null}
                onClose={() => setSelectedWorld(null)}
                title={selectedWorld ? `World Properties - ${selectedWorld}` : ''}
            >
                {selectedWorld && <WorldPropertiesModal worldName={selectedWorld} onModalClose={() => setSelectedWorld(null)} />}
            </Dialog>
            <CreateWorldModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                currentSettings={settings}
                onWorldCreated={handleWorldCreated}
            />
            <Portal>
                <div className={'pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center'}>
                    <SpinnerOverlay visible={saving} size={'large'} fixed>
                        Saving settings...
                    </SpinnerOverlay>
                    <div className={'pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50'}>
                        <Fade timeout={75} in={hasChanges && !loading && !saving} unmountOnExit>
                            <div className={'flex items-center space-x-4 pointer-events-auto rounded p-4 bg-black/50'}>
                                <Button onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </div>
                        </Fade>
                    </div>
                </div>
            </Portal>
        </ServerContentBlock>
    );
};

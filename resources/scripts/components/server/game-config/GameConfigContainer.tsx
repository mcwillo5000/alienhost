import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { detectGameType, GameConfigFile } from '@/api/server/game-config';
import { httpErrorToHuman } from '@/api/http';
import useFlash from '@/plugins/useFlash';
import Spinner from '@/components/elements/Spinner';
import ConfigFileSelector from './ConfigFileSelector';
import ConfigEditor from './ConfigEditor';
import { Button } from '@/components/elements/button/index';
import { RefreshIcon, DocumentTextIcon } from '@heroicons/react/outline';
export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);
    const [gameType, setGameType] = useState<string>('unknown');
    const [configFiles, setConfigFiles] = useState<GameConfigFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<GameConfigFile | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => {
        loadGameConfig();
    }, [uuid, refreshKey]);
    const loadGameConfig = () => {
        setLoading(true);
        clearFlashes('game-config');
        detectGameType(uuid)
            .then((response) => {
                setGameType(response.gameType);
                setConfigFiles(response.configFiles);
                if (response.gameType === 'unknown' || response.configFiles.length === 0) {
                    addError({
                        message: 'This game type is not yet supported or the configuration file was not found',
                        key: 'game-config',
                    });
                    setLoading(false);
                    return;
                }
                if (response.configFiles.length > 0) {
                    setSelectedFile(response.configFiles[0]);
                }
            })
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'game-config' });
            })
            .finally(() => setLoading(false));
    };
    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };
    if (loading) {
        return (
            <ServerContentBlock title={'Game Config Editor'}>
                <div css={tw`flex items-center justify-center h-64`}>
                    <Spinner size={'large'} />
                </div>
            </ServerContentBlock>
        );
    }
    if (gameType === 'unknown') {
        return (
            <ServerContentBlock title={'Game Config Editor'}>
                <FlashMessageRender byKey={'game-config'} css={tw`mb-4`} />
                <TitledGreyBox title={'Game Type Not Detected'}>
                    <div css={tw`text-center py-4`}>
                        <DocumentTextIcon css={tw`w-16 h-16 mx-auto mb-4 text-neutral-400`} />
                        <p css={tw`text-neutral-300 mb-2`}>
                            Make sure your server has configuration files in the correct locations.
                        </p>
                    </div>
                </TitledGreyBox>
            </ServerContentBlock>
        );
    }
    if (configFiles.length === 0) {
        return (
            <ServerContentBlock title={'Game Config Editor'}>
                <FlashMessageRender byKey={'game-config'} css={tw`mb-4`} />
                <TitledGreyBox title={'No Config Files Found'}>
                    <div css={tw`text-center py-4`}>
                        <DocumentTextIcon css={tw`w-16 h-16 mx-auto mb-4 text-neutral-400`} />
                        <p css={tw`text-neutral-300 mb-4`}>
                            No configuration files were found for this server.
                        </p>
                        <Button.Text onClick={handleRefresh} variant={Button.Variants.Secondary}>
                            <RefreshIcon css={tw`w-4 h-4 mr-2`} />
                            Refresh
                        </Button.Text>
                    </div>
                </TitledGreyBox>
            </ServerContentBlock>
        );
    }
    return (
        <ServerContentBlock title={'Game Config Editor'}>
            <FlashMessageRender byKey={'game-config'} css={tw`mb-4`} />
            <div css={tw`grid grid-cols-1 lg:grid-cols-4 gap-6`}>
                {/* File Selector Sidebar */}
                <div css={tw`lg:col-span-1`}>
                    <div css={tw`sticky top-0`}>
                        <TitledGreyBox title={'Configuration Files'}>
                            <ConfigFileSelector
                                files={configFiles}
                                selectedFile={selectedFile}
                                onSelectFile={setSelectedFile}
                            />
                        </TitledGreyBox>
                    </div>
                </div>
                {/* Config Editor */}
                <div css={tw`lg:col-span-3`}>
                    {selectedFile ? (
                        <ConfigEditor
                            file={selectedFile}
                            key={`${selectedFile.path}-${refreshKey}`}
                        />
                    ) : (
                        <TitledGreyBox title={'Select a File'}>
                            <div css={tw`text-center py-8`}>
                                <DocumentTextIcon css={tw`w-12 h-12 mx-auto mb-3 text-neutral-400`} />
                                <p css={tw`text-neutral-400`}>Select a configuration file from the list to edit</p>
                            </div>
                        </TitledGreyBox>
                    )}
                </div>
            </div>
        </ServerContentBlock>
    );
};

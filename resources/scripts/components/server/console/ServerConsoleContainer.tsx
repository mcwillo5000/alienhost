import React, { memo } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerStatsCards from '@/components/server/console/ServerStatsCards';
import ServerOverloadNotification from '@/components/server/console/ServerOverloadNotification';
import { Alert } from '@/components/elements/alert';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faPlay, faRedo, faStop, faSkull } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerHeaderCard = styled.div<{ $backgroundImage?: string }>`
    position: relative;
    overflow: visible;
    margin-bottom: 1.5rem;
    background-color: transparent;
`;

const ServerHeaderContent = styled.div<{ $backgroundImage?: string }>`
    position: relative;
    z-index: 1;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--theme-background-secondary);
    clip-path: polygon(0px 12px, 12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%);
    /* Arwes-style glow */
    box-shadow: 0 0 10px rgba(var(--theme-border-rgb, 55, 65, 81), 0.4),
                inset 0 0 15px rgba(0, 0, 0, 0.2);
    
    &::before {
        content: '';
        position: absolute;
        inset: -1px;
        background: var(--theme-border);
        clip-path: polygon(0px 12px, 12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%);
        z-index: -2;
        /* Arwes-style border glow */
        box-shadow: 0 0 6px var(--theme-border);
    }
    
    /* Background image layer */
    ${({ $backgroundImage }) =>
        $backgroundImage &&
        `
        &::after {
            content: '';
            position: absolute;
            inset: 1px;
            background-image: url(${$backgroundImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.2;
            clip-path: polygon(0px 11px, 11px 0px, 100% 0px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0px 100%);
            z-index: -1;
        }
        `};
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
`;

const ServerIconContainer = styled.div`
    height: 3rem;
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(59, 130, 246, 0.1);
    clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
    /* Arwes-style glow */
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;

const ServerIcon = styled(FontAwesomeIcon)`
    font-size: 1.25rem;
    color: #3b82f6;
    /* Arwes-style icon glow */
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
`;

const ServerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ServerDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const ServerName = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text-base);
    margin: 0;
    line-height: 1.4;
    font-family: 'Orbitron', sans-serif;
`;

const ServerDescription = styled.p`
    font-size: 0.875rem;
    color: var(--theme-text-muted);
    margin: 0;
    line-height: 1.4;
    font-family: 'Electrolize', sans-serif;
`;

const PowerControlsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        width: 100%;
        justify-content: stretch;
        
        /* Make buttons full width on mobile */
        & > div {
            flex: 1;
        }
        
        & .flex {
            width: 100%;
        }
        
        & .space-x-2 > * + * {
            margin-left: 0.5rem;
        }
        
        /* Stack power buttons horizontally but make them smaller */
        & button {
            flex: 1;
            min-width: 0;
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
        }
    }
`;

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const { t } = useTranslation();

    const getBackgroundImage = () => {
        const serverWithEggImage = server as any;
        if (serverWithEggImage.eggImage || serverWithEggImage.egg_image) {
            const eggImageUrl = serverWithEggImage.eggImage || serverWithEggImage.egg_image;
            console.log(`[ServerConsole] Using egg image for server "${server.name}": ${eggImageUrl}`);
            return eggImageUrl;
        }
        
        console.log(`[ServerConsole] No egg image found for server "${server.name}", showing background color only`);
        return undefined;
    };

    return (
        <ServerContentBlock title={t('console.title')}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? t('console.alerts.nodeMaintenance')
                        : isInstalling
                        ? t('console.alerts.installing')
                        : t('console.alerts.transferring')}
                </Alert>
            )}


            <ServerOverloadNotification />


            <ServerHeaderCard>
                <ServerHeaderContent $backgroundImage={getBackgroundImage()}>
                    <ServerInfo>
                        <ServerIconContainer>
                            <ServerIcon icon={faServer} />
                        </ServerIconContainer>
                        <ServerDetails>
                            <ServerName>{name}</ServerName>
                            <ServerDescription>
                                {description || `Server UUID: ${server.uuid.substring(0, 8)}`}
                            </ServerDescription>
                        </ServerDetails>
                    </ServerInfo>
                    <PowerControlsContainer>
                        <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                            <div className="flex items-center space-x-2">
                                <PowerButtons className={'flex space-x-2'} />
                            </div>
                        </Can>
                    </PowerControlsContainer>
                </ServerHeaderContent>
            </ServerHeaderCard>


            <ServerStatsCards />


            <div className={'mb-4'}>
                <Spinner.Suspense>
                    <Console />
                </Spinner.Suspense>
            </div>
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);

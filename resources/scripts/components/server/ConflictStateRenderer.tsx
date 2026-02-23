import React from 'react';
import { ServerContext } from '@/state/server';
import { 
    ServerInstalling, 
    ServerSuspended, 
    NodeMaintenance, 
    ServerTransferring, 
    ServerRestoring 
} from '@/components/elements/ScreenBlock';

export default () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data?.isNodeUnderMaintenance || false
    );

    return status === 'installing' || status === 'install_failed' || status === 'reinstall_failed' ? (
        <ServerInstalling />
    ) : status === 'suspended' ? (
        <ServerSuspended />
    ) : isNodeUnderMaintenance ? (
        <NodeMaintenance />
    ) : isTransferring ? (
        <ServerTransferring />
    ) : (
        <ServerRestoring />
    );
};

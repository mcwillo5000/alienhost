import { ComponentType, lazy } from 'react';


const features: Record<string, ComponentType> = {
    eula: lazy(() => import('@feature/eula/EulaModalFeature')),
    java_version: lazy(() => import('@feature/JavaVersionModalFeature')),
    gsl_token: lazy(() => import('@feature/GSLTokenModalFeature')),
    pid_limit: lazy(() => import('@feature/PIDLimitModalFeature')),
    steam_disk_space: lazy(() => import('@feature/SteamDiskSpaceFeature')),
};

export default features;

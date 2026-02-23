import { useLocation } from 'react-router-dom';
import { ServerContext } from '@/state/server';


export const useServerContextSafe = () => {
    const location = useLocation();
    const isServerPage = location.pathname.startsWith('/server/');
    
    if (!isServerPage) {
        return {
            server: null,
            permissions: [],
            isServerPage: false
        };
    }
    

    const server = ServerContext.useStoreState((state: any) => state.server.data);
    const permissions = ServerContext.useStoreState((state: any) => state.server.permissions);
    
    return {
        server,
        permissions,
        isServerPage: true
    };
};
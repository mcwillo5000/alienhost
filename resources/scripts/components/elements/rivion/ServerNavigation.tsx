import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faServer,
    faTerminal,
    faDatabase,
    faUsers,
    faHdd,
    faNetworkWired,
    faRocket,
    faCog,
    faClipboard
} from '@fortawesome/free-solid-svg-icons';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';

interface ServerNavigationProps {
    sectionsCollapsed: {[key: string]: boolean};
    toggleSection: (section: string) => void;
}

export default ({ sectionsCollapsed, toggleSection }: ServerNavigationProps) => {
    const location = useLocation();
    
    const server = ServerContext.useStoreState((state: any) => state.server.data);
    const permissions = ServerContext.useStoreState((state: any) => state.server.permissions);

    if (!server) return null;

    const serverId = server.id;

    return (
        <div className="rivion-nav-section">
            <div 
                className="rivion-nav-section-header"
                onClick={() => toggleSection('server')}
            >
                <h3 className="rivion-nav-section-title">
                    <FontAwesomeIcon icon={faServer} className="mr-2" />
                    {server.name}
                </h3>
                <FontAwesomeIcon 
                    icon={faServer} 
                    className={`rivion-nav-section-toggle ${sectionsCollapsed.server ? 'collapsed' : ''}`}
                />
            </div>
            {!sectionsCollapsed.server && (
                <ul className="rivion-nav-list">
                    <li className="rivion-nav-item">
                        <NavLink 
                            to={`/server/${serverId}`}
                            className="rivion-nav-link"
                            activeClassName="active"
                            exact
                        >
                            <FontAwesomeIcon icon={faTerminal} />
                            <span>Console</span>
                        </NavLink>
                    </li>
                    
                    <Can action="file.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/files`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faHdd} />
                                <span>File Manager</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action="database.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/databases`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faDatabase} />
                                <span>Databases</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action="schedule.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/schedules`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faClipboard} />
                                <span>Schedules</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action="user.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/users`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                <span>Users</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action="backup.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/backups`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faHdd} />
                                <span>Backups</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action="allocation.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/network`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faNetworkWired} />
                                <span>Network</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action="startup.*" matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/startup`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faRocket} />
                                <span>Startup</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <Can action={["settings.*", "file.sftp"]} matchAny>
                        <li className="rivion-nav-item">
                            <NavLink 
                                to={`/server/${serverId}/settings`}
                                className="rivion-nav-link"
                                activeClassName="active"
                            >
                                <FontAwesomeIcon icon={faCog} />
                                <span>Settings</span>
                            </NavLink>
                        </li>
                    </Can>
                    
                    <li className="rivion-nav-item">
                        <NavLink 
                            to={`/server/${serverId}/activity`}
                            className="rivion-nav-link"
                            activeClassName="active"
                        >
                            <FontAwesomeIcon icon={faClipboard} />
                            <span>Activity</span>
                        </NavLink>
                    </li>
                </ul>
            )}
        </div>
    );
};
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Avatar from '@/components/Avatar';
import ThemeToggle from '@/components/ThemeToggle';
import SearchContainer from '@/components/dashboard/search/SearchContainer';

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const hasAdvRole = !rootAdmin && ((window as any).PterodactylUser?.has_adv_role ?? false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {

            window.location = '/';
        });
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    return (
        <nav className="rivion-navbar">
            <SpinnerOverlay visible={isLoggingOut} />
            <div className="rivion-navbar-container">
                <div className="rivion-navbar-left">
                    <Link to="/" className="rivion-navbar-logo">
                        {name}
                    </Link>
                    
                    <div className="rivion-navbar-nav">
                        <NavLink to="/" exact className="rivion-nav-link">
                            <span>Dashboard</span>
                        </NavLink>
                        
                        {(rootAdmin || hasAdvRole) && (
                            <a href="/admin" rel="noreferrer" className="rivion-nav-link">
                                <span>Admin</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="rivion-navbar-center">
                </div>

                <div className="rivion-navbar-right">
                    <SearchContainer />
                    
                    <ThemeToggle />
                    
                    <div className={`rivion-profile-dropdown ${isProfileDropdownOpen ? 'open' : ''}`}>
                        <button 
                            className="rivion-profile-button"
                            onClick={toggleProfileDropdown}
                        >
                            <Avatar.User />
                        </button>
                        
                        {isProfileDropdownOpen && (
                            <div className="rivion-dropdown-menu">
                                <Link 
                                    to="/account" 
                                    className="rivion-dropdown-item"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                    <span>Account Settings</span>
                                </Link>
                                <Link 
                                    to="/account/api" 
                                    className="rivion-dropdown-item"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="rivion-dropdown-icon">
                                        <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H17V17H7V15Z"/>
                                    </svg>
                                    <span>API Keys</span>
                                </Link>
                                <Link 
                                    to="/account/ssh" 
                                    className="rivion-dropdown-item"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="rivion-dropdown-icon">
                                        <path d="M22 12.1V7L20 5.5L18 7V12.1C16.2 12.8 16 13.9 16 15S16.2 17.2 18 17.9V19L20 20.5L22 19V17.9C23.8 17.2 24 16.1 24 15S23.8 12.8 22 12.1ZM20 16C19.4 16 19 15.6 19 15S19.4 14 20 14 21 14.4 21 15 20.6 16 20 16ZM15 12H2V10H15V12ZM15 8H2V6H15V8ZM11 16H2V14H11V16Z"/>
                                    </svg>
                                    <span>SSH Access</span>
                                </Link>
                                <Link 
                                    to="/account/activity" 
                                    className="rivion-dropdown-item"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="rivion-dropdown-icon">
                                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13.5C14.8 13.8 14.4 14 14 14H10L8.5 12.5L10 11H13L15 9H21ZM22 17H14L11.5 14.5L10 16L12 18H22V17Z"/>
                                    </svg>
                                    <span>Account Activity</span>
                                </Link>
                                <hr className="rivion-dropdown-divider" />
                                <button 
                                    onClick={onTriggerLogout}
                                    className="rivion-dropdown-item"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
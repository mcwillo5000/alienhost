import React, { useState, useEffect, useCallback, useRef } from 'react';
import SidebarNavigation from './SidebarNavigation';
import TopBar from './TopBar';
import Footer from './Footer';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default ({ children }: DashboardLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
                setSidebarOpen(false);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sidebarOpen]);
    
    const isToggling = useRef(false);
    
    const handleOverlayClick = useCallback(() => {
        if (!isToggling.current) {
            setSidebarOpen(false);
        }
    }, []);
    
    const toggleSidebar = useCallback(() => {
        if (isToggling.current) return;
        isToggling.current = true;
        setSidebarOpen(prev => !prev);
        setTimeout(() => {
            isToggling.current = false;
        }, 300);
    }, []);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        if (sidebarOpen && window.innerWidth >= 1024) {
            document.body.classList.add('has-sidebar');
        } else {
            document.body.classList.remove('has-sidebar');
        }
        
        if (sidebarOpen && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        
        return () => {
            document.body.classList.remove('has-sidebar');
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [sidebarOpen]);
    
    return (
        <div className="rivion-layout-wrapper">

            <TopBar 
                onSidebarToggle={toggleSidebar}
                isSidebarOpen={sidebarOpen}
            />
            

            <div className="rivion-content-wrapper">

                <SidebarNavigation 
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    type="dashboard"
                />
                

                {sidebarOpen && (
                    <div 
                        className={`rivion-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                        onClick={handleOverlayClick}
                    />
                )}
                

                <div className="rivion-main-content">

                    <div className="rivion-page-content">
                        {children}
                    </div>
                </div>
            </div>
            

            <Footer />
        </div>
    );
};
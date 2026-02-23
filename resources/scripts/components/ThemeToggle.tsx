import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const siteConfig = (window as any).SiteConfiguration?.theme;
        const defaultTheme = siteConfig?.defaultTheme || 'dark';
        
        const savedTheme = localStorage.getItem('theme');
        
        let shouldBeDark: boolean;
        
        if (savedTheme) {
            shouldBeDark = savedTheme === 'dark';
        } else {
            if (defaultTheme === 'system') {

                shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            } else {

                shouldBeDark = defaultTheme === 'dark';
            }
        }
        
        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark);
    }, []);

    const applyTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        const siteConfig = (window as any).SiteConfiguration?.theme;
        if (siteConfig) {
            const prefix = dark ? 'dark' : 'light';
            document.documentElement.style.setProperty('--theme-primary', siteConfig[`${prefix}_primary`]);
            document.documentElement.style.setProperty('--theme-secondary', siteConfig[`${prefix}_secondary`]);
            document.documentElement.style.setProperty('--theme-border', siteConfig[`${prefix}_border`]);
            document.documentElement.style.setProperty('--theme-text-base', siteConfig[`${prefix}_text_base`]);
            document.documentElement.style.setProperty('--theme-text-muted', siteConfig[`${prefix}_text_muted`]);
            document.documentElement.style.setProperty('--theme-text-inverted', siteConfig[`${prefix}_text_inverted`]);
            document.documentElement.style.setProperty('--theme-background', siteConfig[`${prefix}_background`]);
            document.documentElement.style.setProperty('--theme-background-secondary', siteConfig[`${prefix}_background_secondary`]);
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        applyTheme(newTheme);
    };


    const siteConfig = (window as any).SiteConfiguration?.theme;
    if (siteConfig?.disableThemeToggle) {
        return null; 
    }

    return (
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
        </button>
    );
};

export default ThemeToggle;
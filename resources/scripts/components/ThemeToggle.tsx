import React, { useEffect } from 'react';

const ThemeToggle = () => {
    useEffect(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');

        const siteConfig = (window as any).SiteConfiguration?.theme;
        if (siteConfig) {
            document.documentElement.style.setProperty('--theme-primary', siteConfig.dark_primary);
            document.documentElement.style.setProperty('--theme-secondary', siteConfig.dark_secondary);
            document.documentElement.style.setProperty('--theme-border', siteConfig.dark_border);
            document.documentElement.style.setProperty('--theme-text-base', siteConfig.dark_text_base);
            document.documentElement.style.setProperty('--theme-text-muted', siteConfig.dark_text_muted);
            document.documentElement.style.setProperty('--theme-text-inverted', siteConfig.dark_text_inverted);
            document.documentElement.style.setProperty('--theme-background', siteConfig.dark_background);
            document.documentElement.style.setProperty('--theme-background-secondary', siteConfig.dark_background_secondary);
        }
    }, []);

    return null;
};

export default ThemeToggle;

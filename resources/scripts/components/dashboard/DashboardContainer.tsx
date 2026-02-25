import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PowerActionsBar from '@/components/dashboard/PowerActionsBar';
import BentoBoxSection from '@/components/dashboard/BentoBoxSection';
import AnnouncementBanner from '@/components/dashboard/AnnouncementBanner';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/components/elements/rivion/SectionHeader';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    // Advanced-role users with "Server Access" permission can also view all servers.
    const canViewAllServers = !rootAdmin && ((window as any).PterodactylUser?.can_view_all_servers ?? false);
    const canToggleAdmin = rootAdmin || canViewAllServers;
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const { t } = useTranslation();

    const getAnnouncement = () => {
        const siteConfig = (window as any).SiteConfiguration;
        if (siteConfig?.announcement) {
            return siteConfig.announcement;
        }
        return { icon: '', title: '', description: '' };
    };

    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [powerActionsVisible, setPowerActionsVisible] = useState(false);

    const handlePowerAction = (server: Server) => {
        setSelectedServer(server);
        setPowerActionsVisible(true);
    };

    const closePowerActionsModal = () => {
        setPowerActionsVisible(false);
        setSelectedServer(null);
    };

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && canToggleAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && canToggleAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={t('dashboard.title')} showFlashKey={'dashboard'}>
            {canToggleAdmin && (
                <div css={tw`mb-4 flex justify-end items-center`}>
                    <div css={tw`flex items-center`}>
                        <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                            {showOnlyAdmin ? t('dashboard.showingOthersServers') : t('dashboard.showingYourServers')}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                </div>
            )}
            
            {/* Announcement Banner */}
            <AnnouncementBanner 
                announcement={getAnnouncement()} 
            />
            
            {/* Bento Box Section */}
            <BentoBoxSection />
            
            {/* Servers Section Header */}
            <SectionHeader title="Servers" />
            
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            <div css={tw`grid gap-4 grid-cols-1 lg:grid-cols-2`}>
                                {items.map((server, index) => (
                                    <ServerRow 
                                        key={server.uuid} 
                                        server={server}
                                        onPowerAction={handlePowerAction}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                {showOnlyAdmin
                                    ? t('dashboard.noOtherServers')
                                    : t('dashboard.noServers')}
                            </p>
                        )
                    }
                </Pagination>
            )}
            
            {/* Power Actions Modal */}
            <PowerActionsBar 
                server={selectedServer}
                visible={powerActionsVisible}
                onClose={closePowerActionsModal}
            />
        </PageContentBlock>
    );
};

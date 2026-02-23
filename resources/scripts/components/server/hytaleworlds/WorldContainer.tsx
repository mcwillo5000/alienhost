import React, { useEffect, useState, useRef } from 'react';
import InstallModal from '@/components/server/hytaleworlds/InstallModal';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { httpErrorToHuman } from '@/api/http';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import http from '@/api/http';
import { useLocation } from 'react-router-dom';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { formatDistanceToNow } from 'date-fns';
import Select from '@/components/elements/Select';
import Input from '@/components/elements/Input';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faClock, faThumbsUp, faGlobe, faGamepad, faSort } from '@fortawesome/free-solid-svg-icons';
const FilterContainer = styled.div`
    ${tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4`};
`;
const FilterGroup = styled.div`
    ${tw`relative flex items-center`};
`;
const FilterIcon = styled(FontAwesomeIcon)`
    display: none;
`;
const StyledSelect = styled(Select)`
    ${tw`pl-3 w-full`};
    text-align: left;
    text-align-last: left;
    & > option {
        ${tw`flex items-center`};
    }
`;
const StyledInput = styled(Input)`
    ${tw`w-full`};
`;
interface World {
    id: string;
    name: string;
    short_description: string;
    url: string;
    icon_url: string | null;
    author?: string;
    downloads?: number;
    followers?: number;
    categories?: string[];
    last_updated?: string;
}
interface SelectedWorld {
    id: string;
    name: string;
}
interface ApiResponse {
    data: World[];
    meta: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
        }
    };
}
interface Filters {
    perPage: number;
    hytale_version: string;
    search_query: string;
    sort: string;
}
const PAGE_SIZES = [
    { value: '12', label: '12 per page' },
    { value: '24', label: '24 per page' },
    { value: '36', label: '36 per page' },
    { value: '48', label: '48 per page' },
];
const SORT_OPTIONS = [
    { value: 'relevance', label: 'Sort by Relevance' },
    { value: 'downloads', label: 'Sort by Downloads' },
    { value: 'updated', label: 'Sort by Last Updated' },
];
export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);
    const { clearFlashes, addError } = useFlashKey('worlds');
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [worlds, setWorlds] = useState<PaginatedResult<World> | null>(null);
    const [selectedWorld, setSelectedWorld] = useState<SelectedWorld | null>(null);
    const [hytaleVersions, setHytaleVersions] = useState<Array<{ value: string; label: string }>>([
        { value: '', label: 'All Versions' }
    ]);
    const [filters, setFilters] = useState<Filters>({
        search_query: '',
        hytale_version: '',
        perPage: 12,
        sort: 'relevance'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const searchTimeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);
    useEffect(() => { return () => { isMountedRef.current = false; }; }, []);
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (searchTimeoutRef.current) {
            window.clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = window.setTimeout(() => {
            setFilters(prev => ({ ...prev, search_query: value }));
            setPage(1);
        }, 500);
    };
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                window.clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);
    useEffect(() => {
        loadWorlds();
    }, [page, filters]);
    useEffect(() => {
        setHytaleVersions([{ value: '', label: 'All Versions' }]);
        setFilters(prev => ({ ...prev, hytale_version: '' }));
        loadGameVersions();
    }, []);
    const loadGameVersions = () => {
        http.get(`/api/client/servers/${uuid}/hytale-worlds/hytale-versions`)
            .then(({ data }) => {
                if (!isMountedRef.current) return;
                const versions = (data || []).filter(Boolean).map((version: string) => ({
                    value: version,
                    label: version
                }));
                setHytaleVersions([
                    { value: '', label: 'All Versions' },
                    ...versions
                ]);
            })
            .catch(error => {
                if (!isMountedRef.current) return;
                console.error('Error loading Hytale versions:', error);
                addError('Failed to load Hytale versions: ' + httpErrorToHuman(error));
            });
    };
    const loadWorlds = () => {
        setLoading(true);
        clearFlashes();
        const safePageSize = filters?.perPage || 12;
        const safeSearchQuery = filters?.search_query || '';
        const safeHytaleVersion = filters?.hytale_version || '';
        const safeSort = filters?.sort || 'relevance';
        http.get<ApiResponse>(`/api/client/servers/${uuid}/hytale-worlds`, {
            params: {
                page: page,
                page_size: safePageSize,
                search_query: safeSearchQuery,
                hytale_version: safeHytaleVersion,
                sort: safeSort,
            }
        })
            .then(({ data }) => {
                if (!isMountedRef.current) return;
                if (data && data.meta && data.meta.pagination) {
                    setWorlds({
                        items: data.data || [],
                        pagination: {
                            total: data.meta.pagination.total || 0,
                            count: data.meta.pagination.count || 0,
                            perPage: data.meta.pagination.per_page || 10,
                            currentPage: data.meta.pagination.current_page || 1,
                            totalPages: data.meta.pagination.total_pages || 1
                        }
                    });
                } else {
                    setWorlds({
                        items: [],
                        pagination: {
                            total: 0,
                            count: 0,
                            perPage: 10,
                            currentPage: 1,
                            totalPages: 1
                        }
                    });
                    console.warn('Received unexpected data structure from API');
                }
            })
            .catch(error => {
                if (!isMountedRef.current) return;
                console.error('Error loading worlds:', error);
                addError('Failed to load worlds: ' + httpErrorToHuman(error));
            })
            .finally(() => {
                if (isMountedRef.current) setLoading(false);
            });
    };
    const handleInstall = (worldId: string, worldName: string) => {
        setSelectedWorld({
            id: worldId || '',
            name: worldName || 'World'
        });
    };
    const onInstallSuccess = () => {
        setMessage({ type: 'warning', text: 'World installed successfully!' });
        setTimeout(() => setMessage(null), 5000);
    };
    if (loading && !worlds) return <Spinner size={'large'} centered />;
    return (
        <ServerContentBlock
            title={'Hytale Worlds'}
            showFlashKey={'worlds'}
            css={tw`flex flex-col`}
        >
            <FlashMessageRender byKey={'worlds'} css={tw`mb-4`} />
            {message && (
                <div css={tw`mb-4 px-4 py-3 rounded text-sm`} style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                    {message.text}
                </div>
            )}
            <FilterContainer>
                <FilterGroup>
                    <FilterIcon icon={faSort} />
                    <StyledSelect
                        value={filters.perPage ? filters.perPage.toString() : '12'}
                        onChange={e => {
                            const value = e.target.value || '12';
                            setFilters(prev => ({ ...prev, perPage: parseInt(value) }));
                            setPage(1);
                        }}
                    >
                        {PAGE_SIZES.map(size => (
                            <option key={size.value} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </StyledSelect>
                </FilterGroup>
                <FilterGroup>
                    <FilterIcon icon={faGamepad} />
                    <StyledSelect
                        value={filters.hytale_version || ''}
                        onChange={e => {
                            const value = e.target.value;
                            setFilters(prev => ({ ...prev, hytale_version: value }));
                            setPage(1);
                        }}
                    >
                        {hytaleVersions && hytaleVersions.length > 0 ? hytaleVersions.map(version => (
                            <option key={version?.value || 'unknown'} value={version?.value || ''}>
                                {version?.label || 'Unknown'}
                            </option>
                        )) : (
                            <option value="">All Versions</option>
                        )}
                    </StyledSelect>
                </FilterGroup>
                <FilterGroup>
                    <FilterIcon icon={faSort} />
                    <StyledSelect
                        value={filters.sort || 'relevance'}
                        onChange={e => {
                            const value = e.target.value;
                            setFilters(prev => ({ ...prev, sort: value }));
                            setPage(1);
                        }}
                    >
                        {SORT_OPTIONS && SORT_OPTIONS.length > 0 ? SORT_OPTIONS.map(option => (
                            <option key={option?.value || 'unknown'} value={option?.value || 'downloads'}>
                                {option?.label || 'Downloads'}
                            </option>
                        )) : (
                            <option value="downloads">Downloads</option>
                        )}
                    </StyledSelect>
                </FilterGroup>
                <FilterGroup css={tw`col-span-1 md:col-span-2 lg:col-span-3`}>
                    <StyledInput
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search worlds..."
                    />
                </FilterGroup>
            </FilterContainer>
            {loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <Pagination data={worlds || { items: [], pagination: { total: 0, count: 0, perPage: 10, currentPage: 1, totalPages: 1 } }} onPageSelect={setPage}>
                    {({ items }) => (
                        <div css={tw`flex flex-col gap-2`}>
                            {items.length > 0 ? items.map((world: World) => (
                                <div
                                    key={world.id}
                                    css={tw`flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-150 cursor-pointer`}
                                    style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
                                    onClick={() => handleInstall(world.id, world.name)}
                                >
                                    {world.icon_url ? (
                                        <img src={world.icon_url} alt={world.name} css={tw`rounded w-10 h-10 object-contain flex-shrink-0`} />
                                    ) : (
                                        <div css={tw`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center`} style={{ backgroundColor: 'var(--theme-background)', border: '1px solid var(--theme-border)' }}>
                                            <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--theme-text-muted)' }} />
                                        </div>
                                    )}
                                    <div css={tw`flex flex-col flex-1 min-w-0`}>
                                        <div css={tw`flex items-center gap-2`}>
                                            <span css={tw`text-sm font-medium truncate`} style={{ color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                                                {world.name}
                                            </span>
                                        </div>
                                        <div css={tw`flex items-center gap-3 mt-0.5 flex-wrap`}>
                                            {world.author && world.author.trim() !== '' && (
                                                <span css={tw`text-xs`} style={{ color: 'var(--theme-text-muted)' }}>By {world.author}</span>
                                            )}
                                            {world.downloads !== undefined && (
                                                <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    {formatNumber(world.downloads)}
                                                </span>
                                            )}
                                            {world.followers !== undefined && (
                                                <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                    {formatNumber(world.followers)}
                                                </span>
                                            )}
                                            {world.last_updated && (
                                                <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {formatDate(world.last_updated)}
                                                </span>
                                            )}
                                            <p css={tw`text-xs line-clamp-1 flex-1 min-w-0`} style={{ color: 'var(--theme-text-muted)' }}>{world.short_description}</p>
                                        </div>
                                    </div>
                                    <button
                                        title='Install'
                                        css={tw`flex-shrink-0 p-1.5 text-sm transition-colors duration-150`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                        onClick={(e) => { e.stopPropagation(); handleInstall(world.id, world.name); }}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                </div>
                            )) : (
                                <p css={tw`text-center text-sm py-8`} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                                    No worlds found matching your criteria.
                                </p>
                            )}
                        </div>
                    )}
                </Pagination>
            )}
            {selectedWorld !== null && (
                <InstallModal
                    worldId={selectedWorld.id}
                    worldName={selectedWorld.name}
                    onInstalled={onInstallSuccess}
                    open={selectedWorld !== null}
                    onClose={() => setSelectedWorld(null)}
                />
            )}
        </ServerContentBlock>
    );
};
function formatDate(dateString: string): string {
    if (!dateString) {
        return 'Unknown date';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Unknown date';
        }
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Unknown date';
    }
}
function formatNumber(num: number): string {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    try {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    } catch (e) {
        console.error('Error formatting number:', e);
        return '0';
    }
}

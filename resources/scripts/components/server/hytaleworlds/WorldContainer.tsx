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
import Alert from '@/components/elements/alert/Alert';
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
    ${tw`absolute left-3 text-neutral-400 pointer-events-none`};
`;
const StyledSelect = styled(Select)`
    ${tw`pl-10 w-full`};
    & > option {
        ${tw`flex items-center`};
    }
`;
const StyledInput = styled(Input)`
    ${tw`w-full`};
    &::placeholder {
        ${tw`text-neutral-400`};
    }
`;
const WorldCard = styled.div`
    ${tw`bg-neutral-700 rounded-lg shadow-md transition-all duration-150 hover:shadow-lg border border-neutral-600 hover:border-neutral-500 cursor-pointer relative overflow-hidden`};
    &:hover {
        transform: translateY(-2px);
        ${tw`shadow-xl`};
        &::after {
            opacity: 0.1;
        }
    }
    &::after {
        content: '';
        ${tw`absolute inset-0 bg-white opacity-0 transition-opacity duration-150`};
    }
`;
const WorldHeader = styled.div`
    ${tw`flex items-start gap-4 p-4 border-b border-neutral-600`};
`;
const WorldIcon = styled.img`
    ${tw`w-16 h-16 rounded-lg object-cover bg-neutral-600 border-2 border-neutral-500`};
`;
const PlaceholderIcon = styled.div`
    ${tw`w-16 h-16 rounded-lg bg-neutral-600 border-2 border-neutral-500 flex items-center justify-center text-neutral-300`};
`;
const WorldInfo = styled.div`
    ${tw`flex-1 min-w-0`};
`;
const WorldDescription = styled.p`
    ${tw`mt-1 text-sm text-neutral-200 line-clamp-1`};
`;
const WorldFooter = styled.div`
    ${tw`p-4 flex items-center justify-between`};
`;
const WorldStats = styled.div`
    ${tw`text-xs text-neutral-300 flex items-center gap-4`};
`;
const StatItem = styled.span`
    ${tw`flex items-center gap-1`};
    svg {
        ${tw`text-neutral-400`};
    }
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
                const versions = data.map((version: string) => ({
                    value: version,
                    label: version
                }));
                setHytaleVersions([
                    { value: '', label: 'All Versions' },
                    ...versions
                ]);
            })
            .catch(error => {
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
                console.error('Error loading worlds:', error);
                addError('Failed to load worlds: ' + httpErrorToHuman(error));
            })
            .finally(() => {
                setLoading(false);
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
                <Alert type={message.type === 'success' ? 'warning' : message.type} className={'mb-4'}>
                    {message.text}
                </Alert>
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
                        value={filters.hytale_version}
                        onChange={e => {
                            setFilters(prev => ({ ...prev, hytale_version: e.target.value }));
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
                        value={filters.sort}
                        onChange={e => {
                            setFilters(prev => ({ ...prev, sort: e.target.value }));
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
                        <div css={tw`grid gap-4 md:grid-cols-2 lg:grid-cols-3`}>
                            {items.length > 0 ? items.map((world: World) => (
                                <WorldCard key={world.id} onClick={() => handleInstall(world.id, world.name)}>
                                    <WorldHeader>
                                        {world.icon_url ? (
                                            <WorldIcon src={world.icon_url} alt={world.name} />
                                        ) : (
                                            <PlaceholderIcon>
                                                <FontAwesomeIcon icon={faGlobe} size="2x" />
                                            </PlaceholderIcon>
                                        )}
                                        <WorldInfo>
                                            <h3 css={tw`text-sm font-semibold truncate mb-1`}>
                                                {world.name}
                                            </h3>
                                            {world.author && world.author.trim() !== '' && (
                                                <p css={tw`text-xs text-neutral-300 mb-1`}>
                                                    By {world.author}
                                                </p>
                                            )}
                                            <WorldDescription>
                                                {world.short_description}
                                            </WorldDescription>
                                        </WorldInfo>
                                    </WorldHeader>
                                    <WorldFooter>
                                        <WorldStats>
                                            {world.downloads !== undefined && (
                                                <StatItem>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    {formatNumber(world.downloads)}
                                                </StatItem>
                                            )}
                                            {world.followers !== undefined && (
                                                <StatItem>
                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                    {formatNumber(world.followers)}
                                                </StatItem>
                                            )}
                                            {world.last_updated && (
                                                <StatItem>
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {formatDate(world.last_updated)}
                                                </StatItem>
                                            )}
                                        </WorldStats>
                                    </WorldFooter>
                                </WorldCard>
                            )) : (
                                <div css={tw`col-span-full`}>
                                    <Alert type="warning">
                                        No worlds found matching your criteria.
                                    </Alert>
                                </div>
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

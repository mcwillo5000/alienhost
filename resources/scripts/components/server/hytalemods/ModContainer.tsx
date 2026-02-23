import React, { useEffect, useState, useRef } from 'react';
import InstallModal from '@/components/server/hytalemods/InstallModal';
import InstalledModsContainer from '@/components/server/hytalemods/InstalledModsContainer';
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
import { faDownload, faClock, faThumbsUp, faPuzzlePiece, faGamepad, faSort, faCheckCircle, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import getInstalledMods from '@/api/server/hytalemods/getInstalledMods';
const FilterContainer = styled.div`
    ${tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-4`};
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
const ActionButton = styled.button`
    ${tw`text-sm w-full flex items-center justify-center gap-2 p-3 rounded border transition-colors duration-150 whitespace-nowrap cursor-pointer`};
    background-color: var(--theme-background-secondary);
    border-color: var(--theme-border);
    color: var(--theme-text-muted);
    &:hover {
        border-color: var(--theme-primary);
        color: var(--theme-primary);
    }
`;
interface Mod {
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
interface SelectedMod {
    id: string;
    name: string;
}
interface ApiResponse {
    data: Mod[];
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
    const { clearFlashes, addError } = useFlashKey('mods');
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [mods, setMods] = useState<PaginatedResult<Mod> | null>(null);
    const [selectedMod, setSelectedMod] = useState<SelectedMod | null>(null);
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
    const [showInstalled, setShowInstalled] = useState(false);
    const [installedModIds, setInstalledModIds] = useState<Set<string>>(new Set());
    const [installedCount, setInstalledCount] = useState(0);
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
    const loadInstalledModIds = () => {
        getInstalledMods(uuid)
            .then((data) => {
                if (!isMountedRef.current) return;
                const ids = new Set(data.map((m: any) => m.mod_id));
                setInstalledModIds(ids);
                setInstalledCount(data.length);
            })
            .catch(() => {
                // silently fail
            });
    };
    useEffect(() => {
        loadMods();
    }, [page, filters]);
    useEffect(() => {
        setHytaleVersions([{ value: '', label: 'All Versions' }]);
        setFilters(prev => ({ ...prev, hytale_version: '' }));
        loadGameVersions();
        loadInstalledModIds();
    }, []);
    const loadGameVersions = () => {
        http.get(`/api/client/servers/${uuid}/hytale-mods/hytale-versions`)
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
    const loadMods = () => {
        setLoading(true);
        clearFlashes();
        const safePageSize = filters?.perPage || 12;
        const safeSearchQuery = filters?.search_query || '';
        const safeHytaleVersion = filters?.hytale_version || '';
        const safeSort = filters?.sort || 'relevance';
        http.get<ApiResponse>(`/api/client/servers/${uuid}/hytale-mods`, {
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
                    setMods({
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
                    setMods({
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
                console.error('Error loading mods:', error);
                addError('Failed to load mods: ' + httpErrorToHuman(error));
            })
            .finally(() => {
                if (isMountedRef.current) setLoading(false);
            });
    };
    const handleInstall = (modId: string, modName: string) => {
        setSelectedMod({
            id: modId || '',
            name: modName || 'Mod'
        });
    };
    const onInstallSuccess = () => {
        setMessage({ type: 'warning', text: 'Mod installed successfully!' });
        setTimeout(() => setMessage(null), 5000);
        loadInstalledModIds();
    };
    if (loading && !mods) return <Spinner size={'large'} centered />;
    return (
        <ServerContentBlock
            title={'Hytale Mods'}
            showFlashKey={'mods'}
            css={tw`flex flex-col`}
        >
            <FlashMessageRender byKey={'mods'} css={tw`mb-4`} />
            {message && (
                <div css={tw`mb-4 px-4 py-3 rounded text-sm`} style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                    {message.text}
                </div>
            )}
            {showInstalled ? (
                <InstalledModsContainer onBack={() => { setShowInstalled(false); loadInstalledModIds(); }} />
            ) : (
            <>
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
                        placeholder="Search mods..."
                    />
                </FilterGroup>
                <FilterGroup>
                    <ActionButton onClick={() => setShowInstalled(true)}>
                        <FontAwesomeIcon icon={faBoxOpen} />
                        Installed{installedCount > 0 ? ` (${installedCount})` : ''}
                    </ActionButton>
                </FilterGroup>
            </FilterContainer>
            {loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <Pagination data={mods || { items: [], pagination: { total: 0, count: 0, perPage: 10, currentPage: 1, totalPages: 1 } }} onPageSelect={setPage}>
                    {({ items }) => (
                        <div css={tw`flex flex-col gap-2`}>
                            {items.length > 0 ? items.map((mod: Mod) => (
                                <div
                                    key={mod.id}
                                    css={tw`flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-150 cursor-pointer`}
                                    style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-border)')}
                                    onClick={() => handleInstall(mod.id, mod.name)}
                                >
                                    {mod.icon_url ? (
                                        <img src={mod.icon_url} alt={mod.name} css={tw`rounded w-10 h-10 object-contain flex-shrink-0`} />
                                    ) : (
                                        <div css={tw`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center`} style={{ backgroundColor: 'var(--theme-background)', border: '1px solid var(--theme-border)' }}>
                                            <FontAwesomeIcon icon={faPuzzlePiece} style={{ color: 'var(--theme-text-muted)' }} />
                                        </div>
                                    )}
                                    <div css={tw`flex flex-col flex-1 min-w-0`}>
                                        <div css={tw`flex items-center gap-2`}>
                                            <span css={tw`text-sm font-medium truncate`} style={{ color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                                                {mod.name}
                                            </span>
                                            {installedModIds.has(mod.id) && (
                                                <span css={tw`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0`} style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Installed
                                                </span>
                                            )}
                                        </div>
                                        <div css={tw`flex items-center gap-3 mt-0.5 flex-wrap`}>
                                            {mod.author && mod.author.trim() !== '' && (
                                                <span css={tw`text-xs`} style={{ color: 'var(--theme-text-muted)' }}>By {mod.author}</span>
                                            )}
                                            {mod.downloads !== undefined && (
                                                <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    {formatNumber(mod.downloads)}
                                                </span>
                                            )}
                                            {mod.followers !== undefined && (
                                                <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                    {formatNumber(mod.followers)}
                                                </span>
                                            )}
                                            {mod.last_updated && (
                                                <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {formatDate(mod.last_updated)}
                                                </span>
                                            )}
                                            <p css={tw`text-xs line-clamp-1 flex-1 min-w-0`} style={{ color: 'var(--theme-text-muted)' }}>{mod.short_description}</p>
                                        </div>
                                    </div>
                                    <button
                                        title='Install'
                                        css={tw`flex-shrink-0 p-1.5 text-sm transition-colors duration-150`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                        onClick={(e) => { e.stopPropagation(); handleInstall(mod.id, mod.name); }}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                </div>
                            )) : (
                                <p css={tw`text-center text-sm py-8`} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                                    No mods found matching your criteria.
                                </p>
                            )}
                        </div>
                    )}
                </Pagination>
            )}
            {selectedMod !== null && (
                <InstallModal
                    modId={selectedMod.id}
                    modName={selectedMod.name}
                    onInstalled={onInstallSuccess}
                    open={selectedMod !== null}
                    onClose={() => setSelectedMod(null)}
                />
            )}
            </>
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

import React, { useEffect, useState, useRef } from 'react';
import InstallModal from '@/components/server/mods/InstallModal';
import InstalledModsContainer from '@/components/server/mods/InstalledModsContainer';
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
import { faDownload, faClock, faThumbsUp, faBars, faPuzzlePiece, faGamepad, faSort, faExclamationCircle, faCheckCircle, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import getInstalledMods from '@/api/server/mods/getInstalledMods';
import { Button } from '@/components/elements/button/index';

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
    background-color: var(--theme-background);
    border-color: var(--theme-border);
    color: var(--theme-text-base);
    text-align: left;
    text-align-last: left;
    & > option {
        ${tw`flex items-center`};
        text-align: left;
    }
`;

const StyledInput = styled(Input)`
    ${tw`w-full`};
    background-color: var(--theme-background);
    border-color: var(--theme-border);
    color: var(--theme-text-base);
    &::placeholder {
        color: var(--theme-text-muted);
    }
`;

const ActionButton = styled.button`
    ${tw`text-sm w-full flex items-center justify-center gap-2 p-3 rounded border transition-colors duration-150 whitespace-nowrap cursor-pointer`};
    background-color: var(--theme-background);
    border-color: var(--theme-border);
    color: var(--theme-text-base);
    &:hover {
        border-color: var(--theme-primary);
        color: var(--theme-primary);
    }
`;

const InstalledBadge = styled.span`
    ${tw`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold bg-green-500 bg-opacity-90 text-white flex-shrink-0`};
`;

const ModCard = styled.div`
    ${tw`flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors duration-150`};
    background-color: var(--theme-background-secondary);
    border: 1px solid var(--theme-border);
    &:hover {
        border-color: var(--theme-primary);
    }
`;

const ModIcon = styled.img`
    ${tw`w-10 h-10 rounded object-contain flex-shrink-0`};
    background-color: var(--theme-background);
    border: 1px solid var(--theme-border);
`;

const PlaceholderIcon = styled.div`
    ${tw`w-10 h-10 rounded flex items-center justify-center flex-shrink-0`};
    background-color: var(--theme-background);
    border: 1px solid var(--theme-border);
    color: var(--theme-text-muted);
`;

const ModInfo = styled.div`
    ${tw`flex flex-col flex-1 min-w-0`};
`;

const ModDescription = styled.p`
    ${tw`text-xs line-clamp-1 mt-0.5`};
    color: var(--theme-text-muted);
`;

const ModStats = styled.div`
    ${tw`flex items-center gap-3 text-xs flex-wrap mt-0.5`};
    color: var(--theme-text-muted);
`;

const StatItem = styled.span`
    ${tw`flex items-center gap-1`};
    svg {
        color: var(--theme-text-muted);
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
    provider: string;
    minecraft_version: string;
    mod_loader: string;
    search_query: string;
    sort: string;
}

const PAGE_SIZES = [
    { value: '12', label: '12 per page' },
    { value: '24', label: '24 per page' },
    { value: '36', label: '36 per page' },
    { value: '48', label: '48 per page' },
];

const PROVIDERS = [
    { value: 'modrinth', label: 'Modrinth' },
    { value: 'curseforge', label: 'CurseForge' },
];

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Sort by Relevance' },
    { value: 'downloads', label: 'Sort by Downloads' },
    { value: 'updated', label: 'Sort by Last Updated' },
];

const MOD_LOADERS = [
    { value: '', label: 'All Loaders' },
    { value: 'forge', label: 'Forge' },
    { value: 'neoforge', label: 'NeoForge' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'liteloader', label: 'LiteLoader' },
    { value: 'quilt', label: 'Quilt' },
    { value: 'modloader', label: 'Risugami\'s ModLoader' },
    { value: 'rift', label: 'Rift' },
];

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);

    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);
    const { clearFlashes, addError } = useFlashKey('mods');
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [mods, setMods] = useState<PaginatedResult<Mod> | null>(null);
    const [selectedMod, setSelectedMod] = useState<{ id: string; name: string; provider: string } | null>(null);
    const [minecraftVersions, setMinecraftVersions] = useState<Array<{ value: string; label: string }>>([
        { value: '', label: 'All Versions' }
    ]);
    const [filters, setFilters] = useState<Filters>({
        search_query: '',
        provider: 'modrinth',
        minecraft_version: '',
        mod_loader: '',
        perPage: 12,
        sort: 'relevance'
    });


    useEffect(() => {
        if (!filters || !filters.provider) {
            setFilters(prev => ({
                search_query: prev?.search_query || '',
                provider: 'modrinth',
                minecraft_version: prev?.minecraft_version || '',
                mod_loader: prev?.mod_loader || '',
                perPage: prev?.perPage || 12,
                sort: prev?.sort || 'relevance'
            }));
        }
    }, [filters]);
    const [searchTerm, setSearchTerm] = useState('');
    const searchTimeoutRef = useRef<number | null>(null);
    const [showInstalled, setShowInstalled] = useState(false);
    const [installedModIds, setInstalledModIds] = useState<Set<string>>(new Set());
    const [installedCount, setInstalledCount] = useState(0);

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
        loadMods();
    }, [page, filters]);

    const loadInstalledModIds = () => {
        getInstalledMods(uuid)
            .then((data) => {
                const ids = new Set(data.map((m: any) => m.mod_id));
                setInstalledModIds(ids);
                setInstalledCount(data.length);
            })
            .catch(() => {
                // silently fail
            });
    };

    useEffect(() => {
        loadInstalledModIds();
    }, []);

    useEffect(() => {
        setMinecraftVersions([{ value: '', label: 'All Versions' }]);
        setFilters(prev => ({ ...prev, minecraft_version: '', mod_loader: '' }));
        loadGameVersions();
    }, [filters.provider]);

    const loadGameVersions = () => {
        http.get(`/api/client/servers/${uuid}/mods/minecraft-versions`, {
            params: { provider: filters.provider }
        })
            .then(({ data }) => {
                const versions = data.map((version: string) => ({
                    value: version,
                    label: version
                }));

                setMinecraftVersions([
                    { value: '', label: 'All Versions' },
                    ...versions
                ]);
            })
            .catch(error => {
                console.error('Error loading Minecraft versions:', error);
                addError('Failed to load Minecraft versions: ' + httpErrorToHuman(error));
            });
    };

    const loadMods = () => {
        setLoading(true);
        clearFlashes();


        const safeProvider = filters?.provider || 'modrinth';
        const safePageSize = filters?.perPage || 12;
        const safeSearchQuery = filters?.search_query || '';
        const safeMinecraftVersion = filters?.minecraft_version || '';
        const safeModLoader = filters?.mod_loader || '';
        const safeSort = filters?.sort || 'relevance';

        http.get<ApiResponse>(`/api/client/servers/${uuid}/mods`, {
            params: {
                page: page,
                page_size: safePageSize,
                provider: safeProvider,
                search_query: safeSearchQuery,
                minecraft_version: safeMinecraftVersion,
                mod_loader: safeModLoader,
                sort: safeSort,
            }
        })
            .then(({ data }) => {

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
                console.error('Error loading mods:', error);
                addError('Failed to load mods: ' + httpErrorToHuman(error));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleInstall = (modId: string, modName: string) => {

        const safeProvider = filters.provider || 'modrinth';

        setSelectedMod({
            id: modId || '',
            name: modName || 'Mod',
            provider: safeProvider
        });
    };

    const onInstallSuccess = () => {
        setMessage({ type: 'warning', text: 'Mod installed successfully!' });
        setTimeout(() => setMessage(null), 5000);
        loadInstalledModIds();
    };

    if (loading && !mods) return (
        <ServerContentBlock title={'Minecraft Mods'}>
            <div css={tw`flex items-center justify-center h-64`}>
                <Spinner size={'large'} />
            </div>
        </ServerContentBlock>
    );

    return (
        <ServerContentBlock
            title={'Minecraft Mods'}
            showFlashKey={'mods'}
            css={tw`flex flex-col`}
        >
            <FlashMessageRender byKey={'mods'} css={tw`mb-4`} />
            {message && (
                <div
                    css={tw`mb-4 p-3 rounded text-sm`}
                    style={{
                        backgroundColor: message.type === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(var(--theme-primary-rgb),0.1)',
                        border: `1px solid ${message.type === 'danger' ? 'rgba(239,68,68,0.3)' : 'var(--theme-border)'}`,
                        color: message.type === 'danger' ? '#ef4444' : 'var(--theme-text-base)',
                        fontFamily: "'Electrolize', sans-serif",
                    }}
                >
                    {message.text}
                </div>
            )}

            {showInstalled ? (
                <InstalledModsContainer onBack={() => { setShowInstalled(false); loadInstalledModIds(); }} />
            ) : (
            <>
            {filters.provider === 'spigotmc' || filters.provider === 'curseforge' ? (
                <FilterContainer css={tw`grid-cols-1 md:grid-cols-2 lg:grid-cols-6`}>
                    <FilterGroup>
                        <FilterIcon icon={faBars} />
                        <StyledSelect
                            value={filters.provider || 'modrinth'}
                            onChange={e => {
                                const value = e?.target?.value || 'modrinth';
                                try {
                                    setFilters(prev => ({ ...prev, provider: value, minecraft_version: '', mod_loader: '' }));
                                    setPage(1);
                                } catch (error) {
                                    console.error('Error changing provider:', error);
                                }
                            }}
                        >
                            {PROVIDERS.map(provider => (
                                <option key={provider.value} value={provider.value}>
                                    {provider.label}
                                </option>
                            ))}
                        </StyledSelect>
                    </FilterGroup>

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
                            value={filters.minecraft_version}
                            onChange={e => {
                                setFilters(prev => ({ ...prev, minecraft_version: e.target.value }));
                                setPage(1);
                            }}
                        >
                            {minecraftVersions && minecraftVersions.length > 0 ? minecraftVersions.map(version => (
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

                    <FilterGroup>
                        <StyledInput
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search mods..."
                        />
                    </FilterGroup>
                    <FilterGroup>
                        <Button className='w-full h-11' onClick={() => setShowInstalled(true)}>
                            <FontAwesomeIcon icon={faBoxOpen} css={tw`mr-1`} />
                            Installed{installedCount > 0 ? ` (${installedCount})` : ''}
                        </Button>
                    </FilterGroup>
                </FilterContainer>
            ) : (
                <FilterContainer>
                    <FilterGroup>
                        <FilterIcon icon={faBars} />
                        <StyledSelect
                            value={filters.provider || 'modrinth'}
                            onChange={e => {
                                const value = e?.target?.value || 'modrinth';
                                try {
                                    setFilters(prev => ({ ...prev, provider: value, minecraft_version: '', mod_loader: '' }));
                                    setPage(1);
                                } catch (error) {
                                    console.error('Error changing provider:', error);
                                }
                            }}
                        >
                            {PROVIDERS.map(provider => (
                                <option key={provider.value} value={provider.value}>
                                    {provider.label}
                                </option>
                            ))}
                        </StyledSelect>
                    </FilterGroup>

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
                            value={filters.minecraft_version}
                            onChange={e => {
                                setFilters(prev => ({ ...prev, minecraft_version: e.target.value }));
                                setPage(1);
                            }}
                        >
                            {minecraftVersions && minecraftVersions.length > 0 ? minecraftVersions.map(version => (
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

                    <FilterGroup>
                        <StyledInput
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search mods..."
                        />
                    </FilterGroup>
                    <FilterGroup>
                        <Button className='w-full h-11' onClick={() => setShowInstalled(true)}>
                            <FontAwesomeIcon icon={faBoxOpen} css={tw`mr-1`} />
                            Installed{installedCount > 0 ? ` (${installedCount})` : ''}
                        </Button>
                    </FilterGroup>
                </FilterContainer>
            )}

            {loading ? (
                <div css={tw`flex items-center justify-center py-16`}>
                    <Spinner size={'large'} />
                </div>
            ) : (
                <Pagination data={mods || { items: [], pagination: { total: 0, count: 0, perPage: 10, currentPage: 1, totalPages: 1 } }} onPageSelect={setPage}>
                    {({ items }) => (
                        <div css={tw`flex flex-col gap-2`}>
                            {items.length > 0 ? items.map((mod: Mod) => (
                                <ModCard key={mod.id} onClick={() => handleInstall(mod.id, mod.name)}>
                                    {mod.icon_url ? (
                                        <ModIcon src={mod.icon_url} alt={mod.name} />
                                    ) : (
                                        <PlaceholderIcon>
                                            <FontAwesomeIcon icon={faPuzzlePiece} />
                                        </PlaceholderIcon>
                                    )}
                                    <ModInfo>
                                        <div css={tw`flex items-center gap-2 min-w-0`}>
                                            <h3 css={tw`text-sm font-semibold truncate`} style={{ color: 'var(--theme-text-base)' }}>
                                                {mod.name}
                                            </h3>
                                            {installedModIds.has(mod.id) && (
                                                <InstalledBadge>
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Installed
                                                </InstalledBadge>
                                            )}
                                        </div>
                                        <ModStats>
                                            {mod.author && mod.author.trim() !== '' && (
                                                <StatItem>{mod.author}</StatItem>
                                            )}
                                            {mod.downloads !== undefined && (
                                                <StatItem>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    {formatNumber(mod.downloads)}
                                                </StatItem>
                                            )}
                                            {mod.followers !== undefined && filters.provider !== 'curseforge' && (
                                                <StatItem>
                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                    {formatNumber(mod.followers)}
                                                </StatItem>
                                            )}
                                            {mod.last_updated && (
                                                <StatItem>
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {formatDate(mod.last_updated)}
                                                </StatItem>
                                            )}
                                        </ModStats>
                                        <ModDescription>{mod.short_description}</ModDescription>
                                    </ModInfo>
                                </ModCard>
                            )) : (
                                <div css={tw`col-span-full text-center py-10`}>
                                    <FontAwesomeIcon
                                        icon={faPuzzlePiece}
                                        css={tw`w-12 h-12 mx-auto mb-3`}
                                        style={{ color: 'var(--theme-text-muted)', fontSize: '3rem' }}
                                    />
                                    <p css={tw`text-sm`} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                                        No mods found matching your criteria.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Pagination>
            )}

            {selectedMod !== null && (
                <InstallModal
                    modId={selectedMod.id}
                    modName={selectedMod.name}
                    provider={selectedMod.provider}
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


function version_compare(a: string, b: string): number {
    const pa = a.split('.');
    const pb = b.split('.');

    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = Number(pa[i]) || 0;
        const nb = Number(pb[i]) || 0;

        if (na > nb) return 1;
        if (nb > na) return -1;
    }

    return 0;
}

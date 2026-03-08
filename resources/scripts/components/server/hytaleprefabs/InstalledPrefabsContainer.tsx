import React, { useEffect, useState, useRef } from 'react';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { httpErrorToHuman } from '@/api/http';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import Input from '@/components/elements/Input';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCube, faClock, faArrowLeft, faSync, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import getInstalledPrefabs, { InstalledPrefab } from '@/api/server/hytaleprefabs/getInstalledPrefabs';
import removePrefab from '@/api/server/hytaleprefabs/removePrefab';
import installPrefab from '@/api/server/hytaleprefabs/installPrefab';
import Select from '@/components/elements/Select';

interface Props {
    onBack: () => void;
}

const FilterContainer = styled.div`
    ${tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4`};
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

const UpdateBadge = styled.span`
    ${tw`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`};
    background-color: rgba(234,179,8,0.15);
    color: #fde047;
    border: 1px solid rgba(234,179,8,0.3);
`;

const UpToDateBadge = styled.span`
    ${tw`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`};
    background-color: rgba(34,197,94,0.15);
    color: #4ade80;
    border: 1px solid rgba(34,197,94,0.3);
`;

const FILTER_OPTIONS = [
    { value: 'all', label: 'All Prefabs' },
    { value: 'up_to_date', label: 'Up to Date' },
    { value: 'update_available', label: 'Update Available' },
];

function formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown date';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Yesterday';
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        if (diff < 2592000000) return `${Math.floor(diff / 604800000)}w ago`;
        if (diff < 31536000000) return `${Math.floor(diff / 2592000000)}mo ago`;
        return `${Math.floor(diff / 31536000000)}y ago`;
    } catch {
        return 'Unknown date';
    }
}

export default ({ onBack }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlashKey('installed-prefabs');
    const [loading, setLoading] = useState(true);
    const [prefabs, setPrefabs] = useState<InstalledPrefab[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<InstalledPrefab | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const searchTimeoutRef = useRef<number | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (searchTimeoutRef.current) {
            window.clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = window.setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                window.clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const loadInstalledPrefabs = () => {
        setLoading(true);
        clearFlashes();
        getInstalledPrefabs(uuid)
            .then((data) => {
                setPrefabs(data);
            })
            .catch((error) => {
                console.error('Error loading installed prefabs:', error);
                addError('Failed to load installed prefabs: ' + httpErrorToHuman(error));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadInstalledPrefabs();
    }, []);

    const filteredPrefabs = prefabs.filter((prefab) => {
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            const name = (prefab.prefab_name || '').toLowerCase();
            const author = (prefab.prefab_author || '').toLowerCase();
            if (!name.includes(q) && !author.includes(q)) return false;
        }
        if (filter === 'up_to_date') return !prefab.has_update;
        if (filter === 'update_available') return prefab.has_update;
        return true;
    });

    const handleRemove = (prefab: InstalledPrefab) => {
        setConfirmRemove(prefab);
    };

    const confirmRemovePrefab = () => {
        if (!confirmRemove) return;
        setRemoving(confirmRemove.prefab_id);
        setConfirmRemove(null);
        removePrefab(uuid, confirmRemove.prefab_id)
            .then(() => {
                setMessage({ type: 'success', text: `${confirmRemove.prefab_name || 'Prefab'} has been removed.` });
                setTimeout(() => setMessage(null), 5000);
                loadInstalledPrefabs();
            })
            .catch((error) => {
                console.error('Error removing prefab:', error);
                setMessage({ type: 'danger', text: 'Failed to remove prefab: ' + httpErrorToHuman(error) });
                setTimeout(() => setMessage(null), 5000);
            })
            .finally(() => setRemoving(null));
    };

    const handleUpdate = (prefab: InstalledPrefab) => {
        if (!prefab.latest_version_id) return;
        setUpdating(prefab.prefab_id);
        installPrefab(uuid, prefab.prefab_id, prefab.latest_version_id, prefab.prefab_name, prefab.prefab_icon, prefab.prefab_author)
            .then(() => {
                setMessage({ type: 'success', text: `${prefab.prefab_name || 'Prefab'} updated successfully!` });
                setTimeout(() => setMessage(null), 5000);
                loadInstalledPrefabs();
            })
            .catch((error) => {
                console.error('Error updating prefab:', error);
                setMessage({ type: 'danger', text: 'Failed to update prefab: ' + httpErrorToHuman(error) });
                setTimeout(() => setMessage(null), 5000);
            })
            .finally(() => setUpdating(null));
    };

    if (loading) return <Spinner size={'large'} centered />;

    return (
        <FuturisticContentBox title={'Installed Prefabs'}>
            <FlashMessageRender byKey={'installed-prefabs'} css={tw`mb-4`} />
            {message && (
                <div css={tw`mb-4 px-4 py-3 rounded text-sm`} style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                    {message.text}
                </div>
            )}

            <FilterContainer>
                <FilterGroup>
                    <FilterIcon icon={faFilter} />
                    <StyledSelect
                        value={filter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const value = e.target.value;
                            setFilter(value);
                        }}
                    >
                        {FILTER_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </StyledSelect>
                </FilterGroup>
                <FilterGroup css={tw`col-span-1 md:col-span-2 lg:col-span-3`}>
                    <StyledInput
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search installed prefabs..."
                    />
                </FilterGroup>
                <FilterGroup>
                    <Button className='w-full h-11' onClick={onBack}>
                        <FontAwesomeIcon icon={faArrowLeft} css={tw`mr-1`} />
                        Browse
                    </Button>
                </FilterGroup>
            </FilterContainer>

            {filteredPrefabs.length === 0 ? (
                <div css={tw`flex flex-col items-center justify-center py-12`} style={{ color: 'var(--theme-text-muted)' }}>
                    <FontAwesomeIcon icon={faCube} css={tw`h-10 w-10 mb-3`} />
                    <p css={tw`text-sm`} style={{ fontFamily: "'Electrolize', sans-serif" }}>
                        {prefabs.length === 0
                            ? 'No prefabs installed yet. Browse and install prefabs using the "Browse" button.'
                            : 'No installed prefabs match your search criteria.'}
                    </p>
                </div>
            ) : (
                <div css={tw`flex flex-col gap-2`}>
                    {filteredPrefabs.map((prefab) => (
                        <div
                            key={prefab.prefab_id}
                            css={tw`flex items-center gap-3 px-3 py-2.5 rounded`}
                            style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                        >
                            {prefab.prefab_icon ? (
                                <img src={prefab.prefab_icon} alt={prefab.prefab_name} css={tw`rounded w-10 h-10 object-contain flex-shrink-0`} />
                            ) : (
                                <div css={tw`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center`} style={{ backgroundColor: 'var(--theme-background)', border: '1px solid var(--theme-border)' }}>
                                    <FontAwesomeIcon icon={faCube} style={{ color: 'var(--theme-text-muted)' }} />
                                </div>
                            )}
                            <div css={tw`flex flex-col flex-1 min-w-0`}>
                                <div css={tw`flex items-center gap-2 flex-wrap`}>
                                    <span css={tw`text-sm font-medium truncate`} style={{ color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                                        {prefab.prefab_name || `Prefab ${prefab.prefab_id}`}
                                    </span>
                                    {prefab.has_update ? (
                                        <UpdateBadge>
                                            <FontAwesomeIcon icon={faSync} />
                                            Update Available
                                        </UpdateBadge>
                                    ) : (
                                        <UpToDateBadge>Up to Date</UpToDateBadge>
                                    )}
                                </div>
                                <div css={tw`flex items-center gap-3 mt-0.5 flex-wrap`}>
                                    {prefab.prefab_author && (
                                        <span css={tw`text-xs`} style={{ color: 'var(--theme-text-muted)' }}>By {prefab.prefab_author}</span>
                                    )}
                                    <span css={tw`text-xs truncate max-w-xs`} style={{ color: 'var(--theme-text-muted)' }} title={prefab.file_name}>{prefab.file_name}</span>
                                    {prefab.installed_at && (
                                        <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                            <FontAwesomeIcon icon={faClock} />
                                            {formatDate(prefab.installed_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div css={tw`flex-shrink-0 flex items-center gap-1`}>
                                {prefab.has_update && prefab.latest_version_id && (
                                    <button
                                        title='Update'
                                        css={tw`p-1.5 text-sm transition-colors duration-150`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                        onClick={() => handleUpdate(prefab)}
                                        disabled={removing === prefab.prefab_id || updating === prefab.prefab_id}
                                    >
                                        {updating === prefab.prefab_id ? <Spinner size={'small'} /> : <FontAwesomeIcon icon={faSync} />}
                                    </button>
                                )}
                                <button
                                    title='Remove'
                                    css={tw`p-1.5 text-sm transition-colors duration-150`}
                                    style={{ color: 'var(--theme-text-muted)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                    onClick={() => handleRemove(prefab)}
                                    disabled={removing === prefab.prefab_id || updating === prefab.prefab_id}
                                >
                                    {removing === prefab.prefab_id ? <Spinner size={'small'} /> : <FontAwesomeIcon icon={faTrash} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Remove Dialog */}
            <Dialog
                open={confirmRemove !== null}
                onClose={() => setConfirmRemove(null)}
                title={'Remove Prefab'}
                hideCloseIcon={false}
            >
                <div css={tw`py-4`}>
                    <p css={tw`text-neutral-200`}>
                        Are you sure you want to remove <strong>{confirmRemove?.prefab_name || 'this prefab'}</strong>?
                        This will delete the prefab file from the server.
                    </p>
                    <Dialog.Footer>
                        <Button.Text
                            className={'w-full sm:w-auto'}
                            onClick={() => setConfirmRemove(null)}
                        >
                            Cancel
                        </Button.Text>
                        <Button.Danger
                            className={'w-full sm:w-auto'}
                            onClick={confirmRemovePrefab}
                        >
                            <FontAwesomeIcon icon={faTrash} css={tw`mr-2`} />
                            Remove Prefab
                        </Button.Danger>
                    </Dialog.Footer>
                </div>
            </Dialog>
        </FuturisticContentBox>
    );
};

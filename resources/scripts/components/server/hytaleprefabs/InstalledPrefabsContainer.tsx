import React, { useEffect, useState, useRef } from 'react';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { httpErrorToHuman } from '@/api/http';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import Alert from '@/components/elements/alert/Alert';
import Input from '@/components/elements/Input';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCube, faClock, faArrowLeft, faSync, faDownload, faFilter } from '@fortawesome/free-solid-svg-icons';
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

const ActionButton = styled.button`
    ${tw`text-sm w-full flex items-center justify-center gap-2 p-3 rounded border transition-colors duration-150 whitespace-nowrap cursor-pointer`};
    ${tw`bg-neutral-600 border-neutral-500 text-neutral-200 hover:border-neutral-400 hover:text-neutral-100`};
`;

const PrefabCard = styled.div`
    ${tw`bg-neutral-700 rounded-lg shadow-md border border-neutral-600 overflow-hidden`};
`;

const PrefabHeader = styled.div`
    ${tw`flex items-start gap-4 p-4`};
`;

const PrefabIcon = styled.img`
    ${tw`w-14 h-14 rounded-lg object-cover bg-neutral-600 border-2 border-neutral-500`};
`;

const PlaceholderIcon = styled.div`
    ${tw`w-14 h-14 rounded-lg bg-neutral-600 border-2 border-neutral-500 flex items-center justify-center text-neutral-300`};
`;

const PrefabInfo = styled.div`
    ${tw`flex-1 min-w-0`};
`;

const PrefabActions = styled.div`
    ${tw`flex items-center gap-2 p-4 pt-0`};
`;

const UpdateBadge = styled.span`
    ${tw`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30`};
`;

const UpToDateBadge = styled.span`
    ${tw`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30`};
`;

const FileName = styled.span`
    ${tw`text-xs text-neutral-400 block mt-1 truncate`};
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
        <div>
            <FlashMessageRender byKey={'installed-prefabs'} css={tw`mb-4`} />
            {message && (
                <Alert type={message.type === 'success' ? 'warning' : message.type} className={'mb-4'}>
                    {message.text}
                </Alert>
            )}

            <FilterContainer>
                <FilterGroup>
                    <FilterIcon icon={faFilter} />
                    <StyledSelect
                        value={filter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
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
                    <ActionButton onClick={onBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Browse
                    </ActionButton>
                </FilterGroup>
            </FilterContainer>

            {filteredPrefabs.length === 0 ? (
                <Alert type="warning" className="mt-4">
                    {prefabs.length === 0
                        ? 'No prefabs installed yet. Browse and install prefabs using the "Browse" button.'
                        : 'No installed prefabs match your search criteria.'}
                </Alert>
            ) : (
                <div css={tw`grid gap-4 md:grid-cols-2 lg:grid-cols-3`}>
                    {filteredPrefabs.map((prefab) => (
                        <PrefabCard key={prefab.prefab_id}>
                            <PrefabHeader>
                                {prefab.prefab_icon ? (
                                    <PrefabIcon src={prefab.prefab_icon} alt={prefab.prefab_name} />
                                ) : (
                                    <PlaceholderIcon>
                                        <FontAwesomeIcon icon={faCube} size="lg" />
                                    </PlaceholderIcon>
                                )}
                                <PrefabInfo>
                                    <h3 css={tw`text-sm font-semibold truncate mb-0.5`}>
                                        {prefab.prefab_name || `Prefab ${prefab.prefab_id}`}
                                    </h3>
                                    {prefab.prefab_author && (
                                        <p css={tw`text-xs text-neutral-300 mb-1`}>
                                            By {prefab.prefab_author}
                                        </p>
                                    )}
                                    <FileName title={prefab.file_name}>
                                        {prefab.file_name}
                                    </FileName>
                                    <div css={tw`flex items-center gap-2 mt-2 flex-wrap`}>
                                        {prefab.has_update ? (
                                            <UpdateBadge>
                                                <FontAwesomeIcon icon={faSync} css={tw`mr-1`} />
                                                Update Available
                                            </UpdateBadge>
                                        ) : (
                                            <UpToDateBadge>Up to Date</UpToDateBadge>
                                        )}
                                    </div>
                                    {prefab.installed_at && (
                                        <p css={tw`text-xs text-neutral-400 mt-1 flex items-center gap-1`}>
                                            <FontAwesomeIcon icon={faClock} />
                                            Installed {formatDate(prefab.installed_at)}
                                        </p>
                                    )}
                                </PrefabInfo>
                            </PrefabHeader>
                            <PrefabActions>
                                {prefab.has_update && prefab.latest_version_id ? (
                                    <Button
                                        size={Button.Sizes.Small}
                                        css={tw`flex-1`}
                                        onClick={() => handleUpdate(prefab)}
                                        disabled={removing === prefab.prefab_id || updating === prefab.prefab_id}
                                    >
                                        {updating === prefab.prefab_id ? (
                                            <Spinner size={'small'} />
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faSync} css={tw`mr-1`} />
                                                Update
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        size={Button.Sizes.Small}
                                        css={tw`flex-1`}
                                        disabled
                                    >
                                        <FontAwesomeIcon icon={faDownload} css={tw`mr-1`} />
                                        Up to Date
                                    </Button>
                                )}
                                <Button.Danger
                                    size={Button.Sizes.Small}
                                    css={tw`flex-1`}
                                    onClick={() => handleRemove(prefab)}
                                    disabled={removing === prefab.prefab_id || updating === prefab.prefab_id}
                                >
                                    {removing === prefab.prefab_id ? (
                                        <Spinner size={'small'} />
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faTrash} css={tw`mr-1`} />
                                            Remove
                                        </>
                                    )}
                                </Button.Danger>
                            </PrefabActions>
                        </PrefabCard>
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
        </div>
    );
};

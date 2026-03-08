import React, { useEffect, useState, useRef } from 'react';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { httpErrorToHuman } from '@/api/http';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import Select from '@/components/elements/Select';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import Input from '@/components/elements/Input';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSyncAlt, faPuzzlePiece, faClock, faCheckCircle, faExclamationTriangle, faArrowLeft, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import getInstalledMods, { InstalledMod } from '@/api/server/hytalemods/getInstalledMods';
import removeMod from '@/api/server/hytalemods/removeMod';
import InstallModal from '@/components/server/hytalemods/InstallModal';
import { formatDistanceToNow } from 'date-fns';

interface Props {
    onBack: () => void;
}

const FilterContainer = styled.div`
    ${tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4`};
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
    { value: 'all', label: 'All Mods' },
    { value: 'up_to_date', label: 'Up to Date' },
    { value: 'update_available', label: 'Update Available' },
];

function formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown date';
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return 'Unknown date';
    }
}

export default ({ onBack }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlashKey('installed-mods');
    const [loading, setLoading] = useState(true);
    const [mods, setMods] = useState<InstalledMod[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<InstalledMod | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);
    const [updateMod, setUpdateMod] = useState<{ id: string; name: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
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

    const loadInstalledMods = () => {
        setLoading(true);
        clearFlashes();
        getInstalledMods(uuid)
            .then((data) => {
                setMods(data);
            })
            .catch((error) => {
                console.error('Error loading installed mods:', error);
                addError('Failed to load installed mods: ' + httpErrorToHuman(error));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadInstalledMods();
    }, []);

    const filteredMods = mods.filter((mod) => {
        if (statusFilter === 'up_to_date' && mod.has_update) return false;
        if (statusFilter === 'update_available' && !mod.has_update) return false;
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            const name = (mod.mod_name || '').toLowerCase();
            const author = (mod.mod_author || '').toLowerCase();
            if (!name.includes(q) && !author.includes(q)) return false;
        }
        return true;
    });

    const handleRemove = (mod: InstalledMod) => {
        setConfirmRemove(mod);
    };

    const confirmRemoveMod = () => {
        if (!confirmRemove) return;
        setRemoving(confirmRemove.mod_id);
        setConfirmRemove(null);
        removeMod(uuid, confirmRemove.mod_id)
            .then(() => {
                setMessage({ type: 'success', text: `${confirmRemove.mod_name || 'Mod'} has been removed.` });
                setTimeout(() => setMessage(null), 5000);
                loadInstalledMods();
            })
            .catch((error) => {
                console.error('Error removing mod:', error);
                setMessage({ type: 'danger', text: 'Failed to remove mod: ' + httpErrorToHuman(error) });
                setTimeout(() => setMessage(null), 5000);
            })
            .finally(() => setRemoving(null));
    };

    const handleUpdate = (mod: InstalledMod) => {
        setUpdateMod({ id: mod.mod_id, name: mod.mod_name || 'Mod' });
    };

    const onUpdateSuccess = () => {
        setMessage({ type: 'success', text: 'Mod updated successfully!' });
        setTimeout(() => setMessage(null), 5000);
        loadInstalledMods();
    };

    if (loading) return <Spinner size={'large'} centered />;

    return (
        <FuturisticContentBox title={'Installed Mods'}>
            <FlashMessageRender byKey={'installed-mods'} css={tw`mb-4`} />
            {message && (
                <div css={tw`mb-4 px-4 py-3 rounded text-sm`} style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                    {message.text}
                </div>
            )}

            <FilterContainer>
                <FilterGroup>
                    <FilterIcon icon={faFilter} />
                    <StyledSelect
                        value={statusFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                    >
                        {FILTER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </StyledSelect>
                </FilterGroup>
                <FilterGroup css={tw`col-span-1 md:col-span-2 lg:col-span-2`}>
                    <StyledInput
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search installed mods..."
                    />
                </FilterGroup>
                <FilterGroup>
                    <Button className='w-full h-11' onClick={onBack}>
                        <FontAwesomeIcon icon={faArrowLeft} css={tw`mr-1`} />
                        Browse
                    </Button>
                </FilterGroup>
            </FilterContainer>

            {filteredMods.length === 0 ? (
                <div css={tw`flex flex-col items-center justify-center py-12`} style={{ color: 'var(--theme-text-muted)' }}>
                    <FontAwesomeIcon icon={faPuzzlePiece} css={tw`h-10 w-10 mb-3`} />
                    <p css={tw`text-sm`} style={{ fontFamily: "'Electrolize', sans-serif" }}>
                        {mods.length === 0
                            ? 'No mods installed yet. Browse and install mods using the "Browse" button.'
                            : 'No installed mods match your filter criteria.'}
                    </p>
                </div>
            ) : (
                <div css={tw`flex flex-col gap-2`}>
                    {filteredMods.map((mod) => (
                        <div
                            key={mod.mod_id}
                            css={tw`flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-150`}
                            style={{ backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)' }}
                        >
                            {mod.mod_icon ? (
                                <img src={mod.mod_icon} alt={mod.mod_name} css={tw`rounded w-10 h-10 object-contain flex-shrink-0`} />
                            ) : (
                                <div css={tw`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center`} style={{ backgroundColor: 'var(--theme-background)', border: '1px solid var(--theme-border)' }}>
                                    <FontAwesomeIcon icon={faPuzzlePiece} style={{ color: 'var(--theme-text-muted)' }} />
                                </div>
                            )}
                            <div css={tw`flex flex-col flex-1 min-w-0`}>
                                <div css={tw`flex items-center gap-2 flex-wrap`}>
                                    <span css={tw`text-sm font-medium truncate`} style={{ color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
                                        {mod.mod_name || `Mod ${mod.mod_id}`}
                                    </span>
                                    {mod.has_update ? (
                                        <UpdateBadge>
                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                            Update Available
                                        </UpdateBadge>
                                    ) : (
                                        <UpToDateBadge>
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            Up to Date
                                        </UpToDateBadge>
                                    )}
                                </div>
                                <div css={tw`flex items-center gap-3 mt-0.5 flex-wrap`}>
                                    {mod.mod_author && (
                                        <span css={tw`text-xs`} style={{ color: 'var(--theme-text-muted)' }}>By {mod.mod_author}</span>
                                    )}
                                    {mod.file_name && (
                                        <span css={tw`text-xs truncate`} style={{ color: 'var(--theme-text-muted)' }} title={mod.file_name}>{mod.file_name}</span>
                                    )}
                                    {mod.installed_at && (
                                        <span css={tw`text-xs flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                            <FontAwesomeIcon icon={faClock} />
                                            {formatDate(mod.installed_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div css={tw`flex-shrink-0 flex items-center gap-2`}>
                                {mod.has_update && (
                                    <button
                                        title='Update'
                                        css={tw`p-1.5 text-sm transition-colors duration-150`}
                                        style={{ color: 'var(--theme-text-muted)' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-primary)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                        onClick={() => handleUpdate(mod)}
                                        disabled={removing === mod.mod_id}
                                    >
                                        <FontAwesomeIcon icon={faSyncAlt} />
                                    </button>
                                )}
                                <button
                                    title='Remove'
                                    css={tw`p-1.5 text-sm transition-colors duration-150`}
                                    style={{ color: 'var(--theme-text-muted)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-muted)')}
                                    onClick={() => handleRemove(mod)}
                                    disabled={removing === mod.mod_id}
                                >
                                    {removing === mod.mod_id ? <Spinner size={'small'} /> : <FontAwesomeIcon icon={faTrash} />}
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
                title={'Remove Mod'}
                hideCloseIcon={false}
            >
                <div css={tw`py-4`}>
                    <p style={{ color: 'var(--theme-text-base)' }}>
                        Are you sure you want to remove <strong>{confirmRemove?.mod_name || 'this mod'}</strong>?
                        This will delete the mod file from the server.
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
                            onClick={confirmRemoveMod}
                        >
                            <FontAwesomeIcon icon={faTrash} css={tw`mr-2`} />
                            Remove Mod
                        </Button.Danger>
                    </Dialog.Footer>
                </div>
            </Dialog>

            {/* Update Modal (reuses InstallModal) */}
            {updateMod !== null && (
                <InstallModal
                    modId={updateMod.id}
                    modName={updateMod.name}
                    onInstalled={onUpdateSuccess}
                    open={updateMod !== null}
                    onClose={() => setUpdateMod(null)}
                />
            )}
        </FuturisticContentBox>
    );
};

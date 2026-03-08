import React, { useEffect, useState, useRef } from 'react';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { httpErrorToHuman } from '@/api/http';
import { useFlashKey } from '@/plugins/useFlash';
import tw from 'twin.macro';
import Select from '@/components/elements/Select';
import Input from '@/components/elements/Input';
import styled from 'styled-components/macro';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSyncAlt, faPuzzlePiece, faClock, faCheckCircle, faExclamationTriangle, faArrowLeft, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import getInstalledMods, { InstalledMod } from '@/api/server/mods/getInstalledMods';
import removeMod from '@/api/server/mods/removeMod';
import InstallModal from '@/components/server/mods/InstallModal';
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
    background-color: var(--theme-background);
    border-color: var(--theme-border);
    color: var(--theme-text-base);
    & > option {
        ${tw`flex items-center`};
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

const ModCard = styled.div`
    ${tw`rounded-lg shadow-md overflow-hidden`};
    background-color: var(--theme-background-secondary);
    border: 1px solid var(--theme-border);
    transition: border-color 150ms;
    &:hover {
        border-color: var(--theme-primary);
    }
`;

const ModHeader = styled.div`
    ${tw`flex items-start gap-4 p-4`};
`;

const ModIcon = styled.img`
    ${tw`w-14 h-14 rounded-lg object-cover border-2`};
    background-color: var(--theme-background);
    border-color: var(--theme-border);
`;

const PlaceholderIcon = styled.div`
    ${tw`w-14 h-14 rounded-lg border-2 flex items-center justify-center`};
    background-color: var(--theme-background);
    border-color: var(--theme-border);
    color: var(--theme-text-muted);
`;

const ModInfo = styled.div`
    ${tw`flex-1 min-w-0`};
`;

const ModActions = styled.div`
    ${tw`flex items-center gap-2 p-4 pt-0`};
`;

const UpdateBadge = styled.span`
    ${tw`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30`};
`;

const UpToDateBadge = styled.span`
    ${tw`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30`};
`;

const ProviderBadge = styled.span`
    ${tw`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`};
    background-color: rgba(var(--theme-primary-rgb), 0.15);
    color: var(--theme-primary);
    border: 1px solid var(--theme-border);
`;

const FileName = styled.span`
    ${tw`text-xs block mt-1 truncate`};
    color: var(--theme-text-muted);
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
    const [updateMod, setUpdateMod] = useState<{ id: string; name: string; provider: string } | null>(null);
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
        removeMod(uuid, confirmRemove.mod_id, confirmRemove.provider)
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
        setUpdateMod({ id: mod.mod_id, name: mod.mod_name || 'Mod', provider: mod.provider });
    };

    const onUpdateSuccess = () => {
        setMessage({ type: 'success', text: 'Mod updated successfully!' });
        setTimeout(() => setMessage(null), 5000);
        loadInstalledMods();
    };

    if (loading) return (
        <FuturisticContentBox title={'Installed Mods'}>
            <div css={tw`flex items-center justify-center py-16`}>
                <Spinner size={'large'} />
            </div>
        </FuturisticContentBox>
    );

    return (
        <FuturisticContentBox title={'Installed Mods'}>
            <FlashMessageRender byKey={'installed-mods'} css={tw`mb-4`} />
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
                <div css={tw`text-center py-10`}>
                    <FontAwesomeIcon
                        icon={faPuzzlePiece}
                        css={tw`mx-auto mb-3`}
                        style={{ color: 'var(--theme-text-muted)', fontSize: '3rem' }}
                    />
                    <p css={tw`text-sm`} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                        {mods.length === 0
                            ? 'No mods installed yet. Browse and install mods using the "Browse" button.'
                            : 'No installed mods match your filter criteria.'}
                    </p>
                </div>
            ) : (
                <div css={tw`grid gap-4 md:grid-cols-2 lg:grid-cols-3`}>
                    {filteredMods.map((mod) => (
                        <ModCard key={`${mod.provider}-${mod.mod_id}`}>
                            <ModHeader>
                                {mod.mod_icon ? (
                                    <ModIcon src={mod.mod_icon} alt={mod.mod_name} />
                                ) : (
                                    <PlaceholderIcon>
                                        <FontAwesomeIcon icon={faPuzzlePiece} size="lg" />
                                    </PlaceholderIcon>
                                )}
                                <ModInfo>
                                    <h3 css={tw`text-sm font-semibold truncate mb-0.5`} style={{ color: 'var(--theme-text-base)' }}>
                                        {mod.mod_name || `Mod ${mod.mod_id}`}
                                    </h3>
                                    {mod.mod_author && (
                                        <p css={tw`text-xs mb-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                            By {mod.mod_author}
                                        </p>
                                    )}
                                    <FileName title={mod.file_name}>
                                        {mod.file_name}
                                    </FileName>
                                    <div css={tw`flex items-center gap-2 mt-2 flex-wrap`}>
                                        <ProviderBadge>{mod.provider}</ProviderBadge>
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
                                    {mod.installed_at && (
                                        <p css={tw`text-xs mt-1 flex items-center gap-1`} style={{ color: 'var(--theme-text-muted)' }}>
                                            <FontAwesomeIcon icon={faClock} />
                                            Installed {formatDate(mod.installed_at)}
                                        </p>
                                    )}
                                </ModInfo>
                            </ModHeader>
                            <ModActions>
                                {mod.has_update && (
                                    <Button
                                        size={Button.Sizes.Small}
                                        css={tw`flex-1`}
                                        onClick={() => handleUpdate(mod)}
                                        disabled={removing === mod.mod_id}
                                    >
                                        <FontAwesomeIcon icon={faSyncAlt} css={tw`mr-1`} />
                                        Update
                                    </Button>
                                )}
                                <Button.Danger
                                    size={Button.Sizes.Small}
                                    css={tw`flex-1`}
                                    onClick={() => handleRemove(mod)}
                                    disabled={removing === mod.mod_id}
                                >
                                    {removing === mod.mod_id ? (
                                        <Spinner size={'small'} />
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faTrash} css={tw`mr-1`} />
                                            Remove
                                        </>
                                    )}
                                </Button.Danger>
                            </ModActions>
                        </ModCard>
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
                    <p css={tw`text-sm`} style={{ color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>
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
                    provider={updateMod.provider}
                    onInstalled={onUpdateSuccess}
                    open={updateMod !== null}
                    onClose={() => setUpdateMod(null)}
                />
            )}
        </FuturisticContentBox>
    );
};

import React, { useState, useMemo } from 'react';
import { FastQueryResponse, Player, BannedIp } from '@/api/server/mcpmanager';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faUserCheck,
    faUserSlash,
    faUserShield,
    faBan,
    faSearch,
    faSortAlphaDown,
    faSortAlphaUp,
    faExclamationCircle,
    faGamepad,
    faServer,
    faCircle,
} from '@fortawesome/free-solid-svg-icons';
import Spinner from '@/components/elements/Spinner';
interface Props {
    data: FastQueryResponse | null;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onPlayerSelect: (player: Player) => void;
    selectedPlayer: Player | null;
    onUnbanIp?: (ip: string) => void;
    serverStatus: string | null;
}
const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
        padding: '0.125rem 0.75rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        marginLeft: 'auto',
        fontFamily: "'Orbitron', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
    };
    switch (status) {
        case 'online':
            return { ...base, backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
        case 'banned':
            return { ...base, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
        case 'whitelisted':
            return { ...base, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
        case 'op':
            return { ...base, backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' };
        default:
            return { ...base, backgroundColor: 'rgba(115, 115, 115, 0.15)', color: 'var(--theme-text-muted)', border: '1px solid var(--theme-border)' };
    }
};
const PlayersList: React.FC<Props> = ({
    data,
    selectedCategory,
    onCategoryChange,
    onPlayerSelect,
    selectedPlayer,
    onUnbanIp,
    serverStatus,
}) => {
    const info = data?.info;
    const players = data?.players;
    const isOnline = serverStatus === 'running' && !!data && !data.error;
    const Stat = ({
        label,
        value,
        children,
    }: {
        label: string;
        value: string | number;
        children?: React.ReactNode;
    }) => (
        <div style={{
            backgroundColor: 'var(--theme-background)',
            padding: '0.75rem',
            textAlign: 'center',
            border: '1px solid var(--theme-border)',
            clipPath: 'polygon(0px 5px, 5px 0px, 100% 0px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0px 100%)',
        }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Orbitron', sans-serif", margin: 0 }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {children}
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif", margin: 0 }}>{value}</p>
            </div>
        </div>
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const categories = useMemo(() => {
        const counts = data?.players?.counts;
        const onlineCount = data?.players?.online?.length ?? data?.players?.current ?? 0;
        return [
            { id: 'online', name: 'Online', icon: faUsers, count: onlineCount },
            { id: 'all', name: 'All', icon: faUsers, count: counts?.all ?? 0 },
            { id: 'banned', name: 'Banned', icon: faUserSlash, count: counts?.banned ?? 0 },
            { id: 'whitelisted', name: 'Whitelist', icon: faUserCheck, count: counts?.whitelisted ?? 0 },
            { id: 'ops', name: 'Operators', icon: faUserShield, count: counts?.ops ?? 0 },
            { id: 'banned_ips', name: 'Banned IPs', icon: faBan, count: counts?.banned_ips ?? 0 },
        ];
    }, [data]);
    const getPlayerList = (): (Player | BannedIp)[] => {
        if (!data || !data.players) return [];
        const list = data.players[selectedCategory as keyof typeof data.players] || [];
        return list as (Player | BannedIp)[];
    };
    const filteredPlayers = useMemo(() => {
        const players = getPlayerList();
        if (!players.length) return [];
        return players
            .filter((player) => {
                if ('ip' in player && !('name' in player)) {
                    return (player as BannedIp).ip.toLowerCase().includes(searchTerm.toLowerCase());
                } else {
                    return (player as Player).name.toLowerCase().includes(searchTerm.toLowerCase());
                }
            })
            .sort((a, b) => {
                const nameA = 'name' in a ? (a as Player).name : (a as BannedIp).ip;
                const nameB = 'name' in b ? (b as Player).name : (b as BannedIp).ip;
                if (sortOrder === 'asc') {
                    return nameA.localeCompare(nameB);
                } else {
                    return nameB.localeCompare(nameA);
                }
            });
    }, [data, selectedCategory, searchTerm, sortOrder]);
    const getPlayerStatus = (player: Player): string => {
        if (!data?.players) return 'offline';
        const { online, banned, ops, whitelisted } = data.players;
        const match = (p: Player) => p.uuid === player.uuid || p.name === player.name;
        if (online?.some(match)) return 'online';
        if (banned?.some(match)) return 'banned';
        if (ops?.some(match)) return 'op';
        if (whitelisted?.some(match)) return 'whitelisted';
        return 'offline';
    };
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };
    const formatGameModeShort = (gamemode: string | number | undefined): string => {
        if (gamemode === undefined) return '?';
        if (typeof gamemode === 'number') {
            return ['S', 'C', 'A', 'Sp'][gamemode] || '?';
        }
        return gamemode.charAt(0).toUpperCase();
    };
    const renderPlayerItem = (player: Player | BannedIp, index: number) => {
        if ('ip' in player && !('name' in player)) {
            const bannedIp = player as BannedIp;
            return (
                <div
                    key={`ip-${index}-${bannedIp.ip}`}
                    onClick={() => onUnbanIp && onUnbanIp(bannedIp.ip)}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        overflow: 'hidden',
                        clipPath: 'polygon(0px 5px, 5px 0px, 100% 0px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0px 100%)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            marginRight: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--theme-background)',
                            border: '1px solid var(--theme-border)',
                            clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                        }}>
                            <FontAwesomeIcon icon={faBan} style={{ color: '#f87171' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, color: '#fecaca', fontFamily: "'Electrolize', sans-serif", margin: 0 }}>{bannedIp.ip}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif", margin: 0 }}>{bannedIp.reason || 'No reason provided'}</p>
                        </div>
                    </div>
                </div>
            );
        } else {
            const playerItem = player as Player;
            const isSelected = !!(selectedPlayer && selectedPlayer.uuid === playerItem.uuid);
            const status = getPlayerStatus(playerItem);
            return (
                <div
                    key={`player-${index}-${playerItem.uuid}`}
                    onClick={() => onPlayerSelect(playerItem)}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: isSelected ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
                        backgroundColor: isSelected
                            ? 'color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background))'
                            : 'var(--theme-background)',
                        boxShadow: isSelected ? '0 0 10px rgba(var(--theme-primary-rgb), 0.2)' : 'none',
                        overflow: 'hidden',
                        clipPath: 'polygon(0px 5px, 5px 0px, 100% 0px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0px 100%)',
                    }}
                >
                    <img
                        src={
                            playerItem.name.startsWith('.')
                                ? `https://minotar.net/helm/herobrine`
                                : `https://minotar.net/helm//${playerItem.uuid}`
                        }
                        alt={playerItem.name}
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            marginRight: '0.75rem',
                            border: '2px solid var(--theme-border)',
                            clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif", margin: 0 }}>{playerItem.name}</p>
                            {status === 'online' && playerItem.gamemode !== undefined && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: '0.5rem',
                                    padding: '0.125rem 0.5rem',
                                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent)',
                                    clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)',
                                }}>
                                    <FontAwesomeIcon icon={faGamepad} style={{ fontSize: '0.65rem', color: 'var(--theme-text-muted)', marginRight: '0.375rem' }} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--theme-text-base)', fontFamily: "'Orbitron', sans-serif" }}>
                                        {formatGameModeShort(playerItem.gamemode)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {playerItem.uuid && <p style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', fontFamily: 'monospace', margin: 0, wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>{playerItem.uuid}</p>}
                    </div>
                    {status && <span style={getStatusBadgeStyle(status)}>{status}</span>}
                </div>
            );
        }
    };
    return (
        <FuturisticContentBox title='Players'>
            {/* Stats */}
            <style>{`
                .player-list-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                @media (min-width: 640px) {
                    .player-list-stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .player-list-categories-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                @media (min-width: 640px) {
                    .player-list-categories-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
            <div className="player-list-stats-grid">
                <Stat label='Players' value={`${players?.online?.length || 0} / ${players?.max || 'N/A'}`}>
                    <FontAwesomeIcon
                        icon={faCircle}
                        style={{
                            fontSize: '0.65rem',
                            color: isOnline ? '#22c55e' : '#ef4444',
                            filter: isOnline ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' : 'none',
                        }}
                    />
                </Stat>
                <Stat label='Version' value={info?.version?.name || 'N/A'} />
            </div>

            {/* Category Filters */}
            <div className="player-list-categories-grid">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            fontFamily: "'Electrolize', sans-serif",
                            cursor: 'pointer',
                            clipPath: 'polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%)',
                            backgroundColor: selectedCategory === category.id
                                ? 'color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background))'
                                : 'var(--theme-background)',
                            color: selectedCategory === category.id
                                ? 'var(--theme-primary)'
                                : 'var(--theme-text-base)',
                            border: selectedCategory === category.id
                                ? '1px solid var(--theme-primary)'
                                : '1px solid var(--theme-border)',
                            boxShadow: selectedCategory === category.id
                                ? '0 0 8px rgba(var(--theme-primary-rgb), 0.2)'
                                : 'none',
                        }}
                    >
                        <FontAwesomeIcon icon={category.icon} />
                        <span>
                            {category.name} <span style={{ color: 'var(--theme-text-muted)' }}>({category.count})</span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Search & Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--theme-border)' }}>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--theme-border)',
                        backgroundColor: 'var(--theme-background)',
                        transition: 'border-color 0.15s ease',
                        clipPath: 'polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%)',
                    }}
                >
                    <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--theme-text-muted)' }} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder='Search players...'
                        style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            padding: 0,
                            fontSize: '0.875rem',
                            color: 'var(--theme-text-base)',
                            fontFamily: "'Electrolize', sans-serif",
                        }}
                    />
                </div>
                <button
                    onClick={toggleSortOrder}
                    title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                    style={{
                        padding: '0.625rem',
                        backgroundColor: 'var(--theme-background)',
                        border: '1px solid var(--theme-border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        clipPath: 'polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%)',
                    }}
                >
                    <FontAwesomeIcon
                        icon={sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp}
                        style={{ color: 'var(--theme-text-base)' }}
                    />
                </button>
            </div>

            {/* Player List */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {!data ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
                        <Spinner size='large' />
                        <p style={{ marginTop: '1rem', color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>Loading player data...</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faExclamationCircle} style={{ color: '#facc15', fontSize: '1.875rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.4))' }} />
                        <p style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>No players found in this category</p>
                    </div>
                ) : (
                    filteredPlayers.map((player, index) => renderPlayerItem(player, index))
                )}
            </div>
        </FuturisticContentBox>
    );
};
export default PlayersList;

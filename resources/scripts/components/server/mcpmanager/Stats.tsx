import React from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faUtensils,
    faStar,
    faExclamationTriangle,
    faClock,
    faSkull,
    faGamepad,
    faGlobe,
    faFistRaised,
    faBed,
    faMapMarkerAlt,
    faCrosshairs,
    faShoePrints,
    faFish,
} from '@fortawesome/free-solid-svg-icons';
import { PlayerStats as PlayerStatsType } from '@/api/server/mcpmanager';
import Spinner from '@/components/elements/Spinner';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import PlayerStatsBoards from './StatsBoards';
import CopyOnClick from '@/components/elements/CopyOnClick';
interface PlayerStatsProps {
    stats: PlayerStatsType | undefined;
    isLoading: boolean;
    error?: string;
    onModifyStat?: (stat: 'health' | 'hunger' | 'experience', amount: number) => void;
    isOnline?: boolean;
}
const formatTime = (seconds: number | undefined): string => {
    if (seconds === undefined || seconds === null) return 'N/A';
    if (seconds === 0) return '0m';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (d > 0) result += `${d}d `;
    if (h > 0) result += `${h}h `;
    if (m > 0) result += `${m}m`;
    return result.trim() || '0m';
};
const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
};
const formatCoordinates = (
    position: { x: number; y: number; z: number } | [number, number, number] | null | undefined
): string => {
    if (!position) return 'Unknown';
    if (Array.isArray(position)) {
        return `${Math.round(position[0])}, ${Math.round(position[1])}, ${Math.round(position[2])}`;
    }
    if (typeof position === 'object' && 'x' in position) {
        return `${Math.round(position.x)}, ${Math.round(position.y)}, ${Math.round(position.z)}`;
    }
    return 'Unknown';
};
const formatGameMode = (gamemode: string | number | undefined): string => {
    if (gamemode === undefined) return 'Unknown';
    if (typeof gamemode === 'number') {
        switch (gamemode) {
            case 0:
                return 'Survival';
            case 1:
                return 'Creative';
            case 2:
                return 'Adventure';
            case 3:
                return 'Spectator';
            default:
                return 'Unknown';
        }
    }
    return gamemode.charAt(0).toUpperCase() + gamemode.slice(1);
};
const AttributeBar: React.FC<{
    icon: any;
    label: string;
    value: number;
    maxValue: number;
    barColor: string;
    onModify?: (amount: number) => void;
    isOnline?: boolean;
}> = ({ icon, label, value, maxValue, barColor, onModify, isOnline }) => {
    const progress = (value / maxValue) * 100;
    return (
        <div tw='rounded-lg p-3 border border-neutral-700 shadow-inner' style={{ backgroundColor: 'var(--theme-background)' }}>
            <div tw='flex items-center justify-between mb-2'>
                <div tw='flex items-center'>
                    <FontAwesomeIcon icon={icon} css={[tw`mr-2`, `color: ${barColor}`]} />
                    <span tw='text-sm text-neutral-200 font-medium'>{label}</span>
                </div>
                <div tw='flex items-center space-x-2'>
                    {onModify && isOnline && (
                        <>
                            <button
                                onClick={() => onModify(-1)}
                                tw='bg-red-500 hover:bg-red-600 text-white font-bold w-6 h-6 rounded-full transition-colors duration-150 disabled:opacity-50'
                                disabled={!isOnline}
                            >
                                -
                            </button>
                            <button
                                onClick={() => onModify(1)}
                                tw='bg-green-500 hover:bg-green-600 text-white font-bold w-6 h-6 rounded-full transition-colors duration-150 disabled:opacity-50'
                                disabled={!isOnline}
                            >
                                +
                            </button>
                        </>
                    )}
                    <span tw='text-sm font-bold text-white min-w-[70px] text-right'>
                        {value} / {maxValue}
                    </span>
                </div>
            </div>
            <div tw='w-full rounded-full h-2.5' style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
                <div
                    style={{ width: `${progress}%`, backgroundColor: barColor }}
                    tw='h-2.5 rounded-full transition-all duration-300'
                ></div>
            </div>
        </div>
    );
};
const StatItem: React.FC<{
    icon: any;
    label: string;
    value: string | number;
    color?: string;
}> = ({ icon, label, value, color = 'text-blue-400' }) => {
    return (
        <CopyOnClick text={String(value)}>
            <div
                className='group'
                tw='rounded-lg p-3 flex items-center border border-neutral-700 cursor-pointer transition-colors duration-200 hover:bg-neutral-700'
                style={{ backgroundColor: 'var(--theme-background)' }}
            >
                <div
                    tw='flex items-center justify-center w-8 h-8 rounded-md mr-3'
                    css={`
                        background-color: ${color.replace('text-', '')}1A;
                    `}
                >
                    <FontAwesomeIcon icon={icon} css={[tw`text-lg`, color]} />
                </div>
                <div>
                    <p tw='text-sm text-neutral-200 transition-colors duration-200 group-hover:text-neutral-50'>
                        {label}
                    </p>
                    <p tw='text-base font-bold text-white'>{value}</p>
                </div>
            </div>
        </CopyOnClick>
    );
};
export const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, isLoading, error, onModifyStat, isOnline }) => {
    if (isLoading) {
        return (
            <FuturisticContentBox>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingY: '2rem' }}>
                    <Spinner size='large' />
                </div>
            </FuturisticContentBox>
        );
    }
    if (error || !stats) {
        return (
            <FuturisticContentBox>
                <div style={{ backgroundColor: 'var(--theme-background)', padding: '1rem', textAlign: 'center', borderRadius: '0.5rem' }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#facc15', fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }} />
                    <p style={{ color: 'var(--theme-text-base)' }}>{error || 'No player statistics available.'}</p>
                </div>
            </FuturisticContentBox>
        );
    }
    const mobKills = stats.raw_stats_data?.stats?.['minecraft:custom']?.['minecraft:mob_kills'] || 0;
    const totalKills = (stats.player_kills ?? 0) + mobKills;
    const jumps = stats.raw_stats_data?.stats?.['minecraft:custom']?.['minecraft:jump'] || 0;
    const deaths = Number(stats.deaths) || 0;
    const kdr = deaths > 0 ? (totalKills / deaths).toFixed(2) : totalKills.toFixed(2);
    const damageTaken = stats.raw_stats_data?.stats?.['minecraft:custom']?.['minecraft:damage_taken'] || 0;
    const fishCaught = stats.raw_stats_data?.stats?.['minecraft:custom']?.['minecraft:fish_caught'] || 0;
    return (
        <FuturisticContentBox>
            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <AttributeBar
                    icon={faHeart}
                    label='Health'
                    value={Math.round(stats.health || 0)}
                    maxValue={20}
                    barColor='#ef4444'
                    onModify={onModifyStat ? (amount) => onModifyStat('health', amount) : undefined}
                    isOnline={isOnline}
                />
                <AttributeBar
                    icon={faUtensils}
                    label='Hunger'
                    value={stats.food_level || 0}
                    maxValue={20}
                    barColor='#f97316'
                    onModify={onModifyStat ? (amount) => onModifyStat('hunger', amount) : undefined}
                    isOnline={isOnline}
                />
                <div tw='md:col-span-2'>
                    <AttributeBar
                        icon={faStar}
                        label={`Experience (Level ${stats.xp_level || '0'})`}
                        value={Math.round((stats.xp_progress || 0) * 100)}
                        maxValue={100}
                        barColor='#22c55e'
                        onModify={onModifyStat ? (amount) => onModifyStat('experience', amount) : undefined}
                        isOnline={isOnline}
                    />
                </div>
                <StatItem
                    icon={faGamepad}
                    label='Gamemode'
                    value={formatGameMode(stats.gamemode)}
                    color='text-purple-400'
                />
                <StatItem
                    icon={faGlobe}
                    label='World'
                    value={stats.world?.replace('minecraft:', '') || 'Unknown'}
                    color='text-blue-400'
                />
                <StatItem
                    icon={faClock}
                    label='Play Time'
                    value={formatTime(stats.play_time_seconds)}
                    color='text-indigo-400'
                />
                <StatItem icon={faSkull} label='Deaths' value={stats.deaths ?? 0} color='text-gray-500' />
                <StatItem icon={faFistRaised} label='Total Kills' value={totalKills} color='text-yellow-400' />
                <StatItem icon={faShoePrints} label='Jumps' value={jumps.toLocaleString()} color='text-green-400' />
                <StatItem icon={faCrosshairs} label='KDR' value={kdr} color='text-red-400' />
                <StatItem
                    icon={faMapMarkerAlt}
                    label='Position'
                    value={formatCoordinates(stats.position)}
                    color='text-teal-400'
                />
                <StatItem
                    icon={faHeart}
                    label='Damage taken'
                    value={damageTaken.toLocaleString()}
                    color='text-red-400'
                />
                <StatItem icon={faFish} label='Fish Caught' value={fishCaught.toLocaleString()} color='text-blue-400' />
            </div>
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--theme-border)' }}>
                <PlayerStatsBoards stats={stats} isLoading={isLoading} />
            </div>
        </FuturisticContentBox>
    );
};
export default PlayerStats;

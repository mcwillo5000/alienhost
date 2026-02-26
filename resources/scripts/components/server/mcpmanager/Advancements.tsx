import React, { useEffect, useState } from 'react';
import {
    Player,
    getPlayerAdvancements,
    getAdvancementsFromWiki,
    PlayerAdvancement,
    WikiAdvancement,
} from '@/api/server/mcpmanager';
import Spinner from '@/components/elements/Spinner';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
interface Props {
    player: Player;
    serverUuid: string;
}
interface CombinedAdvancement extends WikiAdvancement {
    icon_background: string;
    icon_content: string | null;
    earned: boolean;
}
const Advancements: React.FC<Props> = ({ player, serverUuid }) => {
    const [combinedAdvancements, setCombinedAdvancements] = useState<CombinedAdvancement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!player.uuid) {
            setError('Player UUID is not available.');
            setLoading(false);
            return;
        }
        const fetchAdvancements = async () => {
            try {
                const wikiData = await getAdvancementsFromWiki(serverUuid);
                const playerData = await getPlayerAdvancements(serverUuid, player.uuid!);
                const combined = wikiData
                    .map((wikiAdv) => ({
                        ...wikiAdv,
                        earned: playerData[`minecraft:${wikiAdv.resource_location}`]?.done || false,
                    }))
                    .filter((adv) => adv.earned);
                setCombinedAdvancements(combined);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch advancements.');
            } finally {
                setLoading(false);
            }
        };
        fetchAdvancements();
    }, [player.uuid, serverUuid]);
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}><Spinner size={'large'} /></div>;
    }
    if (error) {
        return <p style={{ textAlign: 'center', color: '#f87171' }}>{error}</p>;
    }
    return (
        <FuturisticContentBox>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <div style={{ minWidth: '800px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-muted)', borderBottom: '1px solid var(--theme-border)', padding: '0.5rem', fontFamily: "'Orbitron', sans-serif" }}>
                        <div style={{ gridColumn: 'span 1' }}>Icon</div>
                        <div style={{ gridColumn: 'span 2' }}>Advancement</div>
                        <div style={{ gridColumn: 'span 3' }}>Description</div>
                        <div style={{ gridColumn: 'span 3' }}>Requirements</div>
                        <div style={{ gridColumn: 'span 2' }}>Resource</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--theme-border)' }}>
                        {combinedAdvancements.map((advancement, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1rem', padding: '0.5rem', alignItems: 'center', borderBottom: index < combinedAdvancements.length - 1 ? '1px solid var(--theme-border)' : 'none' }}>
                                <div style={{ gridColumn: 'span 1', position: 'relative', display: 'flex', flexShrink: 0, height: '2.5rem', width: '2.5rem' }}>
                                    <img
                                        src={advancement.icon_background}
                                        alt={`${advancement.name} background`}
                                        style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                                    />
                                    {advancement.icon_content && (
                                        <img
                                            src={advancement.icon_content}
                                            alt={advancement.name}
                                            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '1.75rem', width: '1.75rem' }}
                                        />
                                    )}
                                </div>
                                <div style={{ gridColumn: 'span 2', fontSize: '0.875rem', color: 'var(--theme-text-base)', fontFamily: "'Electrolize', sans-serif" }}>{advancement.name}</div>
                                <div
                                    style={{ gridColumn: 'span 3', fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                                    dangerouslySetInnerHTML={{ __html: advancement.description }}
                                />
                                <div
                                    style={{ gridColumn: 'span 3', fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                                    dangerouslySetInnerHTML={{ __html: advancement.requirements }}
                                />
                                <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>{advancement.resource_location}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </FuturisticContentBox>
    );
};
export default Advancements;

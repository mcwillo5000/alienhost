import React from 'react';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import { HytaleSettings } from '@/api/server/hytalegamesettings/getHytaleSettings';
interface Props {
    settings: HytaleSettings;
    updateSetting: <K extends keyof HytaleSettings>(key: K, value: HytaleSettings[K]) => void;
}
export default ({ settings, updateSetting }: Props) => {
    return (
        <FuturisticContentBox title={'World Settings'}>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                <div>
                    <Label>Gamemode</Label>
                    <Select
                        value={settings.gamemode}
                        onChange={(e) => updateSetting('gamemode', e.target.value as HytaleSettings['gamemode'])}
                    >
                        <option value={'Adventure'}>Adventure</option>
                        <option value={'Creative'}>Creative</option>
                        <option value={'Spectator'}>Spectator</option>
                    </Select>
                </div>
                <div>
                    <Label>World Name</Label>
                    <Input
                        type={'text'}
                        value={settings.worldName}
                        onChange={(e) => updateSetting('worldName', e.target.value)}
                        placeholder={'default'}
                    />
                </div>
                <div>
                    <Label>View Distance Radius (3-32)</Label>
                    <Input
                        type={'number'}
                        value={settings.viewDistanceRadius.toString()}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 3;
                            updateSetting('viewDistanceRadius', Math.min(32, Math.max(3, val)));
                        }}
                        min={3}
                        max={32}
                    />
                </div>
            </div>
        </FuturisticContentBox>
    );
};

import React, { useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Label from '@/components/elements/Label';
import Input, { Textarea } from '@/components/elements/Input';
import { HytaleSettings } from '@/api/server/hytalegamesettings/getHytaleSettings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
interface Props {
    settings: HytaleSettings;
    updateSetting: <K extends keyof HytaleSettings>(key: K, value: HytaleSettings[K]) => void;
}
export default ({ settings, updateSetting }: Props) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <TitledGreyBox title={'Basic Settings'}>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                <div>
                    <Label>Server Name</Label>
                    <Input
                        type={'text'}
                        value={settings.serverName}
                        onChange={(e) => updateSetting('serverName', e.target.value)}
                        placeholder={''}
                    />
                </div>
                <div>
                    <Label>MOTD</Label>
                    <Input
                        value={settings.motd}
                        onChange={(e) => updateSetting('motd', e.target.value)}
                        placeholder={''}
                    />
                </div>
                <div>
                    <Label>Server Password</Label>
                    <div className={'relative'}>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={settings.serverPassword}
                            onChange={(e) => updateSetting('serverPassword', e.target.value)}
                            placeholder={''}
                            className={'pr-10'}
                        />
                        <button
                            type={'button'}
                            onClick={() => setShowPassword(!showPassword)}
                            className={'absolute right-0 top-0 h-full px-3 text-neutral-400 hover:text-neutral-200 transition-colors'}
                            title={showPassword ? 'Hide Password' : 'Show Password'}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
                <div>
                    <Label>Max Players</Label>
                    <Input
                        type={'number'}
                        value={settings.maxPlayers.toString()}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            updateSetting('maxPlayers', Math.min(1000, Math.max(1, val)));
                        }}
                        min={1}
                        max={1000}
                    />
                </div>
            </div>
        </TitledGreyBox>
    );
};

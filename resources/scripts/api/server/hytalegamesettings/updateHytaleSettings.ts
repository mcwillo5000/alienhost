import http from '@/api/http';
import { HytaleSettings } from './getHytaleSettings';
export default async (uuid: string, settings: Partial<HytaleSettings>): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/hytale/settings`, settings);
};

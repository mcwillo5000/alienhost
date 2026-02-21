import http from '@/api/http';
export default async (uuid: string, worldName: string, settings: Record<string, any>): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/hytale/worlds/${worldName}`, settings);
};

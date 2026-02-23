import http from '@/api/http';

export default async (uuid: string, files: number[]): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/files/restore`, { files });
};

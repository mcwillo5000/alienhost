import http from '@/api/http';

interface SyncSubdomainResponse {
    success: boolean;
    message: string;
}

export default async (uuid: string, subdomainId: number): Promise<SyncSubdomainResponse> => {
    try {
        const { data } = await http.post<SyncSubdomainResponse>(
            `/api/client/servers/${uuid}/subdomain/sync/${subdomainId}`
        );

        if (!data.success) {
            throw new Error(data.message || 'An unknown error occurred while syncing the subdomain.');
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to sync subdomain. Please try again later.',
        };
    }
};
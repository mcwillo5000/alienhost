import http from '@/api/http';

interface DeleteSubdomainResponse {
    success: boolean;
    message: string;
}

export default async (uuid: string, subdomainId: number): Promise<DeleteSubdomainResponse> => {
    try {
        const { data } = await http.delete<DeleteSubdomainResponse>(`/api/client/servers/${uuid}/subdomain/${subdomainId}`);

        if (!data.success) {
            throw new Error(data.message || 'An unknown error occurred while deleting the subdomain.');
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete subdomain. Please try again later.',
        };
    }
};

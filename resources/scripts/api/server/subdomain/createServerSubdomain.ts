import http from '@/api/http';

interface CreateSubdomainRequest {
    subdomain: string;
    domainId: number;
}

interface CreateSubdomainResponse {
    success: boolean;
    message: string;
}

export default async (uuid: string, requestData: CreateSubdomainRequest): Promise<CreateSubdomainResponse> => {
    try {
        const { data } = await http.post<CreateSubdomainResponse>(`/api/client/servers/${uuid}/subdomain/create`, requestData);

        if (!data.success) {
            throw new Error(data.message || 'An unknown error occurred while creating the subdomain.');
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create subdomain. Please try again later.',
        };
    }
};
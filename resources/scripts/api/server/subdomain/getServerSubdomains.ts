import http from '@/api/http';

export interface Domain {
    id: number;
    domain: string;
}

export interface Subdomain {
    id: number;
    subdomain: string;
    fullSubdomain: string;
    ip: string;
    port: number;
}

export interface ServerSubdomainResponse {
    success: boolean;
    data: {
        domains: Domain[];
        subdomains: Subdomain[];
    };
}

export default async (uuid: string): Promise<{ domains: Domain[], subdomains: Subdomain[] }> => {
    const { data } = await http.get<ServerSubdomainResponse>(`/api/client/servers/${uuid}/subdomain`);
    
    return {
        domains: data.data.domains || [],
        subdomains: data.data.subdomains.map(sub => ({
            ...sub,
            fullSubdomain: sub.fullSubdomain
        })) || []
    };
};

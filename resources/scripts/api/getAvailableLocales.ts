import http from '@/api/http';

export interface LocalesResponse {
    locales: string[];
}


export default (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/locales')
            .then(({ data }) => resolve(data.locales || ['en']))
            .catch(reject);
    });
};

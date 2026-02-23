
export function join(...segments: string[]): string {
    return segments
        .map((segment, index) => {

            if (index > 0 && segment.startsWith('/')) {
                segment = segment.slice(1);
            }

            if (index < segments.length - 1 && segment.endsWith('/')) {
                segment = segment.slice(0, -1);
            }
            return segment;
        })
        .filter((segment) => segment.length > 0)
        .join('/')
        .replace(/\/+/g, '/'); 
}


export function dirname(path: string): string {
    if (!path || path === '/') {
        return '/';
    }
    

    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    const lastSlashIndex = normalizedPath.lastIndexOf('/');
    
    if (lastSlashIndex === -1) {
        return '.';
    }
    
    if (lastSlashIndex === 0) {
        return '/';
    }
    
    return normalizedPath.slice(0, lastSlashIndex);
}


export function basename(path: string, ext?: string): string {
    if (!path) {
        return '';
    }
    

    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    const lastSlashIndex = normalizedPath.lastIndexOf('/');
    let name = lastSlashIndex === -1 ? normalizedPath : normalizedPath.slice(lastSlashIndex + 1);
    

    if (ext && name.endsWith(ext)) {
        name = name.slice(0, -ext.length);
    }
    
    return name;
}


export function extname(path: string): string {
    const name = basename(path);
    const lastDotIndex = name.lastIndexOf('.');
    
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return '';
    }
    
    return name.slice(lastDotIndex);
}

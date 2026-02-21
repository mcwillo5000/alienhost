export interface InstalledMinecraftProject {
    path: string;
    provider: 'curseforge' | 'modrinth' | null;
    project_id: string | null;
    project_name: string | null;
    version_id: string | null;
    version_name: string | null;
    icon_url: string | null;
    update: {
        id: string;
        name: string;
    } | null;
}

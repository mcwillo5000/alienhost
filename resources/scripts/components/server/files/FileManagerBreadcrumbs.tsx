import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import tw from 'twin.macro';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const { data: files, error, mutate } = useFileManagerSwr();
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { pathname, hash } = useLocation();
    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((directory) => !!directory && directory !== '.')
            .map((directory, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: directory === '.trash' ? 'Trash' : directory };
                }

                return { name: directory, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <div className="flex flex-grow-0 items-center text-xs overflow-hidden" style={{ color: 'var(--theme-text-muted)' }}>
            {renderLeft || <div css={tw`w-12`} />}/<span className="px-1" style={{ color: 'var(--theme-text-muted)' }}>home</span>/
            <NavLink 
                to={`/server/${id}/files`} 
                className="px-1 no-underline font-medium transition-colors duration-200" 
                style={{ color: 'var(--theme-text-base)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-base)'}
            >
                container
            </NavLink>
            /
            {breadcrumbs().map((crumb, index) =>
                crumb.path ? (
                    <React.Fragment key={index}>
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            className="px-1 no-underline font-medium transition-colors duration-200"
                            style={{ color: 'var(--theme-text-base)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-base)'}
                        >
                            <span className="hidden sm:inline">{crumb.name}</span>
                            <span className="sm:hidden">{crumb.name.length > 8 ? crumb.name.substring(0, 8) + '...' : crumb.name}</span>
                        </NavLink>
                        /
                    </React.Fragment>
                ) : (
                    <span key={index} className="px-1 font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                        <span className="hidden sm:inline">{crumb.name}</span>
                        <span className="sm:hidden">{crumb.name.length > 8 ? crumb.name.substring(0, 8) + '...' : crumb.name}</span>
                    </span>
                )
            )}
            {(!file && !pathname.endsWith("/files/new") && files && files.length) ? (
                <span css={tw`px-1 text-neutral-300`}>
                    {(files.filter(file => file.isFile).length && files.filter(file => !file.isFile).length) ? ` • ${files.filter(file => file.isFile).length} files (${files.filter(file => !file.isFile).length} folders)` : (files.filter(file => !file.isFile).length ? ` • ${files.filter(file => !file.isFile).length} folders` : ` • ${files.filter(file => file.isFile).length} files`)}
                </span>
            ) : null}
            {file && (
                <React.Fragment>
                    <span className="px-1 font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                        <span className="hidden sm:inline">{file}</span>
                        <span className="sm:hidden">{file.length > 12 ? file.substring(0, 12) + '...' : file}</span>
                    </span>
                </React.Fragment>
            )}
        </div>
    );
};

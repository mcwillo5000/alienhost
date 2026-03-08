import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileArchive, faFileImport, faFolder, faTrash } from '@fortawesome/free-solid-svg-icons';
import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import React, { memo } from 'react';
import { FileObject } from '@/api/server/files/loadDirectory';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { ServerContext } from '@/state/server';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { join } from '@/lib/path';
import { bytesToString } from '@/lib/formatters';
import styles from './style.module.css';
import { useBleeps } from '@/components/RivionBleepsProvider';
import FileObjectSize from '@/components/server/files/FileObjectSize';

const Clickable: React.FC<{ file: FileObject }> = memo(({ file, children }) => {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const match = useRouteMatch();

    return (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead) ? (
        <div css={tw`flex-1 min-w-0`}>{children}</div>
    ) : (
        <NavLink
            css={tw`flex-1 min-w-0 no-underline text-current`}
            to={`${match.url}${file.isFile ? '/edit' : ''}#${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}, isEqual);

const FileObjectRow = ({ file }: { file: FileObject }) => {
    const isSelected = ServerContext.useStoreState((state) => state.files.selectedFiles.indexOf(file.name) >= 0);
    const bleeps = useBleeps();
    const isTrash = file.name === '.trash';
    
    const handleClick = () => {
        bleeps.click?.play();
    };
    
    return (
        <div
            className="border-b transition-all duration-200 hover:bg-opacity-50"
            style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: isSelected 
                    ? 'color-mix(in srgb, var(--theme-primary) 10%, transparent)'
                    : 'transparent'
            }}
            css={tw`px-3 py-3 flex items-center justify-between w-full`}
            key={file.name}
            onClick={handleClick}
            onContextMenu={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent(`pterodactyl:files:ctx:${file.key}`, { detail: { x: e.clientX, y: e.clientY } }));
            }}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 8%, transparent)';
                } else {
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 15%, transparent)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                } else {
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 10%, transparent)';
                }
            }}
        >
            <div css={tw`flex items-center flex-1 min-w-0`}>
                <div css={tw`mr-3 flex-shrink-0 flex items-center`}>
                    <SelectFileCheckbox name={file.name} />
                </div>
                <div css={tw`mr-3 flex-shrink-0 flex items-center`}>
                    {file.isFile ? (
                        <FontAwesomeIcon
                            icon={file.isSymlink ? faFileImport : file.isArchiveType() ? faFileArchive : faFileAlt}
                            className="text-sm"
                            css={
                                file.isSymlink ? { color: 'var(--theme-primary)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                file.isArchiveType() ? { color: 'var(--theme-primary)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                file.name.endsWith('.json') ? { color: 'var(--theme-primary)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                file.name.endsWith('.yml') || file.name.endsWith('.yaml') ? { color: 'var(--theme-primary)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                file.name.endsWith('.txt') ? { color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-muted)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                file.name.endsWith('.properties') ? { color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-muted)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                file.name.endsWith('.jar') ? { color: 'var(--theme-primary)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' } :
                                { color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-muted)', transform: isSelected ? 'scale(1.05)' : 'scale(1)' }
                            }
                        />
                    ) : (
                        <FontAwesomeIcon 
                            icon={isTrash ? faTrash : faFolder} 
                            className="text-sm" 
                            css={{ 
                                color: isTrash ? '#ef4444' : 'var(--theme-primary)', 
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                            }} 
                        />
                    )}
                </div>
                <div css={tw`flex-1 min-w-0`}>
                    <Clickable file={file}>
                        <div className="font-medium truncate" style={{ color: 'var(--theme-text-base)' }}>
                            {isTrash ? 'Trash' : file.name}
                        </div>
                        {!isTrash && (
                            <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                {file.isFile ? (
                                    <>
                                        {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                                            ? format(file.modifiedAt, 'M/d/yyyy, h:mm a')
                                            : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                                    </>
                                ) : (
                                    <>
                                        Directory • {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                                            ? format(file.modifiedAt, 'M/d/yyyy, h:mm a')
                                            : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                                        {' • Click to enter'}
                                    </>
                                )}
                            </div>
                        )}
                    </Clickable>
                </div>
            </div>
            {!isTrash && !file.isTrash && (
                <div className="flex items-center mr-3 flex-shrink-0 text-xs font-mono" style={{ color: 'var(--theme-text-muted)', minWidth: '5rem', justifyContent: 'flex-end' }}>
                    <FileObjectSize file={file} />
                </div>
            )}
            {!isTrash && (
                <div css={tw`ml-2 flex-shrink-0`}>
                    <FileDropdownMenu file={file} />
                </div>
            )}
        </div>
    );
};

export default memo(FileObjectRow, (prevProps, nextProps) => {
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;

    return isEqual(prevFile, nextFile);
});

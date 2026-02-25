import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faServer } from '@fortawesome/free-solid-svg-icons';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import PowerButtons from '@/components/server/console/PowerButtons';
import style from './style.module.css';
import GitActions from '@/components/server/files/GitActions';


const FrameContainer = styled.div`
    position: relative;
    width: 100%;
`;

const FrameSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

const FrameContent = styled.div`
    position: relative;
    z-index: 1;
`;


const ArwesFrame: React.FC<{ 
    children: React.ReactNode; 
    className?: string;
    cornerSize?: number;
}> = ({ children, className, cornerSize = 10 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 100 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 200,
                    height: Math.floor(height) || 100
                });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [children]);

    const { width, height } = dimensions;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cornerSize}
        L ${so + cornerSize},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cornerSize}
        L ${width - so - cornerSize},${height - so}
        L ${so},${height - so}
        Z
    `;

    return (
        <FrameContainer ref={containerRef} className={className}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <filter id="fileManagerFrameGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <path
                    data-name="bg"
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />
                <path
                    data-name="line"
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-border)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    style={{ filter: 'drop-shadow(0 0 2px var(--theme-border))' }}
                />
            </FrameSVG>
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

const ServerHeaderCard = styled.div`
    position: relative;
    overflow: visible;
    margin-bottom: 1.5rem;
    background-color: transparent;
`;

const ServerHeaderContent = styled.div<{ $backgroundImage?: string }>`
    position: relative;
    z-index: 1;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--theme-background-secondary);
    clip-path: polygon(0px 12px, 12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%);
    /* Arwes-style glow */
    box-shadow: 0 0 10px rgba(var(--theme-border-rgb, 55, 65, 81), 0.4),
                inset 0 0 15px rgba(0, 0, 0, 0.2);
    
    &::before {
        content: '';
        position: absolute;
        inset: -1px;
        background: var(--theme-border);
        clip-path: polygon(0px 12px, 12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%);
        z-index: -2;
        /* Arwes-style border glow */
        box-shadow: 0 0 6px var(--theme-border);
    }
    
    /* Background image layer */
    ${({ $backgroundImage }) =>
        $backgroundImage &&
        `
        &::after {
            content: '';
            position: absolute;
            inset: 1px;
            background-image: url(${$backgroundImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.2;
            clip-path: polygon(0px 11px, 11px 0px, 100% 0px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0px 100%);
            z-index: -1;
        }
        `};
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
`;

const ServerIconContainer = styled.div`
    height: 3rem;
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(59, 130, 246, 0.1);
    clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
    /* Arwes-style glow */
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
`;

const ServerIcon = styled(FontAwesomeIcon)`
    font-size: 1.25rem;
    color: #3b82f6;
    /* Arwes-style icon glow */
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
`;

const ServerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ServerDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const ServerName = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text-base);
    margin: 0;
    line-height: 1.4;
    font-family: 'Orbitron', sans-serif;
`;

const ServerDescription = styled.p`
    font-size: 0.875rem;
    color: var(--theme-text-muted);
    margin: 0;
    line-height: 1.4;
    font-family: 'Electrolize', sans-serif;
`;

const PowerControlsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        width: 100%;
        justify-content: stretch;
        
        /* Make buttons full width on mobile */
        & > div {
            flex: 1;
        }
        
        & .flex {
            width: 100%;
        }
        
        & .space-x-2 > * + * {
            margin-left: 0.5rem;
        }
        
        /* Stack power buttons horizontally but make them smaller */
        & button {
            flex: 1;
            min-width: 0;
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
        }
    }
`;

const FileManagerHeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap-reverse;
    gap: 1rem;
    
    @media (min-width: 768px) {
        flex-wrap: nowrap;
    }
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
    }
`;

const FileActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        width: 100%;
        flex-wrap: wrap;
        gap: 0.75rem;
        max-width: 500px;
        margin: 0 auto;
        justify-content: center;
        
        /* Make action buttons responsive */
        & > div,
        & > a {
            flex: none;
        }
        
        /* Stack buttons in mobile-friendly layout */
        & button,
        & a button {
            flex: none;
            width: auto;
            max-width: fit-content;
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
            white-space: nowrap;
        }
        
        /* File status can take full width on mobile */
        & > div:first-child {
            width: 100%;
            flex: none;
            order: -1;
            margin-bottom: 0.5rem;
        }
    }
    
    @media (max-width: 480px) {
        /* On very small screens, stack buttons vertically */
        flex-direction: column;
        max-width: 300px;
        align-items: stretch;
        
        & button,
        & a button {
            width: 100%;
            max-width: none;
        }
        
        & > div,
        & > a {
            width: 100%;
        }
    }
`;

const BreadcrumbsContainer = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        width: 100%;
        order: -1;
        margin-bottom: 0.5rem;
        
        /* Ensure breadcrumbs don't overflow on mobile */
        overflow: hidden;
    }
`;

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);
    const [ amount, setAmount ] = useState(250); 

    const getBackgroundImage = () => {
        const serverWithEggImage = server as any;
        if (serverWithEggImage.eggImage || serverWithEggImage.egg_image) {
            const eggImageUrl = serverWithEggImage.eggImage || serverWithEggImage.egg_image;
            return eggImageUrl;
        }
        return undefined;
    };

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    const LoadMoreButton = styled.button`
        ${tw`relative inline-block rounded p-2 uppercase tracking-wide text-sm transition-all duration-150 border bg-primary-500 border-primary-600 border text-primary-50 px-4 py-2 font-semibold text-base leading-6`}
        border: solid 2px #7b8793;
        color: #cad1d8;
        background-color: transparent;

        &:active {
            background-color: #7b879394;
        }
    `;

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                <Can action="control.console">
                    <ServerHeaderCard>
                        <ServerHeaderContent $backgroundImage={getBackgroundImage()}>
                            <ServerInfo>
                                <ServerIconContainer>
                                    <ServerIcon icon={faServer} />
                                </ServerIconContainer>
                                <ServerDetails>
                                    <ServerName>{name}</ServerName>
                                    <ServerDescription>
                                        {description || `Server UUID: ${server.uuid.substring(0, 8)}`}
                                    </ServerDescription>
                                </ServerDetails>
                            </ServerInfo>
                            <PowerControlsContainer>
                                <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                                    <div className="flex items-center space-x-2">
                                        <PowerButtons className={'flex space-x-2'} />
                                    </div>
                                </Can>
                            </PowerControlsContainer>
                        </ServerHeaderContent>
                    </ServerHeaderCard>
                </Can>

                <ArwesFrame cornerSize={10} className="mb-4">
                    <div className="p-3">
                        <FileManagerHeaderContainer>
                            <BreadcrumbsContainer>
                                <FileManagerBreadcrumbs
                                    renderLeft={
                                        <FileActionCheckbox
                                            type={'checkbox'}
                                            css={tw`mx-4`}
                                            checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                            onChange={onSelectAllClick}
                                        />
                                    }
                                />
                            </BreadcrumbsContainer>
                            <Can action={'file.create'}>
                                <FileActionsContainer>
                                    <FileManagerStatus />
                                    <NewDirectoryButton />
                                    <UploadButton />
                                    <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                                        <Button
                                            size={Options.Size.Compact}
                                            variant={Options.Variant.Primary}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                            New File
                                        </Button>
                                    </NavLink>
                                    <Can action={'file.git'}>
                                        <GitActions />
                                    </Can>
                                </FileActionsContainer>
                            </Can>
                        </FileManagerHeaderContainer>
                    </div>
                </ArwesFrame>
            </ErrorBoundary>
            {!files ? (
                <ArwesFrame cornerSize={10}>
                    <div className="p-8">
                        <Spinner size={'large'} centered />
                    </div>
                </ArwesFrame>
            ) : (
                <>
                    {!files.length ? (
                        <ArwesFrame cornerSize={10}>
                            <div className="p-8 text-center">
                                <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>This directory seems to be empty.</p>
                            </div>
                        </ArwesFrame>
                    ) : (
                        <ArwesFrame cornerSize={10}>
                            <CSSTransition classNames={'fade'} timeout={150} appear in>
                                <div>
                                    {sortFiles(files).slice(0, amount).map((file) => (
                                        <FileObjectRow key={file.key} file={file} />
                                    ))}
                                    {files.length > amount && (
                                        <>
                                            <br />
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }}>
                                                <LoadMoreButton onClick={() => setAmount(amount + 100)}> 
                                                    Load more {files.length - amount} files
                                                </LoadMoreButton>
                                            </div>
                                        </>
                                    )}
                                    <MassActionsBar />
                                </div>
                            </CSSTransition>
                        </ArwesFrame>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};

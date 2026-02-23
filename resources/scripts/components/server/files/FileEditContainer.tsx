import React, { useEffect, useState, useRef } from 'react';
import getFileContents from '@/api/server/files/getFileContents';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import saveFileContents from '@/api/server/files/saveFileContents';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { useHistory, useLocation, useParams } from 'react-router';
import FileNameModal from '@/components/server/files/FileNameModal';
import Can from '@/components/elements/Can';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import Select from '@/components/elements/Select';
import modes from '@/modes';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { encodePathSegments, hashToPath } from '@/helpers';
import { dirname } from '@/lib/path';
import CodemirrorEditor from '@/components/elements/CodemirrorEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faFileCode } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

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
    backgroundColor?: string;
}> = ({ children, className, cornerSize = 10, backgroundColor = '#1f2430' }) => {
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
                    <filter id="editorFrameGlow" x="-50%" y="-50%" width="200%" height="200%">
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
                    fill={backgroundColor}
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

const EditorHeaderContent = styled.div`
    position: relative;
    z-index: 10;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
`;

const FileIconContainer = styled.div`
    height: 3rem;
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(34, 197, 94, 0.1);
    clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
    position: relative;
    /* Arwes-style glow */
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
    
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid rgba(34, 197, 94, 0.4);
        clip-path: polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%);
        pointer-events: none;
    }
`;

const FileIcon = styled(FontAwesomeIcon)`
    font-size: 1.25rem;
    color: #22c55e;
    /* Arwes-style icon glow */
    filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.5));
`;

const FileInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        width: 100%;
    }
`;

const FileDetails = styled.div`
    display: flex;
    flex-direction: column;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        flex: 1;
        min-width: 0;
    }
`;

const FileName = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text-base);
    margin: 0;
    line-height: 1.4;
    font-family: 'Orbitron', sans-serif;
`;

const FileDescription = styled.p`
    font-size: 0.875rem;
    color: var(--theme-text-muted);
    margin: 0;
    line-height: 1.4;
    font-family: 'Electrolize', sans-serif;
`;

const EditorActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    
    /* Mobile responsive layout */
    @media (max-width: 768px) {
        width: 100%;
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
        
        /* Mode selector takes full width on mobile */
        & > div {
            width: 100%;
        }
        
        /* Button takes full width on mobile */
        & button {
            width: 100%;
        }
    }
    
    @media (max-width: 480px) {
        gap: 0.5rem;
    }
`;

export default () => {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const { action } = useParams<{ action: 'new' | string }>();
    const [loading, setLoading] = useState(action === 'edit');
    const [content, setContent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState('text/plain');

    const history = useHistory();
    const { hash } = useLocation();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addError, clearFlashes } = useFlash();

    let fetchFileContent: null | (() => Promise<string>) = null;

    useEffect(() => {
        if (action === 'new') return;

        setError('');
        setLoading(true);
        const path = hashToPath(hash);
        setDirectory(dirname(path));
        getFileContents(uuid, path)
            .then(setContent)
            .catch((error) => {
                console.error(error);
                setError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    }, [action, uuid, hash]);

    const save = (name?: string) => {
        if (!fetchFileContent) {
            return;
        }

        setLoading(true);
        clearFlashes('files:view');
        fetchFileContent()
            .then((content) => saveFileContents(uuid, name || hashToPath(hash), content))
            .then(() => {
                if (name) {
                    history.push(`/server/${id}/files/edit#/${encodePathSegments(name)}`);
                    return;
                }

                return Promise.resolve();
            })
            .catch((error) => {
                console.error(error);
                addError({ message: httpErrorToHuman(error), key: 'files:view' });
            })
            .then(() => setLoading(false));
    };

    if (error) {
        return <ServerError message={error} onBack={() => history.goBack()} />;
    }

    return (
        <PageContentBlock>
            <FlashMessageRender byKey={'files:view'} css={tw`mb-4`} />
            <ErrorBoundary>
                {/* File Editor Header Card */}
                <ArwesFrame css={tw`mb-4`} backgroundColor="var(--theme-background)">
                    <EditorHeaderContent>
                        <FileInfo>
                            <FileIconContainer>
                                <FileIcon icon={faFileCode} />
                            </FileIconContainer>
                            <FileDetails>
                                <FileName>{hash.replace(/^#\//, '') || 'New File'}</FileName>
                                <FileDescription>
                                    {action === 'edit' ? 'Editing file' : 'Creating new file'} • {mode.split('/')[1] || 'text'} mode
                                </FileDescription>
                            </FileDetails>
                        </FileInfo>
                        <EditorActionsContainer>
                            <div 
                                style={{
                                    backgroundColor: 'var(--theme-background)', 
                                    border: '1px solid var(--theme-border)',
                                    clipPath: 'polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%)',
                                    boxShadow: '0 0 6px rgba(var(--theme-border-rgb), 0.3)'
                                }}
                            >
                                <Select 
                                    value={mode} 
                                    onChange={(e) => setMode(e.currentTarget.value)} 
                                    style={{
                                        backgroundColor: 'transparent', 
                                        border: 'none', 
                                        color: 'var(--theme-text-base)',
                                        padding: '0.5rem 2rem 0.5rem 0.75rem',
                                        fontSize: '0.875rem',
                                        minWidth: '120px'
                                    }}
                                >
                                    {modes.map((mode) => (
                                        <option key={`${mode.name}_${mode.mime}`} value={mode.mime}>
                                            {mode.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            {action === 'edit' ? (
                                <Can action={'file.update'}>
                                    <Button 
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Primary}
                                        onClick={() => save()}
                                    >
                                        <FontAwesomeIcon icon={faSave} className="mr-1" />
                                        {t('files.editor.save')}
                                    </Button>
                                </Can>
                            ) : (
                                <Can action={'file.create'}>
                                    <Button 
                                        size={Options.Size.Compact}
                                        variant={Options.Variant.Primary}
                                        onClick={() => setModalVisible(true)}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                        {t('files.editor.create')}
                                    </Button>
                                </Can>
                            )}
                        </EditorActionsContainer>
                    </EditorHeaderContent>
                </ArwesFrame>

                <div css={tw`mb-4`}>
                    <FileManagerBreadcrumbs withinFileEditor isNewFile={action !== 'edit'} />
                </div>
            </ErrorBoundary>
            {hash.replace(/^#/, '').endsWith('.pteroignore') && (
                <ArwesFrame css={tw`mb-4`} backgroundColor="var(--theme-background)">
                    <div className="p-4" style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), transparent)',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            border: '1px solid rgba(6, 182, 212, 0.4)',
                            clipPath: 'polygon(0px 10px, 10px 0px, 100% 0px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0px 100%)',
                            pointerEvents: 'none'
                        }} />
                        <p className="text-sm" style={{color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif"}}>
                            You&apos;re editing a <code className="font-mono py-px px-1" style={{
                                backgroundColor: 'var(--theme-background)', 
                                color: '#06b6d4',
                                clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'
                            }}>.pteroignore</code>{' '}
                            file. Any files or directories listed in here will be excluded from backups. Wildcards are
                            supported by using an asterisk (<code className="font-mono py-px px-1" style={{
                                backgroundColor: 'var(--theme-background)', 
                                color: '#06b6d4',
                                clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'
                            }}>*</code>).
                            You can negate a prior rule by prepending an exclamation point (
                            <code className="font-mono py-px px-1" style={{
                                backgroundColor: 'var(--theme-background)', 
                                color: '#06b6d4',
                                clipPath: 'polygon(0px 3px, 3px 0px, 100% 0px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0px 100%)'
                            }}>!</code>).
                        </p>
                    </div>
                </ArwesFrame>
            )}
            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    save(name);
                }}
            />
            <ArwesFrame>
                <div css={tw`relative`} style={{padding: '1rem'}}>
                    <SpinnerOverlay visible={loading} />
                    <CodemirrorEditor
                        mode={mode}
                        filename={hash.replace(/^#/, '')}
                        onModeChanged={setMode}
                        initialContent={content}
                        fetchContent={(value) => {
                            fetchFileContent = value;
                        }}
                        onContentSaved={() => {
                            if (action !== 'edit') {
                                setModalVisible(true);
                            } else {
                                save();
                            }
                        }}
                    />
                </div>
            </ArwesFrame>
        </PageContentBlock>
    );
};

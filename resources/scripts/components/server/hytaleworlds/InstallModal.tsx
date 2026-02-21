import React, { useContext, useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Form, Formik, FormikHelpers, Field as FormikField, FieldProps } from 'formik';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Dialog } from '@/components/elements/dialog';
import Select from '@/components/elements/Select';
import installWorld from '@/api/server/hytaleworlds/installWorld';
import Label from '@/components/elements/Label';
import * as Yup from 'yup';
import http from '@/api/http';
import { httpErrorToHuman } from '@/api/http';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faExclamationCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import Spinner from '@/components/elements/Spinner';
import { formatDistanceToNow } from 'date-fns';
import Alert from '@/components/elements/alert/Alert';
import loadDirectory from '@/api/server/files/loadDirectory';
interface Values {
    version: string;
}
interface Version {
    id: string;
    name: string;
    game_versions?: string[];
    compatibility?: string;
    version_compatibility?: string;
    platforms?: string[];
    author?: string;
    releaseDate?: number;
}
interface Project {
    title?: string;
    name?: string;
    description?: string;
    short_description?: string;
    icon_url?: string | null;
    downloads?: number;
    updated_at?: string;
    last_updated?: string;
    author?: string;
    author_id?: string;
}
interface Props {
    worldId: string;
    worldName: string;
    onInstalled: () => void;
    open: boolean;
    onClose: () => void;
}
const schema = Yup.object().shape({
    version: Yup.string().required('A version must be selected.'),
});
interface ModalContentProps {
    isClosing?: boolean;
}
const ModalContent = styled.div<ModalContentProps>`
    ${tw`py-4`};
    animation: ${props => props.isClosing ? 'fadeOut 300ms ease-in-out' : 'fadeIn 200ms ease-in-out'};
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
    }
`;
const LoadingContainer = styled.div`
    ${tw`flex flex-col items-center justify-center py-8 text-neutral-300`};
`;
const LoadingText = styled.p`
    ${tw`mt-2 text-sm`};
`;
const NoVersionsContainer = styled.div`
    ${tw`flex flex-col items-center justify-center py-8 text-neutral-300`};
`;
const WorldHeader = styled.div`
    ${tw`flex items-start gap-4 mb-6`};
`;
const WorldIcon = styled.img`
    ${tw`w-16 h-16 rounded-lg object-cover bg-neutral-600 border-2 border-neutral-500`};
`;
const WorldInfo = styled.div`
    ${tw`flex-1`};
`;
const WorldTitle = styled.h2`
    ${tw`text-xl font-bold text-neutral-100 mb-1`};
`;
const WorldDescription = styled.p`
    ${tw`text-sm text-neutral-300 leading-relaxed`};
`;
const WorldStats = styled.div`
    ${tw`flex flex-wrap gap-4 mt-2`};
`;
const StatItem = styled.div`
    ${tw`flex items-center text-sm text-neutral-300`};
`;
const StatIcon = styled(FontAwesomeIcon)`
    ${tw`text-neutral-400 mr-2`};
`;
const FormContainer = styled.div`
    ${tw`flex flex-col space-y-4`};
`;
const VersionSelect = styled(Select)`
    ${tw`bg-neutral-700 border-neutral-500 hover:border-neutral-400 transition-colors duration-150`};
`;
const HelperText = styled.p`
    ${tw`text-sm text-neutral-400 mt-1`};
`;
const PlaceholderIcon = styled.div`
    ${tw`w-16 h-16 rounded-lg bg-neutral-600 border-2 border-neutral-500 flex items-center justify-center text-neutral-300`};
`;
const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    try {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    } catch (e) {
        console.error('Error formatting number:', e);
        return '0';
    }
};
const InstallModalComponent = ({ worldId, worldName, onInstalled, open, onClose }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('worlds:install-modal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
    const [downloadId, setDownloadId] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [expectedFileSize, setExpectedFileSize] = useState<number | null>(null);
    const [downloadedFileName, setDownloadedFileName] = useState<string | null>(null);
    const [pullInterval, setPullInterval] = useState<NodeJS.Timeout | null>(null);
    const safeWorldId = worldId || '';
    const safeWorldName = worldName || 'World';
    useEffect(() => {
        if (!open || !worldId) return;
        clearFlashes();
        setError(null);
        setLoading(true);
        setSelectedVersion(null);
        const safeWorldId = worldId || '';
        try {
            http.get(`/api/client/servers/${uuid}/hytale-worlds/${safeWorldId}/versions`)
                .then(({ data }) => {
                    setProject(data.project);
                    setVersions(data.versions);
                    if (data.versions.length > 0) {
                        setSelectedVersion(data.versions[0]);
                    }
                })
                .catch(error => {
                    console.error('Error loading world versions:', error);
                    setError(httpErrorToHuman(error));
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error in InstallModal effect:', error);
            setError('An unexpected error occurred while loading world versions.');
            setLoading(false);
        }
    }, [worldId, open]);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };
    useEffect(() => {
        if (isClosing) {
            const timer = setTimeout(() => {
                setIsClosing(false);
            }, 400);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isClosing]);
    useEffect(() => {
        if (!open && pullInterval) {
            clearInterval(pullInterval);
            setPullInterval(null);
            setIsInstalling(false);
            setDownloadProgress(0);
        }
    }, [open, pullInterval]);
    const pollDownloadStatus = (jobId: string) => {
        let hasCompletedOnce = false;
        const interval = setInterval(() => {
            http.get(`/api/client/servers/${uuid}/hytale-worlds/download-status/${jobId}`)
                .then(({ data }) => {
                    if (data.filename) {
                        setDownloadedFileName(data.filename);
                    }
                    if (data.status === 'completed' && data.decompressed) {
                        clearInterval(interval);
                        setPullInterval(null);
                        setDownloadProgress(100);
                        setIsInstalling(false);
                        hasCompletedOnce = true;
                        setTimeout(() => {
                            handleClose();
                            onInstalled();
                        }, 1000);
                    } else if (data.status === 'failed') {
                        clearInterval(interval);
                        setPullInterval(null);
                        setIsInstalling(false);
                        setError(data.error || 'Installation failed');
                        setDownloadProgress(0);
                    } else if (data.status === 'downloading' && data.filename) {
                        loadDirectory(uuid, '/')
                            .then((files) => {
                                const downloadedFile = files.find(f => f.name === data.filename);
                                if (downloadedFile && downloadedFile.size > 0) {
                                    const estimatedSize = downloadedFile.size * 1.5;
                                    const progress = Math.min((downloadedFile.size / estimatedSize) * 100, 95);
                                    setDownloadProgress(progress);
                                }
                            })
                            .catch(console.error);
                    }
                })
                .catch(error => {
                    console.error('Error polling download status:', error);
                });
        }, 2000);
        setPullInterval(interval);
        setTimeout(() => {
            if (!hasCompletedOnce) {
                clearInterval(interval);
                setPullInterval(null);
                if (isInstalling) {
                    setIsInstalling(false);
                    setError('Installation timeout - please check your server files');
                }
            }
        }, 600000);
    };
    const submit = ({ version }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        setError(null);
        const safeWorldId = worldId || '';
        const safeVersion = version || '';
        console.log('Installing world:', { worldId: safeWorldId, version: safeVersion });
        setSubmitting(true);
        setIsInstalling(true);
        setDownloadProgress(0);
        installWorld(uuid, safeWorldId, safeVersion)
            .then((response: any) => {
                console.log('World installation job started:', response);
                setSubmitting(false);
                if (response.download_id) {
                    setDownloadId(response.download_id);
                    pollDownloadStatus(response.download_id);
                } else {
                    setIsInstalling(false);
                    setTimeout(() => {
                        handleClose();
                        onInstalled();
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Error installing world:', error);
                setError(httpErrorToHuman(error));
                setSubmitting(false);
                setIsInstalling(false);
                setDownloadProgress(0);
            });
    };
    return (
        <Dialog
            open={open && !isClosing}
            onClose={handleClose}
            title={`Install ${safeWorldName}`}
            hideCloseIcon={false}
        >
            <ModalContent isClosing={isClosing}>
                <FlashMessageRender byKey={'worlds:install-modal'} css={tw`mb-4`} />
                {error && (
                    <Alert type="danger" className="mb-4">
                        {error}
                    </Alert>
                )}
                {loading ? (
                    <LoadingContainer>
                        <Spinner size={'large'} />
                        <LoadingText>Loading world versions...</LoadingText>
                    </LoadingContainer>
                ) : versions.length === 0 ? (
                    <Alert type="warning" className="my-4">
                        <div css={tw`flex flex-col items-center w-full py-4`}>
                            <FontAwesomeIcon icon={faExclamationCircle} css={tw`text-4xl mb-2`} />
                            <p>No versions available for this world.</p>
                        </div>
                    </Alert>
                ) : (
                    <>
                        {project && (
                            <WorldHeader>
                                {project.icon_url ? (
                                    <WorldIcon src={project.icon_url} alt={project.name || project.title || worldName} />
                                ) : (
                                    <PlaceholderIcon>
                                        <FontAwesomeIcon icon={faDownload} size="2x" />
                                    </PlaceholderIcon>
                                )}
                                <WorldInfo>
                                    <WorldTitle>{project.name || project.title || worldName}</WorldTitle>
                                    <WorldDescription>
                                        {project.description || project.short_description || 'No description available.'}
                                    </WorldDescription>
                                    <WorldStats>
                                        {project.downloads !== undefined && project.downloads !== null && (
                                            <StatItem>
                                                <StatIcon icon={faDownload} />
                                                {formatNumber(project.downloads)} downloads
                                            </StatItem>
                                        )}
                                        {(project.updated_at || project.last_updated) && (
                                            <StatItem>
                                                <StatIcon icon={faClock} />
                                                Updated {formatDate(project.updated_at || project.last_updated)}
                                            </StatItem>
                                        )}
                                    </WorldStats>
                                </WorldInfo>
                            </WorldHeader>
                        )}
                        <Formik
                            onSubmit={submit}
                            initialValues={{ version: versions && versions.length > 0 ? versions[0]?.id || '' : '' }}
                            validationSchema={schema}
                        >
                            {({ isSubmitting, submitForm }) => (
                                <Form>
                                    <FormContainer>
                                        <div>
                                            <Label>Version</Label>
                                            <FormikField name="version">
                                                {({ field }: FieldProps) => (
                                                    <VersionSelect {...field}>
                                                        {versions && versions.length > 0 ? versions.map((version) => (
                                                            <option key={version?.id || 'unknown'} value={version?.id || ''}>
                                                                {version?.name || 'Unknown version'}
                                                            </option>
                                                        )) : (
                                                            <option value="">No versions available</option>
                                                        )}
                                                    </VersionSelect>
                                                )}
                                            </FormikField>
                                            <HelperText>
                                                Select the version of the world you want to install.
                                            </HelperText>
                                        </div>
                                        <Dialog.Footer>
                                            <Button.Text
                                                className={'w-full sm:w-auto'}
                                                onClick={handleClose}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button.Text>
                                            <Button
                                                className={'w-full sm:w-auto'}
                                                disabled={isSubmitting || versions.length === 0 || isInstalling}
                                                onClick={submitForm}
                                            >
                                                {isInstalling ? (
                                                    <>
                                                        <Spinner size="small" css={tw`mr-2`} />
                                                        Installing... {downloadProgress > 0 ? `(${downloadProgress.toFixed(1)}%)` : ''}
                                                    </>
                                                ) : isSubmitting ? (
                                                    <>
                                                        <Spinner size="small" css={tw`mr-2`} />
                                                        Starting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faDownload} css={tw`mr-2`} />
                                                        Install World
                                                    </>
                                                )}
                                            </Button>
                                        </Dialog.Footer>
                                    </FormContainer>
                                </Form>
                            )}
                        </Formik>
                    </>
                )}
            </ModalContent>
        </Dialog >
    );
};
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return 'Unknown date';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Unknown date';
        }
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Unknown date';
    }
}
export default InstallModalComponent;

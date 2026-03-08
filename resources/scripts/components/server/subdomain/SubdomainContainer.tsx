import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import Spinner from '@/components/elements/Spinner';
import getServerSubdomains from '@/api/server/subdomain/getServerSubdomains';
import createServerSubdomain from '@/api/server/subdomain/createServerSubdomain';
import deleteServerSubdomain from '@/api/server/subdomain/deleteServerSubdomain';
import syncServerSubdomain from '@/api/server/subdomain/syncServerSubdomain';
import { Button } from '@/components/elements/button/index';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Code from '@/components/elements/Code';
import { Dialog } from '@/components/elements/dialog/index';

const SubdomainManager = () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data, error, mutate } = useSWR([uuid, 'subdomain'], key => getServerSubdomains(key), { revalidateOnFocus: false });
    const [isCreating, setIsCreating] = useState(false);
    const [subdomain, setSubdomain] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'sync' | 'delete' | null>(null);
    const [selectedSubdomainId, setSelectedSubdomainId] = useState<number | null>(null);

    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => {
            setErrorMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    if (!data) return (
        <ServerContentBlock title="Subdomain Management">
            <div css={tw`flex items-center justify-center h-64`}>
                <Spinner size={'large'} />
            </div>
        </ServerContentBlock>
    );

    const handleCreateSubdomain = async () => {
        setErrorMessage(null);
        if (!subdomain || !selectedDomain) {
            setErrorMessage('Please enter a subdomain and select a domain.');
            return;
        }
        setIsCreating(true);
        try {
            const response = await createServerSubdomain(uuid, { subdomain, domainId: Number(selectedDomain) });
            if (!response.success) {
                setErrorMessage(response.message);
            } else {
                mutate();
                setSubdomain('');
                setSelectedDomain('');
            }
        } catch (err) {
            setErrorMessage('Failed to create subdomain. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const openDialog = (action: 'sync' | 'delete', subdomainId: number) => {
        setDialogAction(action);
        setSelectedSubdomainId(subdomainId);
        setDialogOpen(true);
    };

    const confirmDialogAction = async () => {
        if (!selectedSubdomainId || !dialogAction) return;
        setErrorMessage(null);
        try {
            let response;
            if (dialogAction === 'sync') {
                response = await syncServerSubdomain(uuid, selectedSubdomainId);
            } else if (dialogAction === 'delete') {
                response = await deleteServerSubdomain(uuid, selectedSubdomainId);
            }
            if (!response?.success) {
                setErrorMessage(response?.message || 'Action failed. Please try again.');
            } else {
                mutate();
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
        setDialogOpen(false);
    };

    return (
        <ServerContentBlock title="Subdomain Management">
            <FlashMessageRender byKey={'subdomain'} css={tw`mb-4`} />
            <div css={tw`flex flex-col gap-6`}>
                {/* Create Subdomain */}
                <FuturisticContentBox title={'Create Subdomain'}>
                    {errorMessage && (
                        <div
                            css={tw`mb-4 px-4 py-3 rounded text-sm`}
                            style={{
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#ef4444',
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}
                    <div css={tw`flex flex-col md:flex-row md:flex-nowrap gap-3`}>
                        <Input
                            type="text"
                            placeholder="Enter subdomain"
                            value={subdomain}
                            onChange={(e) => setSubdomain(e.target.value)}
                            css={tw`w-full md:w-64`}
                        />
                        <Select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            css={tw`w-full md:w-48`}
                        >
                            <option value="">Select Domain</option>
                            {data.domains.map((domain) => (
                                <option key={domain.id} value={domain.id}>{domain.domain}</option>
                            ))}
                        </Select>
                        <Button
                            onClick={handleCreateSubdomain}
                            disabled={isCreating}
                            css={tw`w-auto md:w-40 whitespace-nowrap`}
                        >
                            {isCreating ? 'Creating...' : 'Create Subdomain'}
                        </Button>
                    </div>
                </FuturisticContentBox>

                {/* Subdomain List */}
                <FuturisticContentBox title={'Active Subdomains'}>
                    {data.subdomains.length > 0 ? (
                        <div css={tw`flex flex-col gap-3`}>
                            {data.subdomains.map((sub) => (
                                <div
                                    key={sub.id}
                                    css={tw`flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 px-4 py-3 rounded`}
                                    style={{
                                        backgroundColor: 'var(--theme-background)',
                                        border: '1px solid var(--theme-border)',
                                    }}
                                >
                                    <div
                                        css={tw`hidden md:flex flex-shrink-0`}
                                        style={{ color: 'var(--theme-primary)' }}
                                    >
                                        <FontAwesomeIcon icon={faGlobeAmericas} size="lg" />
                                    </div>
                                    <div css={tw`flex-1 flex flex-wrap gap-6`}>
                                        <div css={tw`flex flex-col`}>
                                            <CopyOnClick text={sub.fullSubdomain}>
                                                <Code dark>{sub.fullSubdomain}</Code>
                                            </CopyOnClick>
                                            <span
                                                css={tw`text-xs mt-1`}
                                                style={{ color: 'var(--theme-text-muted)' }}
                                            >
                                                Subdomain
                                            </span>
                                        </div>
                                        <div css={tw`flex flex-col`}>
                                            <Code dark>{sub.ip}:{sub.port}</Code>
                                            <span
                                                css={tw`text-xs mt-1`}
                                                style={{ color: 'var(--theme-text-muted)' }}
                                            >
                                                IP Address
                                            </span>
                                        </div>
                                    </div>
                                    <div css={tw`flex gap-2 w-full md:w-auto`}>
                                        <Button.Text
                                            css={tw`flex flex-1 md:flex-none items-center justify-center gap-2`}
                                            onClick={() => openDialog('sync', sub.id)}
                                        >
                                            <FontAwesomeIcon icon={faSync} /> Sync
                                        </Button.Text>
                                        <Button.Danger
                                            css={tw`flex flex-1 md:flex-none items-center justify-center`}
                                            onClick={() => openDialog('delete', sub.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button.Danger>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            css={tw`flex flex-col items-center justify-center py-12`}
                            style={{ color: 'var(--theme-text-muted)' }}
                        >
                            <FontAwesomeIcon
                                icon={faGlobeAmericas}
                                css={tw`mb-3`}
                                style={{ fontSize: '3rem', color: 'var(--theme-text-muted)' }}
                            />
                            <p
                                css={tw`text-sm`}
                                style={{ fontFamily: "'Electrolize', sans-serif" }}
                            >
                                No subdomains have been created yet.
                            </p>
                        </div>
                    )}
                </FuturisticContentBox>
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <h1 css={tw`text-lg font-semibold mb-2`} style={{ color: 'var(--theme-text-base)' }}>
                    Confirm Action
                </h1>
                <p style={{ color: 'var(--theme-text-muted)' }}>
                    Are you sure you want to {dialogAction} this subdomain?
                </p>
                <div css={tw`flex justify-end gap-2 mt-4`}>
                    <Button.Text onClick={() => setDialogOpen(false)}>Cancel</Button.Text>
                    <Button.Danger onClick={confirmDialogAction}>Confirm</Button.Danger>
                </div>
            </Dialog>
        </ServerContentBlock>
    );
};

export default SubdomainManager;

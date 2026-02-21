import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import { Alert } from '@/components/elements/alert/index';
import getServerSubdomains from '@/api/server/subdomain/getServerSubdomains';
import createServerSubdomain from '@/api/server/subdomain/createServerSubdomain';
import deleteServerSubdomain from '@/api/server/subdomain/deleteServerSubdomain';
import syncServerSubdomain from '@/api/server/subdomain/syncServerSubdomain';
import { Button } from '@/components/elements/button/index';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import GreyRowBox from '@/components/elements/GreyRowBox';
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

    if (!data) return <ServerContentBlock title="Subdomain Management">Loading...</ServerContentBlock>;

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
            <div tw="flex flex-col gap-4 p-4">
                {errorMessage && <Alert type="danger">{errorMessage}</Alert>}
                <div tw="flex flex-col md:flex-row md:flex-nowrap gap-4 items-center">
                    <Input type="text" placeholder="Enter subdomain" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} tw="w-full md:w-64" />
                    <Select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} tw="w-full md:w-48">
                        <option value="">Select Domain</option>
                        {data.domains.map((domain) => (
                            <option key={domain.id} value={domain.id}>{domain.domain}</option>
                        ))}
                    </Select>
                    <Button onClick={handleCreateSubdomain} disabled={isCreating} tw="w-auto md:w-40 whitespace-nowrap">
                        {isCreating ? 'Creating...' : 'Create Subdomain'}
                    </Button>
                </div>
                {data.subdomains.length > 0 ? (
                    <div>
                        {data.subdomains.map((sub) => (
                            <GreyRowBox key={sub.id} tw="flex items-center justify-between p-4 mt-2 gap-4">
                                <div tw="flex items-center text-neutral-400 pl-4 pr-6">
                                    <FontAwesomeIcon icon={faGlobeAmericas} size="lg" tw="w-8 h-8" />
                                </div>
                                <div tw="flex-1 flex space-x-8">
                                    <div tw="flex flex-col">
                                        <CopyOnClick text={sub.fullSubdomain}><Code dark>{sub.fullSubdomain}</Code></CopyOnClick>
                                        <span tw="text-sm text-neutral-400">Subdomain</span>
                                    </div>
                                    <div tw="flex flex-col">
                                        <Code dark>{sub.ip}:{sub.port}</Code>
                                        <span tw="text-sm text-neutral-400">IP Address</span>
                                    </div>
                                </div>
                                <div tw="flex space-x-2">
                                    <Button.Text tw="flex items-center gap-2" onClick={() => openDialog('sync', sub.id)}>
                                        <FontAwesomeIcon icon={faSync} /> Sync
                                    </Button.Text>
                                    <Button.Danger onClick={() => openDialog('delete', sub.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button.Danger>
                                </div>
                            </GreyRowBox>
                        ))}
                    </div>
                ) : (
                    <div>No subdomains found.</div>
                )}
            </div>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <h1 tw="text-lg font-semibold mb-2">Confirm Action</h1>
                <p>Are you sure you want to {dialogAction} this subdomain?</p>
                <div tw="flex justify-end gap-2 mt-4">
                    <Button.Text onClick={() => setDialogOpen(false)}>Cancel</Button.Text>
                    <Button.Danger onClick={confirmDialogAction}>Confirm</Button.Danger>
                </div>
            </Dialog>
        </ServerContentBlock>
    );
};

export default SubdomainManager;

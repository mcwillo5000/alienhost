import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import asDialog from '@/hoc/asDialog';
import { Form, Formik, FormikHelpers } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import Field from '@/components/elements/Field';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';
import useFlash, { useFlashKey } from '@/plugins/useFlash';
import { object, string } from 'yup';
import gitClone from '@/api/server/files/gitClone';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import gitPull from '@/api/server/files/gitPull';
import FormikSwitch from '@/components/elements/FormikSwitch';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

interface CloneValues {
    url: string;
    branch: string;
    token: string;
    saveToken: boolean;
}

interface PullValues {
    token: string;
    saveToken: boolean;
    hardReset: boolean;
}

const GitCloneDialog = asDialog({
    title: 'Clone Repository',
})(() => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const gitTokenSaved = ServerContext.useStoreState((state) => state.server.data!.gitTokenSaved);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const { mutate } = useFileManagerSwr();
    const { close } = useContext(DialogWrapperContext);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('files:git-clone');

    const [spinner, showSpinner] = useState(false);

    useEffect(() => {
        return () => {
            clearFlashes();
        };
    }, []);

    const submit = ({ url, branch, token, saveToken }: CloneValues, { setSubmitting }: FormikHelpers<CloneValues>) => {
        clearFlashes();
        showSpinner(true);

        gitClone(uuid, directory, url, branch, token, saveToken)
            .then(() => {
                mutate();
                close();
            })
            .catch((error) => {
                clearAndAddHttpError(error);
            })
            .finally(() => {
                setSubmitting(false);
                showSpinner(false);
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                url: '',
                branch: '',
                token: '',
                saveToken: gitTokenSaved,
            }}
            validationSchema={object().shape({
                url: string().required(),
            })}
        >
            {({ submitForm, isSubmitting }) => (
                <>
                    <FlashMessageRender byKey={'files:git-clone'} css={tw`mb-2`} />
                    <SpinnerOverlay visible={spinner} size={'large'} />
                    <Form css={tw`m-0`}>
                        <div css={tw`mb-4`}>
                            <Field name={'url'} label={'Git URL'} autoFocus />
                        </div>
                        <div css={tw`mb-4`}>
                            <Field
                                name={'branch'}
                                label={'Branch'}
                                description={'Leave empty to clone the main branch.'}
                            />
                        </div>
                        <div css={tw`mb-4`}>
                            <Field
                                name={'token'}
                                label={'Personal Access Token'}
                                type={'password'}
                                description={
                                    gitTokenSaved
                                        ? 'A token is already saved. Leave blank to use it, or enter a new one to replace it.'
                                        : 'For private repositories. You can create one at: https://github.com/settings/tokens'
                                }
                            />
                        </div>
                        <div>
                            <FormikSwitch
                                name={'saveToken'}
                                label={'Save Token'}
                                description={'Save this access token for the future.'}
                            />
                        </div>
                    </Form>
                    <Dialog.Footer>
                        <Button.Text className={'w-full sm:w-auto'} onClick={close}>
                            Cancel
                        </Button.Text>
                        <Button className={'w-full sm:w-auto'} onClick={submitForm} disabled={isSubmitting}>
                            Clone
                        </Button>
                    </Dialog.Footer>
                </>
            )}
        </Formik>
    );
});

const GitPullDialog = asDialog({
    title: 'Pull Repository',
})(() => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const gitTokenSaved = ServerContext.useStoreState((state) => state.server.data!.gitTokenSaved);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const { mutate } = useFileManagerSwr();
    const { close } = useContext(DialogWrapperContext);
    const { addFlash } = useFlash();
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('files:git-pull');

    const [spinner, showSpinner] = useState(false);

    useEffect(() => {
        return () => {
            clearFlashes();
        };
    }, []);

    const submit = ({ token, saveToken, hardReset }: PullValues, { setSubmitting }: FormikHelpers<PullValues>) => {
        clearFlashes();
        showSpinner(true);

        gitPull(uuid, directory, token, saveToken, hardReset)
            .then(() => {
                mutate();
                close();
                addFlash({
                    key: 'files',
                    type: 'success',
                    title: 'success',
                    message: "You've successfully pulled the latest changes.",
                });
            })
            .catch((error) => {
                if (httpErrorToHuman(error).includes('up-to-date')) {
                    addFlash({
                        key: 'files:git-pull',
                        title: 'success',
                        type: 'success',
                        message: 'Already up-to-date.',
                    });
                } else {
                    clearAndAddHttpError(error);
                }
            })
            .finally(() => {
                setSubmitting(false);
                showSpinner(false);
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                token: '',
                saveToken: gitTokenSaved,
                hardReset: false,
            }}
        >
            {({ submitForm, isSubmitting }) => (
                <>
                    <FlashMessageRender byKey={'files:git-pull'} css={tw`mb-2`} />
                    <SpinnerOverlay visible={spinner} size={'large'} />
                    <Form css={tw`m-0`}>
                        <div css={tw`mb-4`}>
                            <Field
                                name={'token'}
                                label={'Personal Access Token'}
                                type={'password'}
                                description={
                                    gitTokenSaved
                                        ? 'A token is already saved. Leave blank to use it, or enter a new one to replace it.'
                                        : 'For private repositories. You can create one at: https://github.com/settings/tokens'
                                }
                                autoFocus
                            />
                        </div>
                        <div css={tw`mb-4`}>
                            <FormikSwitch
                                name={'saveToken'}
                                label={'Save Token'}
                                description={'Save this access token for the future.'}
                            />
                        </div>
                        <div>
                            <FormikSwitch
                                name={'hardReset'}
                                label={'Hard Reset'}
                                description={'Discard all current changes before the pull.'}
                            />
                        </div>
                    </Form>
                    <Dialog.Footer>
                        <Button.Text className={'w-full sm:w-auto'} onClick={close}>
                            Cancel
                        </Button.Text>
                        <Button className={'w-full sm:w-auto'} onClick={submitForm} disabled={isSubmitting}>
                            Pull
                        </Button>
                    </Dialog.Footer>
                </>
            )}
        </Formik>
    );
});

export default () => {
    const [cloneOpen, setCloneOpen] = useState(false);
    const [pullOpen, setPullOpen] = useState(false);

    return (
        <>
            <GitCloneDialog open={cloneOpen} onClose={setCloneOpen.bind(this, false)} />
            <GitPullDialog open={pullOpen} onClose={setPullOpen.bind(this, false)} />
            <Button.Text onClick={setCloneOpen.bind(this, true)}>Git Clone</Button.Text>
            <Button.Danger onClick={setPullOpen.bind(this, true)}>Git Pull</Button.Danger>
        </>
    );
};

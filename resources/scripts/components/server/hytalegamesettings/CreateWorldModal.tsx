import React, { useContext, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import { Button } from '@/components/elements/button/index';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';
import updateHytaleSettings from '@/api/server/hytalegamesettings/updateHytaleSettings';
import { HytaleSettings } from '@/api/server/hytalegamesettings/getHytaleSettings';
interface Values {
    worldName: string;
}
const schema = object().shape({
    worldName: string()
        .required('A valid world name must be provided.')
        .matches(/^[a-zA-Z0-9_-]+$/, 'World name can only contain letters, numbers, hyphens, and underscores.'),
});
interface Props {
    open: boolean;
    onClose: () => void;
    currentSettings: HytaleSettings;
    onWorldCreated: (worldName: string) => void;
}
export default ({ open, onClose, currentSettings, onWorldCreated }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const { close } = useContext(DialogWrapperContext);
    const { addError, clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submit = ({ worldName }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setIsSubmitting(true);
        clearFlashes('hytale:create-world');
        const updatedSettings = { ...currentSettings, worldName };
        updateHytaleSettings(uuid, updatedSettings)
            .then(() => {
                addFlash({
                    key: 'hytale',
                    type: 'success',
                    message: `World "${worldName}" will be created. Restarting server...`,
                });
                onWorldCreated(worldName);
                if (instance) {
                    instance.send('set state', 'restart');
                }
                close();
                onClose();
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                setIsSubmitting(false);
                addError({
                    key: 'hytale:create-world',
                    message: error.response?.data?.message || 'Failed to create world.'
                });
            });
    };
    return (
        <Dialog open={open} onClose={onClose} title={'Create New World'}>
            <Formik onSubmit={submit} validationSchema={schema} initialValues={{ worldName: '' }}>
                {({ submitForm, isSubmitting: formSubmitting }) => (
                    <>
                        <FlashMessageRender byKey={'hytale:create-world'} />
                        <Form className={'m-0'}>
                            <Field
                                autoFocus
                                id={'worldName'}
                                name={'worldName'}
                                label={'World Name'}
                                description={'Enter a unique name for the new world. Only letters, numbers, hyphens, and underscores are allowed.'}
                            />
                        </Form>
                        <Dialog.Footer>
                            <Button.Text className={'w-full sm:w-auto'} onClick={onClose} disabled={isSubmitting || formSubmitting}>
                                Cancel
                            </Button.Text>
                            <Button className={'w-full sm:w-auto'} onClick={submitForm} disabled={isSubmitting || formSubmitting}>
                                {isSubmitting || formSubmitting ? 'Creating...' : 'Create World'}
                            </Button>
                        </Dialog.Footer>
                    </>
                )}
            </Formik>
        </Dialog>
    );
};

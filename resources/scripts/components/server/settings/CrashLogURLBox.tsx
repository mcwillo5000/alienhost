import React from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import Field from '@/components/elements/Field';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';
import changeCrashLogURL from '@/api/server/changeCrashLogURL';

interface Values {
    url: string | null;
}

const StartTextBox = () => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <TitledGreyBox title={'Crash logs alert'} css={tw`relative`}>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0`}>
                <Field id={'url'} name={'url'} label={'Text'} type={'text'} />
                <div css={tw`mt-6 flex items-center`}>
                    <div css={tw`flex-1`}>
                        <div css={tw`border-l-4 border-cyan-500 p-3`}>
                            <p css={tw`text-xs text-neutral-200`}>
                                Webhook address on which messages about crashes will be sent, along with a link to the
                                crashlog. The system has integration with discord webhooks, you just need to provide
                                discord webhook address.
                            </p>
                        </div>
                    </div>
                    <div css={tw`ml-4`}>
                        <Button type={'submit'}>Save</Button>
                    </div>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ url }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('settings');
        changeCrashLogURL(server.uuid, url!)
            .then(() => setServer({ ...server, crashlogUrl: url }))
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                url: server.crashlogUrl,
            }}
        >
            <StartTextBox />
        </Formik>
    );
};

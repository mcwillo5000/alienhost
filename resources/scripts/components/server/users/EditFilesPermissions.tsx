import React, { useContext, useEffect } from 'react';
import { Subuser } from '@/state/server/subusers';
import { Form, Formik, Field } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import asModal from '@/hoc/asModal';
import ModalContext from '@/context/ModalContext';
import setUserDenyFiles from '@/api/server/users/setUserDenyFiles';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import { Textarea } from '@/components/elements/Input';
import FormikSwitch from '@/components/elements/FormikSwitch';

type Props = {
    subuser: Subuser;
};

interface Values {
    denyfiles: string;
    hidefiles: boolean;
}

const AdvancedMode = () => {
    return (
        <div css={tw`flex justify-between`}>
            <FormikFieldWrapper
                name={'denyfiles'}
                label={'Blocking Files & Directories'}
                description={`
                            Enter the files or folders to which the user is to have no permissions. Leave blank to allow all files. Wildcard matching of files and folders is supported in addition to negating a rule by prefixing the path with an exclamation point.
                        `}
            >
                <Field as={Textarea} name={'denyfiles'} rows={6} />
            </FormikFieldWrapper>
        </div>
    );
};

const EditFilesPermissions = ({ subuser }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSubuser = ServerContext.useStoreActions((actions) => actions.subusers.appendSubuser);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );
    const { dismiss, setPropOverrides } = useContext(ModalContext);

    const submit = (values: Values) => {
        setPropOverrides({ showSpinnerOverlay: true });
        clearFlashes('user:filespermissions');

        setUserDenyFiles(uuid, { denyfiles: values.denyfiles?.split('\n') || '', hidefiles: values.hidefiles }, subuser)
            .then((subuser) => {
                appendSubuser(subuser);
                dismiss();
            })
            .catch((error) => {
                console.error(error);
                setPropOverrides(null);
                clearAndAddHttpError({ key: 'user:filespermissions', error });
            });
    };

    useEffect(
        () => () => {
            clearFlashes('user:filespermissions');
        },
        []
    );

    return (
        <Formik
            onSubmit={submit}
            initialValues={
                {
                    denyfiles: subuser?.denyList?.join('\n') || '',
                    hidefiles: subuser?.hideFiles || false,
                } as Values
            }
        >
            <Form>
                <div css={tw`flex justify-between`}>
                    <h2 css={tw`text-2xl`}>Edit user file permissions</h2>
                </div>
                <FlashMessageRender byKey={'user:filespermissions'} css={tw`mt-4`} />
                <div css={tw`mt-6`}>
                    <AdvancedMode />
                    <div css={tw`mt-6 mb-1 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded`}>
                        <FormikSwitch
                            name={'hidefiles'}
                            description={'Do you want to hide locked files from the user?'}
                            label={'Hide files'}
                        />
                    </div>
                </div>
                <Can action={'*'}>
                    <div css={tw`pb-6 flex justify-end`}>
                        <Button type={'submit'} css={tw`w-full sm: w-auto`}>
                            Save
                        </Button>
                    </div>
                </Can>
            </Form>
        </Formik>
    );
};

export default asModal<Props>({
    top: false,
})(EditFilesPermissions);

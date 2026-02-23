import React from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Field as FormikField, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import renameServer from '@/api/server/renameServer';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import FuturisticFormButton from '@/components/elements/rivion/FuturisticFormButton';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import { Textarea } from '@/components/elements/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface Values {
    name: string;
    description: string;
}

const RenameServerBox = () => {
    const { t } = useTranslation();
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <TitledGreyBox title={t('settings.rename.title')} css={tw`relative`}>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0`}>
                <Field id={'name'} name={'name'} label={t('settings.rename.serverName')} type={'text'} />
                <div css={tw`mt-6`}>
                    <Label>{t('settings.rename.serverDescription')}</Label>
                    <FormikFieldWrapper name={'description'}>
                        <FormikField as={Textarea} name={'description'} rows={3} />
                    </FormikFieldWrapper>
                </div>
                <div css={tw`mt-4 text-right`}>
                    <FuturisticFormButton 
                        type={'submit'}
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-1" />
                        {t('settings.rename.save')}
                    </FuturisticFormButton>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('settings');
        renameServer(server.uuid, name, description)
            .then(() => setServer({ ...server, name, description }))
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
                name: server.name,
                description: server.description,
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().nullable(),
            })}
        >
            <RenameServerBox />
        </Formik>
    );
};

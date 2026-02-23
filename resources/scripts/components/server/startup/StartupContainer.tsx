import React, { useCallback, useEffect, useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import tw from 'twin.macro';
import VariableBox from '@/components/server/startup/VariableBox';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import getServerStartup from '@/api/swr/getServerStartup';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';
import Input from '@/components/elements/Input';
import setSelectedDockerImage from '@/api/server/setSelectedDockerImage';
import InputSpinner from '@/components/elements/InputSpinner';
import useFlash from '@/plugins/useFlash';
import { useTranslation } from 'react-i18next';

const StartupContainer = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const variables = ServerContext.useStoreState(
        ({ server }) => ({
            variables: server.data!.variables,
            invocation: server.data!.invocation,
            dockerImage: server.data!.dockerImage,
        }),
        isEqual
    );

    const { data, error, isValidating, mutate } = getServerStartup(uuid, {
        ...variables,
        dockerImages: { [variables.dockerImage]: variables.dockerImage },
    });

    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);
    const isCustomImage =
        data &&
        !Object.values(data.dockerImages)
            .map((v) => v.toLowerCase())
            .includes(variables.dockerImage.toLowerCase());

    useEffect(() => {

        mutate();
    }, []);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((s) => ({
            ...s,
            invocation: data.invocation,
            variables: data.variables,
        }));
    }, [data]);

    const updateSelectedDockerImage = useCallback(
        (v: React.ChangeEvent<HTMLSelectElement>) => {
            setLoading(true);
            clearFlashes('startup:image');

            const image = v.currentTarget.value;
            setSelectedDockerImage(uuid, image)
                .then(() => setServerFromState((s) => ({ ...s, dockerImage: image })))
                .catch((error) => {
                    console.error(error);
                    clearAndAddHttpError({ key: 'startup:image', error });
                })
                .then(() => setLoading(false));
        },
        [uuid]
    );

    return !data ? (
        !error || (error && isValidating) ? (
            <Spinner centered size={Spinner.Size.LARGE} />
        ) : (
            <ServerError title={t('startup.error')} message={httpErrorToHuman(error)} onRetry={() => mutate()} />
        )
    ) : (
        <ServerContentBlock title={t('startup.title')} showFlashKey={'startup:image'}>
            <div css={tw`md:flex gap-4 md:gap-6`}>
                <TitledGreyBox title={t('startup.startupCommand')} css={tw`flex-1`}>
                    <div css={tw`px-1 py-2`}>
                        <p 
                            css={tw`font-mono py-3 px-4 text-sm leading-relaxed`}
                            style={{ 
                                backgroundColor: 'var(--theme-background)',
                                color: 'var(--theme-text-base)',
                                border: '1px solid var(--theme-border)',
                                borderRadius: 0,
                                clipPath: 'polygon(0px 8px, 8px 0px, 100% 0px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0px 100%)'
                            }}
                        >
                            {data.invocation}
                        </p>
                    </div>
                </TitledGreyBox>
                <TitledGreyBox title={t('startup.dockerImage')} css={tw`flex-1 lg:flex-none lg:w-1/3 mt-4 md:mt-0`}>
                    {Object.keys(data.dockerImages).length > 1 && !isCustomImage ? (
                        <>
                            <InputSpinner visible={loading}>
                                <Select
                                    disabled={Object.keys(data.dockerImages).length < 2}
                                    onChange={updateSelectedDockerImage}
                                    defaultValue={variables.dockerImage}
                                >
                                    {Object.keys(data.dockerImages).map((key) => (
                                        <option key={data.dockerImages[key]} value={data.dockerImages[key]}>
                                            {key}
                                        </option>
                                    ))}
                                </Select>
                            </InputSpinner>
                            <p css={tw`text-xs mt-2`} style={{ color: 'var(--theme-text-muted)' }}>
                                {t('startup.dockerImageDescription')}
                            </p>
                        </>
                    ) : (
                        <>
                            <Input disabled readOnly value={variables.dockerImage} />
                            {isCustomImage && (
                                <p css={tw`text-xs mt-2`} style={{ color: 'var(--theme-text-muted)' }}>
                                    {t('startup.customDockerImage')}
                                </p>
                            )}
                        </>
                    )}
                </TitledGreyBox>
            </div>
            <h3 css={tw`mt-6 mb-4 text-xl font-semibold`} style={{ color: 'var(--theme-text-base)' }}>
                {t('startup.variables')}
            </h3>
            <div css={tw`grid gap-4 md:gap-6 md:grid-cols-2`}>
                {data.variables.map((variable) => (
                    <VariableBox key={variable.envVariable} variable={variable} />
                ))}
            </div>
        </ServerContentBlock>
    );
};

export default StartupContainer;

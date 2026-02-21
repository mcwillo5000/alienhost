import React from 'react';
import tw from 'twin.macro';
import { HytaleSettings } from '@/api/server/hytalegamesettings/getHytaleSettings';
import { ServerContext } from '@/state/server';
import getServerStartup from '@/api/swr/getServerStartup';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import VariableBox from '@/components/server/startup/VariableBox';
import isEqual from 'react-fast-compare';
interface Props {
    settings: HytaleSettings;
    updateSetting: <K extends keyof HytaleSettings>(key: K, value: HytaleSettings[K]) => void;
}
export default ({ settings, updateSetting }: Props) => {
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
    return !data ? (
        !error || (error && isValidating) ? (
            <div css={tw`flex justify-center items-center py-12`}>
                <Spinner size={Spinner.Size.LARGE} />
            </div>
        ) : (
            <ServerError title={'Oops!'} message={httpErrorToHuman(error)} onRetry={() => mutate()} />
        )
    ) : (
        <div css={tw`space-y-6`}>
            <div>
                <div css={tw`grid gap-4 md:grid-cols-2`}>
                    {data.variables.map((variable) => (
                        <VariableBox key={variable.envVariable} variable={variable} />
                    ))}
                </div>
            </div>
        </div>
    );
};

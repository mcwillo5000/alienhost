import React, { useState, useEffect } from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Form, Formik, Field as FormikField, useFormikContext } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import changeServerTimezone from '@/api/server/changeServerTimezone';
import { object, string } from 'yup';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';

interface Values {
    timezone: string;
}

const TimezoneServerBox = () => {
    const { isSubmitting } = useFormikContext<Values>();
    const [currentTime, setCurrentTime] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchTimeData = () => {
            const newCurrentTime: { [key: string]: string } = {};
            const gmtList = [
                'Pacific/Kwajalein',
                'Pacific/Pago_Pago',
                'Pacific/Honolulu',
                'America/Anchorage',
                'America/Los_Angeles',
                'America/Denver',
                'America/Chicago',
                'America/New_York',
                'America/Halifax',
                'America/Argentina/Buenos_Aires',
                'Atlantic/South_Georgia',
                'Atlantic/Azores',
                'Europe/London',
                'Europe/Berlin',
                'Europe/Athens',
                'Europe/Moscow',
                'Asia/Dubai',
                'Asia/Karachi',
                'Asia/Almaty',
                'Asia/Bangkok',
                'Asia/Shanghai',
                'Asia/Tokyo',
                'Australia/Sydney',
                'Pacific/Guadalcanal',
                'Pacific/Fiji',
            ];

            const currentTime = new Date();

            gmtList.forEach((timezone: string) => {
                const localTime = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
                const hour = localTime.getHours();
                const minute = localTime.getMinutes().toString().padStart(2, '0');
                const formattedHour = hour >= 12 ? 
                    (hour === 12 ? `${hour}:${minute} PM` : `${hour - 12}:${minute} PM`) : 
                    (hour === 0 ? `12:${minute} AM` : `${hour}:${minute} AM`);
                newCurrentTime[timezone] = formattedHour;
            });

            setCurrentTime(newCurrentTime);
        };

        fetchTimeData();

    }, []);
    
    const gmtList = [
        {
            displayName: 'Pacific/Kwajalein',
            value: 'Pacific/Kwajalein'
        },
        {
            displayName: 'Pacific/Pago_Pago',
            value: 'Pacific/Pago_Pago'
        },
        {
            displayName: 'Pacific/Honolulu',
            value: 'Pacific/Honolulu'
        },
        {
            displayName: 'America/Anchorage',
            value: 'America/Anchorage'
        },
        {
            displayName: 'America/Los_Angeles',
            value: 'America/Los_Angeles'
        },
        {
            displayName: 'America/Denver',
            value: 'America/Denver'
        },
        {
            displayName: 'America/Chicago',
            value: 'America/Chicago'
        },
        {
            displayName: 'America/New_York',
            value: 'America/New_York'
        },
        {
            displayName: 'America/Halifax',
            value: 'America/Halifax'
        },
        {
            displayName: 'America/Argentina/Buenos_Aires',
            value: 'America/Argentina/Buenos_Aires'
        },
        {
            displayName: 'Atlantic/South_Georgia',
            value: 'Atlantic/South_Georgia'
        },
        {
            displayName: 'Atlantic/Azores',
            value: 'Atlantic/Azores'
        },
        {
            displayName: 'Europe/London',
            value: 'Europe/London'
        },
        {
            displayName: 'Europe/Berlin',
            value: 'Europe/Berlin'
        },
        {
            displayName: 'Europe/Athens',
            value: 'Europe/Athens'
        },
        {
            displayName: 'Europe/Moscow',
            value: 'Europe/Moscow'
        },
        {
            displayName: 'Asia/Dubai',
            value: 'Asia/Dubai'
        },
        {
            displayName: 'Asia/Karachi',
            value: 'Asia/Karachi'
        },
        {
            displayName: 'Asia/Almaty',
            value: 'Asia/Almaty'
        },
        {
            displayName: 'Asia/Bangkok',
            value: 'Asia/Bangkok'
        },
        {
            displayName: 'Asia/Shanghai',
            value: 'Asia/Shanghai'
        },
        {
            displayName: 'Asia/Tokyo',
            value: 'Asia/Tokyo'
        },
        {
            displayName: 'Australia/Sydney',
            value: 'Australia/Sydney'
        },
        {
            displayName: 'Pacific/Guadalcanal',
            value: 'Pacific/Guadalcanal'
        },
        {
            displayName: 'Pacific/Fiji',
            value: 'Pacific/Fiji'
        },
    ];

    return (
        <TitledGreyBox title={'Change time'} css={tw`relative`}>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0`}>
                <Label>Timezone</Label>
                <FormikField name="timezone" as={Select}>
                    {gmtList.map((item, idx) => (
                        <option key={idx} value={item.value}>
                            {`${item.displayName} (${currentTime[item.value] || 'Loading...'})`}
                        </option>
                    ))}
                </FormikField>
                <div css={tw`mt-6 text-right`}>
                    <Button type="submit">Save</Button>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = async ({ timezone }: Values) => {
        try {
            clearFlashes('settings');
            await changeServerTimezone(server.uuid, timezone);
            setServer({ ...server, timezone });
        } catch (error) {
            console.error(error);
            addError({ key: 'settings', message: httpErrorToHuman(error) });
        }
    };
    
    return (
        <Formik
            initialValues={{ timezone: server.timezone }}
            validationSchema={object().shape({
                timezone: string().required().min(1),
            })}
            onSubmit={submit}
        >
            <TimezoneServerBox />
        </Formik>
    );
};
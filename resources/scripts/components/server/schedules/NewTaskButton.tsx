import React, { useState } from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import TaskDetailsModal from '@/components/server/schedules/TaskDetailsModal';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import { useTranslation } from 'react-i18next';

interface Props {
    schedule: Schedule;
}

export default ({ schedule }: Props) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    return (
        <>
            <TaskDetailsModal schedule={schedule} visible={visible} onModalDismissed={() => setVisible(false)} />
            <Button 
                onClick={() => setVisible(true)} 
                className={'flex-1'}
                size={Options.Size.Compact}
                variant={Options.Variant.Primary}
            >
                {t('schedules.newTask')}
            </Button>
        </>
    );
};

import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

interface Props {
    cron: Schedule['cron'];
    className?: string;
}

const CronValue = styled.p`
    font-family: 'Orbitron', sans-serif;
    font-weight: 500;
    color: var(--theme-text-base);
`;

const CronLabel = styled.p`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.625rem;
    text-transform: uppercase;
    color: var(--theme-text-muted);
`;

const ScheduleCronRow = ({ cron, className }: Props) => {
    const { t } = useTranslation();
    
    return (
        <div className={classNames('flex', className)}>
            <div className={'w-1/5 sm:w-auto text-center'}>
                <CronValue>{cron.minute}</CronValue>
                <CronLabel>{t('schedules.edit.minute')}</CronLabel>
            </div>
            <div className={'w-1/5 sm:w-auto text-center ml-4'}>
                <CronValue>{cron.hour}</CronValue>
                <CronLabel>{t('schedules.edit.hour')}</CronLabel>
            </div>
            <div className={'w-1/5 sm:w-auto text-center ml-4'}>
                <CronValue>{cron.dayOfMonth}</CronValue>
                <CronLabel>{t('schedules.edit.dayOfMonth')}</CronLabel>
            </div>
            <div className={'w-1/5 sm:w-auto text-center ml-4'}>
                <CronValue>{cron.month}</CronValue>
                <CronLabel>{t('schedules.edit.month')}</CronLabel>
            </div>
            <div className={'w-1/5 sm:w-auto text-center ml-4'}>
                <CronValue>{cron.dayOfWeek}</CronValue>
                <CronLabel>{t('schedules.edit.dayOfWeek')}</CronLabel>
            </div>
        </div>
    );
};

export default ScheduleCronRow;

import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';
import { useTranslation } from 'react-i18next';

const ScheduleIconContainer = styled.div`
    height: 2.5rem;
    width: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(var(--theme-primary-rgb), 0.1);
    clip-path: polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%);
    position: relative;
    box-shadow: 0 0 6px rgba(var(--theme-primary-rgb), 0.3);
    
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid rgba(var(--theme-primary-rgb), 0.4);
        clip-path: polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%);
        pointer-events: none;
    }
`;

const ScheduleIcon = styled(FontAwesomeIcon)`
    font-size: 1rem;
    color: var(--theme-primary);
    filter: drop-shadow(0 0 3px rgba(var(--theme-primary-rgb), 0.5));
`;

const ScheduleName = styled.p`
    font-family: 'Orbitron', sans-serif;
    font-weight: 500;
    color: var(--theme-text-base);
`;

const ScheduleLastRun = styled.p`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.75rem;
    color: var(--theme-text-muted);
`;

const StatusBadge = styled.p<{ $active: boolean }>`
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 500;
    font-family: 'Electrolize', sans-serif;
    color: white;
    background-color: ${props => props.$active ? '#22c55e' : '#6b7280'};
    clip-path: polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%);
    box-shadow: ${props => props.$active 
        ? '0 0 8px rgba(34, 197, 94, 0.4)' 
        : '0 0 8px rgba(107, 114, 128, 0.3)'};
`;

export default ({ schedule }: { schedule: Schedule }) => {
    const { t } = useTranslation();
    
    return (
        <>
            <ScheduleIconContainer css={tw`hidden md:flex`}>
                <ScheduleIcon icon={faCalendarAlt} />
            </ScheduleIconContainer>
            <div css={tw`flex-1 md:ml-4`}>
                <ScheduleName>{schedule.name}</ScheduleName>
                <ScheduleLastRun>
                    {t('schedules.lastRunAt')} {schedule.lastRunAt ? format(schedule.lastRunAt, "MMM do 'at' h:mma") : t('schedules.never')}
                </ScheduleLastRun>
            </div>
            <div css={tw`sm:hidden`}>
                <StatusBadge $active={schedule.isActive}>
                    {schedule.isActive ? t('schedules.active') : t('schedules.inactive')}
                </StatusBadge>
            </div>
            <ScheduleCronRow cron={schedule.cron} css={tw`mx-auto sm:mx-8 w-full sm:w-auto mt-4 sm:mt-0`} />
            <div css={tw`hidden sm:block`}>
                <StatusBadge $active={schedule.isActive && !schedule.isProcessing}>
                    {schedule.isProcessing ? t('schedules.processing') : schedule.isActive ? t('schedules.active') : t('schedules.inactive')}
                </StatusBadge>
            </div>
        </>
    );
};

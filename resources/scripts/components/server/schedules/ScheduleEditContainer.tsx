import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import getServerSchedule from '@/api/server/schedules/getServerSchedule';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import NewTaskButton from '@/components/server/schedules/NewTaskButton';
import DeleteScheduleButton from '@/components/server/schedules/DeleteScheduleButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Button } from '@/components/elements/button/index';
import { Options } from '@/components/elements/button/types';
import ScheduleTaskRow from '@/components/server/schedules/ScheduleTaskRow';
import isEqual from 'react-fast-compare';
import { format } from 'date-fns';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';
import RunScheduleButton from '@/components/server/schedules/RunScheduleButton';
import { useTranslation } from 'react-i18next';

const FrameContainer = styled.div`
    position: relative;
    width: 100%;
`;

const FrameSVG = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
`;

const FrameContent = styled.div`
    position: relative;
    z-index: 1;
`;

const ArwesFrame: React.FC<{ 
    children: React.ReactNode; 
    className?: string;
    cornerSize?: number;
}> = ({ children, className, cornerSize = 12 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 200, height: 100 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.floor(width) || 200,
                    height: Math.floor(height) || 100
                });
            }
        };

        updateDimensions();
        const timeoutId = setTimeout(updateDimensions, 50);

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timeoutId);
        };
    }, [children]);

    const { width, height } = dimensions;
    const strokeWidth = 1;
    const so = strokeWidth / 2;

    const framePath = `
        M ${so},${so + cornerSize}
        L ${so + cornerSize},${so}
        L ${width - so},${so}
        L ${width - so},${height - so - cornerSize}
        L ${width - so - cornerSize},${height - so}
        L ${so},${height - so}
        Z
    `;

    return (
        <FrameContainer ref={containerRef} className={className}>
            <FrameSVG 
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <path
                    data-name="bg"
                    d={framePath}
                    fill="var(--theme-background-secondary)"
                    stroke="none"
                />
                <path
                    data-name="line"
                    d={framePath}
                    fill="none"
                    stroke="var(--theme-border)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                    style={{ filter: 'drop-shadow(0 0 2px var(--theme-border))' }}
                />
            </FrameSVG>
            <FrameContent>
                {children}
            </FrameContent>
        </FrameContainer>
    );
};

interface Params {
    id: string;
}

const CronBox = styled.div`
    padding: 0.75rem;
    background-color: var(--theme-background);
    border: 1px solid var(--theme-border);
    clip-path: polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%);
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid var(--theme-border);
        clip-path: polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%);
        pointer-events: none;
    }
`;

const CronTitle = styled.p`
    font-size: 0.75rem;
    font-family: 'Electrolize', sans-serif;
    text-transform: uppercase;
    color: var(--theme-text-muted);
    margin-bottom: 0.25rem;
`;

const CronValue = styled.p`
    font-size: 1.25rem;
    font-weight: 500;
    font-family: 'Orbitron', sans-serif;
    color: var(--theme-text-base);
`;

const CronBoxComponent = ({ title, value }: { title: string; value: string }) => (
    <CronBox>
        <CronTitle>{title}</CronTitle>
        <CronValue>{value}</CronValue>
    </CronBox>
);

const StatusBadge = styled.span<{ $active: boolean }>`
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 500;
    font-family: 'Electrolize', sans-serif;
    color: white;
    margin-left: 1rem;
    background-color: ${props => props.$active ? '#22c55e' : '#6b7280'};
    clip-path: polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%);
    box-shadow: ${props => props.$active 
        ? '0 0 8px rgba(34, 197, 94, 0.4)' 
        : '0 0 8px rgba(107, 114, 128, 0.3)'};
`;

const ScheduleTitle = styled.h3`
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-family: 'Orbitron', sans-serif;
    color: var(--theme-text-base);
`;

const ScheduleInfo = styled.p`
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-family: 'Electrolize', sans-serif;
    color: var(--theme-text-base);
`;

export default () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { id: scheduleId } = useParams<Params>();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const schedule = ServerContext.useStoreState(
        (st) => st.schedules.data.find((s) => s.id === Number(scheduleId)),
        isEqual
    );
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);

    useEffect(() => {
        if (schedule?.id === Number(scheduleId)) {
            setIsLoading(false);
            return;
        }

        clearFlashes('schedules');
        getServerSchedule(uuid, Number(scheduleId))
            .then((schedule) => appendSchedule(schedule))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error, key: 'schedules' });
            })
            .then(() => setIsLoading(false));
    }, [scheduleId]);

    const toggleEditModal = useCallback(() => {
        setShowEditModal((s) => !s);
    }, []);

    return (
        <PageContentBlock title={t('schedules.title')}>
            <FlashMessageRender byKey={'schedules'} css={tw`mb-4`} />
            {!schedule || isLoading ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    <ScheduleCronRow 
                        cron={schedule.cron} 
                        css={tw`sm:hidden mb-4 p-3`}
                        style={{ 
                            backgroundColor: 'var(--theme-background-secondary)',
                            clipPath: 'polygon(0px 10px, 10px 0px, 100% 0px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0px 100%)'
                        }}
                    />
                    <ArwesFrame>
                        <div
                            css={tw`sm:flex items-center p-4 sm:p-6`}
                            style={{ 
                                borderBottom: '1px solid var(--theme-border)'
                            }}
                        >
                            <div css={tw`flex-1`}>
                                <ScheduleTitle>
                                    {schedule.name}
                                    {schedule.isProcessing ? (
                                        <StatusBadge $active={false}>
                                            <Spinner css={tw`w-3! h-3! mr-2`} />
                                            {t('schedules.processing')}
                                        </StatusBadge>
                                    ) : (
                                        <StatusBadge $active={schedule.isActive}>
                                            {schedule.isActive ? t('schedules.active') : t('schedules.inactive')}
                                        </StatusBadge>
                                    )}
                                </ScheduleTitle>
                                <ScheduleInfo>
                                    {t('schedules.lastRunAt')}&nbsp;
                                    {schedule.lastRunAt ? (
                                        format(schedule.lastRunAt, "MMM do 'at' h:mma")
                                    ) : (
                                        <span style={{ color: 'var(--theme-text-muted)' }}>n/a</span>
                                    )}
                                    <span 
                                        css={tw`ml-4 pl-4 border-l py-px`}
                                        style={{ borderLeftColor: 'var(--theme-border)' }}
                                    >
                                        Next run at:&nbsp;
                                        {schedule.nextRunAt ? (
                                            format(schedule.nextRunAt, "MMM do 'at' h:mma")
                                        ) : (
                                            <span style={{ color: 'var(--theme-text-muted)' }}>n/a</span>
                                        )}
                                    </span>
                                </ScheduleInfo>
                            </div>
                            <div css={tw`flex sm:block mt-3 sm:mt-0`}>
                                <Can action={'schedule.update'}>
                                    <Button.Text 
                                        className={'flex-1 mr-4'} 
                                        onClick={toggleEditModal}
                                        size={Options.Size.Compact}
                                    >
                                        Edit
                                    </Button.Text>
                                    <NewTaskButton schedule={schedule} />
                                </Can>
                            </div>
                        </div>
                        
                        <div css={tw`hidden sm:grid grid-cols-5 gap-3 p-4`}>
                            <CronBoxComponent title={t('schedules.edit.minute')} value={schedule.cron.minute} />
                            <CronBoxComponent title={t('schedules.edit.hour')} value={schedule.cron.hour} />
                            <CronBoxComponent title={t('schedules.edit.dayOfMonth')} value={schedule.cron.dayOfMonth} />
                            <CronBoxComponent title={t('schedules.edit.month')} value={schedule.cron.month} />
                            <CronBoxComponent title={t('schedules.edit.dayOfWeek')} value={schedule.cron.dayOfWeek} />
                        </div>
                        
                        <div>
                            {schedule.tasks.length > 0
                                ? schedule.tasks
                                      .sort((a, b) =>
                                          a.sequenceId === b.sequenceId ? 0 : a.sequenceId > b.sequenceId ? 1 : -1
                                      )
                                      .map((task) => (
                                          <ScheduleTaskRow
                                              key={`${schedule.id}_${task.id}`}
                                              task={task}
                                              schedule={schedule}
                                          />
                                      ))
                                : null}
                        </div>
                    </ArwesFrame>
                    <EditScheduleModal visible={showEditModal} schedule={schedule} onModalDismissed={toggleEditModal} />
                    <div css={tw`mt-6 flex sm:justify-end`}>
                        <Can action={'schedule.delete'}>
                            <DeleteScheduleButton
                                scheduleId={schedule.id}
                                onDeleted={() => history.push(`/server/${id}/schedules`)}
                            />
                        </Can>
                        {schedule.tasks.length > 0 && (
                            <Can action={'schedule.update'}>
                                <RunScheduleButton schedule={schedule} />
                            </Can>
                        )}
                    </div>
                </>
            )}
        </PageContentBlock>
    );
};

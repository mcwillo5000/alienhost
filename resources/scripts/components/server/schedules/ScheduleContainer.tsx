import React, { useEffect, useState, useRef } from 'react';
import getServerSchedules from '@/api/server/schedules/getServerSchedules';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import { useHistory, useRouteMatch } from 'react-router-dom';
import FlashMessageRender from '@/components/FlashMessageRender';
import ScheduleRow from '@/components/server/schedules/ScheduleRow';
import { httpErrorToHuman } from '@/api/http';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import FuturisticFormButton from '@/components/elements/rivion/FuturisticFormButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useTranslation } from 'react-i18next';
import TemplateModal from '@/components/server/schedules/ScheduleTemplateModal';

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
    padding: 1.5rem;
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

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
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

export default () => {
    const { t } = useTranslation();
    const match = useRouteMatch();
    const history = useHistory();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlash();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [templateVisible, setTemplateVisible] = useState(false);

    const schedules = ServerContext.useStoreState((state) => state.schedules.data);
    const setSchedules = ServerContext.useStoreActions((actions) => actions.schedules.setSchedules);

    const refreshSchedules = async () => {
        clearFlashes('schedules');
        try {
            const schedules = await getServerSchedules(uuid);
            setSchedules(schedules);
        } catch (error) {
            addError({ message: httpErrorToHuman(error), key: 'schedules' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSchedules();
    }, []);

    return (
        <ServerContentBlock title={t('schedules.title')}>
            <FlashMessageRender byKey={'schedules'} css={tw`mb-4`} />
            {!schedules.length && loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    {schedules.length === 0 ? (
                        <ArwesFrame>
                            <p css={tw`text-sm text-center`} style={{ color: 'var(--theme-text-muted)' }}>
                                {t('schedules.noSchedules')}
                            </p>
                        </ArwesFrame>
                    ) : (
                        schedules.map((schedule) => (
                            <GreyRowBox
                                as={'a'}
                                key={schedule.id}
                                href={`${match.url}/${schedule.id}`}
                                onClick={(e: any) => {
                                    e.preventDefault();
                                    history.push(`${match.url}/${schedule.id}`);
                                }}
                            >
                                <ScheduleRow schedule={schedule} />
                            </GreyRowBox>
                        ))
                    )}
                    <Can action={'schedule.create'}>
                        <div css={tw`mt-8 flex justify-end`}>
                            <EditScheduleModal visible={visible} onModalDismissed={() => setVisible(false)} />
                            <TemplateModal
                                visible={templateVisible}
                                onClose={() => setTemplateVisible(false)}
                                uuid={uuid}
                                openManualModal={() => setVisible(true)}
                                refreshSchedules={refreshSchedules}
                            />
                            <FuturisticFormButton 
                                type={'button'} 
                                onClick={() => setTemplateVisible(true)}
                                css={tw`mr-4`}
                            >
                                Templates
                            </FuturisticFormButton>
                            <FuturisticFormButton 
                                type={'button'} 
                                onClick={() => setVisible(true)}
                            >
                                {t('schedules.createSchedule')}
                            </FuturisticFormButton>
                        </div>
                    </Can>
                </>
            )}
        </ServerContentBlock>
    );
};

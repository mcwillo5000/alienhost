import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Translate from '@/components/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/user';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import { FolderOpenIcon, TerminalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import style from './style.module.css';
import Avatar from '@/components/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';
import GreyRowBox from '@/components/elements/GreyRowBox';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

const AvatarContainer = styled.div`
    width: 2.5rem;
    height: 2.5rem;
    overflow: hidden;
    clip-path: polygon(0px 5px, 5px 0px, 100% 0px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0px 100%);
    flex-shrink: 0;
    background: color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background-secondary));
`;

const EventLink = styled(Link)`
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    color: var(--theme-primary);
    text-decoration: none;
    transition: all 0.15s ease;
    
    &:hover {
        color: color-mix(in srgb, var(--theme-primary) 80%, white);
        text-shadow: 0 0 4px rgba(var(--theme-primary-rgb), 0.5);
    }
`;

const Username = styled.span`
    font-family: 'Electrolize', sans-serif;
    font-weight: 500;
    color: var(--theme-text-base);
`;

const MetaText = styled.span`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.75rem;
    color: var(--theme-text-muted);
`;

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);

    return (
        <GreyRowBox $hoverable={false} css={tw`flex items-start`}>
            {/* Avatar */}
            <AvatarContainer css={tw`hidden sm:flex items-center justify-center mr-4`}>
                <Avatar name={actor?.uuid || 'system'} />
            </AvatarContainer>
            
            {/* Content */}
            <div css={tw`flex-1 min-w-0`}>
                <div css={tw`flex items-center flex-wrap gap-1`}>
                    <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                        <Username>{actor?.username || 'System'}</Username>
                    </Tooltip>
                    <span style={{ color: 'var(--theme-text-muted)' }}>&mdash;</span>
                    <EventLink to={`#${pathTo({ event: activity.event })}`}>
                        {activity.event}
                    </EventLink>
                    <div className={classNames(style.icons)}>
                        {activity.isApi && (
                            <Tooltip placement={'top'} content={'Using API Key'}>
                                <TerminalIcon />
                            </Tooltip>
                        )}
                        {activity.event.startsWith('server:sftp.') && (
                            <Tooltip placement={'top'} content={'Using SFTP'}>
                                <FolderOpenIcon />
                            </Tooltip>
                        )}
                        {children}
                    </div>
                </div>
                <p className={style.description}>
                    <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                </p>
                <div css={tw`mt-1 flex items-center gap-1`}>
                    {activity.ip && (
                        <MetaText>
                            {activity.ip}
                            <span style={{ color: 'var(--theme-text-muted)' }}>&nbsp;|&nbsp;</span>
                        </MetaText>
                    )}
                    <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                        <MetaText>{formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}</MetaText>
                    </Tooltip>
                </div>
            </div>
            
            {/* Meta Button */}
            {activity.hasAdditionalMetadata && <ActivityLogMetaButton meta={activity.properties} />}
        </GreyRowBox>
    );
};

import React from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import CrashLogURLBox from '@/components/server/settings/CrashLogURLBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import TimezoneServerBox from '@/components/server/settings/TimezoneServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import FuturisticFormButton from '@/components/elements/rivion/FuturisticFormButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation();
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={t('settings.title')}>
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <div css={tw`md:flex`}>
                <div css={tw`w-full md:flex-1 md:mr-10`}>
                    <Can action={'file.sftp'}>
                        <TitledGreyBox title={t('settings.sftp.title')} css={tw`mb-4 md:mb-6`}>
                            <div css={tw`space-y-4`}>
                                <div>
                                    <Label>{t('settings.sftp.serverAddress')}</Label>
                                    <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                        <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                                    </CopyOnClick>
                                </div>
                                <div>
                                    <Label>{t('settings.sftp.username')}</Label>
                                    <CopyOnClick text={`${username}.${id}`}>
                                        <Input type={'text'} value={`${username}.${id}`} readOnly />
                                    </CopyOnClick>
                                </div>
                                <div css={tw`flex items-center gap-4`}>
                                    <div css={tw`flex-1`}>
                                        <div 
                                            css={tw`p-2 rounded text-xs`}
                                            style={{
                                                borderLeft: '3px solid var(--theme-primary)',
                                                background: 'color-mix(in srgb, var(--theme-primary) 5%, var(--theme-background-secondary))',
                                                border: '1px solid var(--theme-border)'
                                            }}
                                        >
                                            <p style={{ color: 'var(--theme-text-muted)' }}>
                                                {t('settings.sftp.passwordNotice')}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}>
                                            <FuturisticFormButton>
                                                <FontAwesomeIcon icon={faFileDownload} className="mr-1" />
                                                {t('settings.sftp.launchSftp')}
                                            </FuturisticFormButton>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </TitledGreyBox>
                    </Can>
                    <TitledGreyBox title={t('settings.debug.title')} css={tw`mb-4 md:mb-6`}>
                        <div css={tw`space-y-3`}>
                            <div css={tw`flex items-center justify-between text-sm`}>
                                <p style={{ color: 'var(--theme-text-base)' }}>{t('settings.debug.node')}</p>
                                <code 
                                    css={tw`font-mono rounded px-2 py-1 text-xs`}
                                    style={{
                                        background: 'var(--theme-background-secondary)',
                                        color: 'var(--theme-text-base)',
                                        border: '1px solid var(--theme-border)'
                                    }}
                                >
                                    {node}
                                </code>
                            </div>
                            <div css={tw`flex items-center justify-between text-sm`}>
                                    <p style={{ color: 'var(--theme-text-base)' }}>{t('settings.debug.serverId')}</p>
                                    <CopyOnClick text={uuid}>
                                        <code 
                                            css={tw`font-mono rounded px-2 py-1 text-xs`}
                                            style={{
                                                background: 'var(--theme-background-secondary)',
                                                color: 'var(--theme-text-base)',
                                                border: '1px solid var(--theme-border)'
                                            }}
                                        >
                                            {uuid}
                                        </code>
                                    </CopyOnClick>
                                </div>
                        </div>
                    </TitledGreyBox>
                    <Can action={'settings.update'}>
                        <div css={tw`mb-4 md:mb-6`}>
                            <TimezoneServerBox />
                        </div>
                    </Can>
                </div>
                <div css={tw`w-full mt-6 md:flex-1 md:mt-0`}>
                    <Can action={'settings.rename'}>
                        <div css={tw`mb-6 md:mb-10`}>
                            <RenameServerBox />
                        </div>
                    </Can>
                    <Can action={'startup.update'}>
                        <div css={tw`mb-6 md:mb-10`}>
                            <CrashLogURLBox />
                        </div>
                    </Can>
                    <Can action={'settings.reinstall'}>
                        <ReinstallServerBox />
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
};

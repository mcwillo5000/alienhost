import React from 'react';
import tw from 'twin.macro';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation();
    
    return (
        <>
        <div 
            css={tw`md:w-1/2 h-full`}
            style={{ backgroundColor: 'var(--theme-background-secondary)' }}
        >
            <div css={tw`flex flex-col`}>
                <h2 
                    css={tw`py-4 px-6 font-bold`}
                    style={{ color: 'var(--theme-text-base)' }}
                >
                    {t('schedules.cheatsheet.examples')}
                </h2>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>*/5 * * * *</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.everyFiveMinutes')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>0 */1 * * *</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.everyHour')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>0 8-12 * * *</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.hourRange')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>0 0 * * *</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.onceADay')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>0 0 * * MON</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.everyMonday')}</div>
                </div>
            </div>
        </div>
        <div 
            css={tw`md:w-1/2 h-full`}
            style={{ backgroundColor: 'var(--theme-background-secondary)' }}
        >
            <div css={tw`flex flex-col`}>
                <h2 
                    css={tw`py-4 px-6 font-bold`}
                    style={{ color: 'var(--theme-text-base)' }}
                >
                    {t('schedules.cheatsheet.specialCharacters')}
                </h2>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>*</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.anyValue')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>,</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.valueListSeparator')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>-</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.rangeValues')}</div>
                </div>
                <div css={tw`flex py-4 px-6`}>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-base)' }}>/</div>
                    <div css={tw`w-1/2`} style={{ color: 'var(--theme-text-muted)' }}>{t('schedules.cheatsheet.stepValues')}</div>
                </div>
            </div>
        </div>
        </>
    );
};

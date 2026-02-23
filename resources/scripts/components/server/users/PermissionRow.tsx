import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Checkbox from '@/components/elements/Checkbox';
import React from 'react';
import { useStoreState } from 'easy-peasy';
import Label from '@/components/elements/Label';
import { useTranslation } from 'react-i18next';

const Container = styled.label`
    ${tw`flex items-center border border-transparent rounded md:p-2 transition-colors duration-75`};
    text-transform: none;

    &:not(.disabled) {
        ${tw`cursor-pointer`};

        &:hover {
            background: rgba(59, 130, 246, 0.08) !important; /* Fallback for blue primary */
            background: color-mix(in srgb, var(--theme-primary) 8%, transparent) !important;
            border-color: var(--theme-border) !important;
        }
    }

    &:not(:first-of-type) {
        ${tw`mt-4 sm:mt-2`};
    }

    &.disabled {
        ${tw`opacity-50`};

        & input[type='checkbox']:not(:checked) {
            ${tw`border-0`};
        }
    }
`;

interface Props {
    permission: string;
    disabled: boolean;
}

const PermissionRow = ({ permission, disabled }: Props) => {
    const { t } = useTranslation();
    const [key, pkey] = permission.split('.', 2);
    const permissions = useStoreState((state) => state.permissions.data);

    return (
        <Container htmlFor={`permission_${permission}`} className={disabled ? 'disabled' : undefined}>
            <div css={tw`p-2`}>
                <Checkbox
                    id={`permission_${permission}`}
                    name={'permissions'}
                    value={permission}
                    css={tw`w-5 h-5 mr-2`}
                    disabled={disabled}
                />
            </div>
            <div css={tw`flex-1`}>
                <Label as={'p'} css={tw`font-medium`}>
                    {pkey}
                </Label>
                {permissions[key].keys[pkey].length > 0 && (
                    <p css={tw`text-xs mt-1`} style={{ color: 'var(--theme-text-muted)' }}>
                        {t(`users.permissions.${key}.${pkey}`, permissions[key].keys[pkey])}
                    </p>
                )}
            </div>
        </Container>
    );
};

export default PermissionRow;

import React, { useState } from 'react';
import { Subuser } from '@/state/server/subusers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faUnlockAlt, faUserLock } from '@fortawesome/free-solid-svg-icons';
import RemoveSubuserButton from '@/components/server/users/RemoveSubuserButton';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import Can from '@/components/elements/Can';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { useTranslation } from 'react-i18next';

const AvatarContainer = styled.div`
    width: 2.75rem;
    height: 2.75rem;
    overflow: hidden;
    clip-path: polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%);
    position: relative;
    box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.3);
    
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid var(--theme-border);
        clip-path: polygon(0px 6px, 6px 0px, 100% 0px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0px 100%);
        pointer-events: none;
        z-index: 1;
    }
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const UserEmail = styled.p`
    font-family: 'Orbitron', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--theme-text-base);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const StatLabel = styled.p`
    font-family: 'Electrolize', sans-serif;
    font-size: 0.625rem;
    text-transform: uppercase;
    color: var(--theme-text-muted);
`;

const StatValue = styled.p`
    font-family: 'Orbitron', sans-serif;
    font-weight: 500;
    text-align: center;
    color: var(--theme-text-base);
`;

const TwoFactorBadge = styled.div<{ $enabled: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background-color: ${props => props.$enabled 
        ? 'rgba(34, 197, 94, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)'};
    clip-path: polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%);
    
    svg {
        color: ${props => props.$enabled ? '#22c55e' : '#ef4444'};
        filter: drop-shadow(0 0 3px ${props => props.$enabled 
            ? 'rgba(34, 197, 94, 0.5)' 
            : 'rgba(239, 68, 68, 0.5)'});
    }
`;

const PermissionsBadge = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.25rem 0.75rem;
    background-color: rgba(var(--theme-primary-rgb), 0.1);
    clip-path: polygon(0px 4px, 4px 0px, 100% 0px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0px 100%);
`;

const ActionButton = styled.button`
    display: block;
    font-size: 0.875rem;
    padding: 0.5rem;
    transition: all 0.15s ease;
    color: var(--theme-text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    
    &:hover {
        color: var(--theme-primary);
        filter: drop-shadow(0 0 4px rgba(var(--theme-primary-rgb), 0.5));
    }
    
    &:focus {
        outline: none;
    }
`;

interface Props {
    subuser: Subuser;
}

export default ({ subuser }: Props) => {
    const { t } = useTranslation();
    const uuid = useStoreState((state) => state.user!.data!.uuid);
    const [visible, setVisible] = useState(false);

    return (
        <GreyRowBox>
            <EditSubuserModal subuser={subuser} visible={visible} onModalDismissed={() => setVisible(false)} />
            
            <AvatarContainer css={tw`hidden md:block`}>
                <img src={`${subuser.image}?s=400`} alt={subuser.email} />
            </AvatarContainer>
            
            <div css={tw`ml-4 flex-1 overflow-hidden`}>
                <UserEmail>{subuser.email}</UserEmail>
            </div>
            
            <div css={tw`ml-4`}>
                <TwoFactorBadge $enabled={subuser.twoFactorEnabled}>
                    <FontAwesomeIcon
                        icon={subuser.twoFactorEnabled ? faUserLock : faUnlockAlt}
                        fixedWidth
                    />
                    <StatLabel css={tw`hidden md:block mt-1`}>{t('users.twoFactorEnabled')}</StatLabel>
                </TwoFactorBadge>
            </div>
            
            <div css={tw`ml-4 hidden md:block`}>
                <PermissionsBadge>
                    <StatValue>
                        {subuser.permissions.filter((permission) => permission !== 'websocket.connect').length}
                    </StatValue>
                    <StatLabel>{t('users.permissionsLabel')}</StatLabel>
                </PermissionsBadge>
            </div>
            
            {subuser.uuid !== uuid && (
                <>
                    <Can action={'user.update'}>
                        <ActionButton
                            type={'button'}
                            aria-label={'Edit subuser'}
                            css={tw`mx-2 md:mx-4`}
                            onClick={() => setVisible(true)}
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </ActionButton>
                    </Can>
                    <Can action={'user.delete'}>
                        <RemoveSubuserButton subuser={subuser} />
                    </Can>
                </>
            )}
        </GreyRowBox>
    );
};

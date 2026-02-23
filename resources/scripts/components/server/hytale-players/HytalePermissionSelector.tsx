import React, { useState, useMemo } from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import {
    getPermissionsByCategory,
    formatCategoryName,
    getPermissionCommand,
} from '@/api/server/hytale-players/HytalePermissions';
import Switch from '@/components/elements/Switch';
const Container = styled.div`
    background-color: var(--theme-background-secondary);
    border-radius: 0.375rem;
    border: 1px solid var(--theme-border);
    max-height: 400px;
    overflow-y: auto;
`;
const CategoryHeader = styled.div<{ isExpanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    cursor: pointer;
    transition: background-color 0.15s;
    background-color: ${(props) => props.isExpanded ? 'rgba(var(--theme-primary-rgb), 0.08)' : 'transparent'};
    &:hover {
        background-color: rgba(var(--theme-primary-rgb), ${(props) => props.isExpanded ? '0.12' : '0.05'});
    }
`;
const PermissionItem = styled.label`
    display: flex;
    align-items: center;
    padding: 0.5rem 0.5rem 0.5rem 2rem;
    cursor: pointer;
    transition: background-color 0.15s;
    border-top: 1px solid var(--theme-border);
    &:hover {
        background-color: rgba(var(--theme-primary-rgb), 0.05);
    }
    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
const FilterBar = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--theme-border);
    position: sticky;
    top: 0;
    background-color: var(--theme-background-secondary);
    z-index: 10;
`;
interface Props {
    selectedPermissions: string[];
    onChange: (permissions: string[]) => void;
    disabled?: boolean;
    grantAllPermission?: boolean;
    onGrantAllChange?: (value: boolean) => void;
}
const HytalePermissionSelector: React.FC<Props> = ({
    selectedPermissions,
    onChange,
    disabled = false,
    grantAllPermission = false,
    onGrantAllChange,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const permissionsByCategory = useMemo(() => getPermissionsByCategory(), []);
    const categories = useMemo(() => Object.keys(permissionsByCategory).sort(), [permissionsByCategory]);
    const filteredPermissions = useMemo(() => {
        const result: Record<string, string[]> = {};
        const query = searchQuery.toLowerCase();
        Object.entries(permissionsByCategory).forEach(([category, perms]) => {
            if (selectedCategory && category !== selectedCategory) return;
            const filtered = perms.filter((perm) =>
                perm.toLowerCase().includes(query)
            );
            if (filtered.length > 0) {
                result[category] = filtered;
            }
        });
        return result;
    }, [permissionsByCategory, searchQuery, selectedCategory]);
    const toggleCategory = (category: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };
    const togglePermission = (permission: string) => {
        if (disabled) return;
        const newPermissions = selectedPermissions.includes(permission)
            ? selectedPermissions.filter((p) => p !== permission)
            : [...selectedPermissions, permission];
        onChange(newPermissions);
    };
    const toggleCategoryPermissions = (category: string, categoryPermissions: string[]) => {
        if (disabled) return;
        const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p));
        if (allSelected) {
            onChange(selectedPermissions.filter((p) => !categoryPermissions.includes(p)));
        } else {
            const newPermissions = [...selectedPermissions];
            categoryPermissions.forEach((p) => {
                if (!newPermissions.includes(p)) {
                    newPermissions.push(p);
                }
            });
            onChange(newPermissions);
        }
    };
    const isCategoryFullySelected = (categoryPermissions: string[]): boolean => {
        return categoryPermissions.every((p) => selectedPermissions.includes(p));
    };
    const isCategoryPartiallySelected = (categoryPermissions: string[]): boolean => {
        const selectedCount = categoryPermissions.filter((p) => selectedPermissions.includes(p)).length;
        return selectedCount > 0 && selectedCount < categoryPermissions.length;
    };
    return (
        <div>
            <Container>
                <FilterBar>
                    <div className={'relative'}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            className={'absolute left-3 top-1/2 transform -translate-y-1/2'}
                            style={{ color: 'var(--theme-text-muted)' }}
                        />
                        <Input
                            type={'text'}
                            placeholder={'Search permissions...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={'!pl-10'}
                        />
                    </div>
                    <Select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                        <option value={''}>All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {formatCategoryName(category)}
                            </option>
                        ))}
                    </Select>
                </FilterBar>
                {Object.entries(filteredPermissions).map(([category, perms]) => (
                    <div key={category}>
                        <CategoryHeader
                            isExpanded={expandedCategories.has(category)}
                            onClick={() => toggleCategory(category)}
                        >
                            <div className={'flex items-center gap-3'}>
                                <FontAwesomeIcon
                                    icon={expandedCategories.has(category) ? faChevronDown : faChevronRight}
                                    className={'w-3'}
                                    style={{ color: 'var(--theme-text-muted)' }}
                                />
                                <Input
                                    type={'checkbox'}
                                    checked={grantAllPermission || isCategoryFullySelected(perms)}
                                    ref={(el) => {
                                        if (el) {
                                            el.indeterminate = !grantAllPermission && isCategoryPartiallySelected(perms);
                                        }
                                    }}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        if (!grantAllPermission) {
                                            toggleCategoryPermissions(category, perms);
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={disabled || grantAllPermission}
                                    className={'!w-4 !h-4'}
                                />
                                <span className={'font-medium'} style={{ color: 'var(--theme-text-base)' }}>
                                    {formatCategoryName(category)}
                                </span>
                                <span className={'text-xs'} style={{ color: 'var(--theme-text-muted)' }}>
                                    ({perms.filter((p) => selectedPermissions.includes(p)).length}/{perms.length})
                                </span>
                            </div>
                        </CategoryHeader>
                        {expandedCategories.has(category) && (
                            <div>
                                {perms.map((permission) => (
                                    <PermissionItem
                                        key={permission}
                                        className={disabled || grantAllPermission ? 'disabled' : undefined}
                                        onClick={() => !grantAllPermission && togglePermission(permission)}
                                    >
                                        <Input
                                            type={'checkbox'}
                                            checked={grantAllPermission || selectedPermissions.includes(permission)}
                                            onChange={() => { }}
                                            disabled={disabled || grantAllPermission}
                                            className={'!w-4 !h-4 mr-3'}
                                        />
                                        <div className={'flex flex-col'}>
                                            <code className={'text-sm'} style={{ color: 'var(--theme-text-base)' }}>
                                                {getPermissionCommand(permission)}
                                            </code>
                                            <code className={'text-xs'} style={{ color: 'var(--theme-text-muted)' }}>
                                                {permission}
                                            </code>
                                        </div>
                                    </PermissionItem>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {Object.keys(filteredPermissions).length === 0 && (
                    <div className={'p-4 text-center'} style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}>
                        No permissions found matching your search.
                    </div>
                )}
            </Container>
            <div style={{ marginTop: '0.5rem', backgroundColor: 'var(--theme-background-secondary)', border: '1px solid var(--theme-border)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.25rem' }}>
                <Switch
                    label={'Grant All Permissions (*)'}
                    description={'Enable this to give all permissions to this group'}
                    name={'grantAllPermission'}
                    defaultChecked={grantAllPermission}
                    onChange={() => onGrantAllChange?.(!grantAllPermission)}
                    readOnly={disabled}
                />
            </div>
        </div>
    );
};
export default HytalePermissionSelector;

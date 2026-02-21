import React, { useState, useEffect, useRef } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { v4 as uuidv4 } from 'uuid';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import Switch from '@/components/elements/Switch';
import { SearchIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/outline';
const SearchInput = styled(Input)`
    ${tw`pl-8!`}
`;
const ToggleContainer = styled.div`
    ${tw`relative select-none w-12 leading-normal`};
    & > input[type='checkbox'] {
        ${tw`hidden`};
        &:checked + label {
            ${tw`bg-primary-500 border-primary-700 shadow-none`};
        }
        &:checked + label:before {
            right: 0.125rem;
        }
    }
    & > label {
        ${tw`mb-0 block overflow-hidden cursor-pointer bg-neutral-400 border border-neutral-700 rounded-full h-6 shadow-inner`};
        transition: all 75ms linear;
        &::before {
            ${tw`absolute block bg-white border h-5 w-5 rounded-full`};
            top: 0.125rem;
            right: calc(50% + 0.125rem);
            content: '';
            transition: all 75ms ease-in;
        }
    }
`;
interface Props {
    config: Record<string, any>;
    type: string;
    onChange: (config: Record<string, any>) => void;
    searchTerm?: string;
}
const ConfigVisualEditor: React.FC<Props> = ({ config, type, onChange, searchTerm = '' }) => {
    const [editedConfig, setEditedConfig] = useState<Record<string, any>>(config);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const isUserChangeRef = useRef(false);
    const expandedSectionsRef = useRef<Set<string>>(new Set());
    const formatSectionName = (section: string): string => {
        return section
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };
    useEffect(() => {
        if (JSON.stringify(config) !== JSON.stringify(editedConfig)) {
            setEditedConfig(config);
        }
    }, [config]);
    useEffect(() => {
        if (searchTerm.trim()) {
            const newExpandedSections = new Set<string>();
            const searchLower = searchTerm.toLowerCase();
            const checkSectionForMatch = (
                sectionName: string,
                sectionData: Record<string, any>,
                parentPath: string[] = []
            ): boolean => {
                const currentPath = [...parentPath, sectionName];
                const pathString = currentPath.join('.');
                let hasMatch = false;
                if (sectionName.toLowerCase().includes(searchLower)) {
                    hasMatch = true;
                }
                Object.entries(sectionData).forEach(([key, value]) => {
                    if (shouldSkipField(key)) return;
                    if (key.toLowerCase().includes(searchLower)) {
                        hasMatch = true;
                    }
                    if (typeof value === 'string' && value.toLowerCase().includes(searchLower)) {
                        hasMatch = true;
                    }
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        const nestedMatch = checkSectionForMatch(key, value as Record<string, any>, currentPath);
                        if (nestedMatch) {
                            hasMatch = true;
                        }
                    }
                    if (isArrayOfObjects(value)) {
                        (value as any[]).forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                const itemPath = [...currentPath, key, String(index)];
                                const itemPathString = itemPath.join('.');
                                Object.entries(item).forEach(([itemKey, itemValue]) => {
                                    if (shouldSkipField(itemKey)) return;
                                    if (
                                        itemKey.toLowerCase().includes(searchLower) ||
                                        (typeof itemValue === 'string' && itemValue.toLowerCase().includes(searchLower))
                                    ) {
                                        hasMatch = true;
                                        newExpandedSections.add(itemPathString);
                                    }
                                });
                            }
                        });
                    }
                });
                if (hasMatch) {
                    newExpandedSections.add(pathString);
                }
                return hasMatch;
            };
            Object.entries(editedConfig).forEach(([sectionName, sectionData]) => {
                if (shouldSkipField(sectionName)) return;
                if (typeof sectionData === 'object' && sectionData !== null) {
                    checkSectionForMatch(sectionName, sectionData as Record<string, any>);
                }
            });
            setExpandedSections(newExpandedSections);
        } else {
            setExpandedSections(new Set());
        }
    }, [searchTerm]);
    const handleValueChange = (key: string, value: any, sectionPath?: string) => {
        isUserChangeRef.current = true;
        const newConfig = JSON.parse(JSON.stringify(editedConfig));
        if (sectionPath) {
            const pathParts = sectionPath.split('.');
            let target: any = newConfig;
            for (const part of pathParts) {
                if (!target[part]) {
                    if (!isNaN(Number(part))) {
                        target[part] = {};
                    } else {
                        target[part] = {};
                    }
                }
                target = target[part];
            }
            target[key] = value;
            setExpandedSections(prev => {
                const newExpanded = new Set(prev);
                newExpanded.add(sectionPath);
                const pathParts = sectionPath.split('.');
                for (let i = 1; i < pathParts.length; i++) {
                    const parentPath = pathParts.slice(0, i).join('.');
                    newExpanded.add(parentPath);
                }
                return newExpanded;
            });
        } else {
            newConfig[key] = value;
        }
        setEditedConfig(newConfig);
        onChange(newConfig);
    };
    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };
    const filterConfig = (config: Record<string, any>, search: string): Record<string, any> => {
        if (!search) return config;
        const searchLower = search.toLowerCase();
        const filterRecursive = (obj: Record<string, any>): Record<string, any> | null => {
            const result: Record<string, any> = {};
            let hasMatch = false;
            Object.entries(obj).forEach(([key, value]) => {
                if (shouldSkipField(key)) return;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    const nestedResult = filterRecursive(value as Record<string, any>);
                    if (nestedResult) {
                        result[key] = nestedResult;
                        hasMatch = true;
                    }
                } else if (
                    key.toLowerCase().includes(searchLower) ||
                    (Array.isArray(value) && value.some(v => String(v).toLowerCase().includes(searchLower))) ||
                    String(value).toLowerCase().includes(searchLower)
                ) {
                    result[key] = value;
                    hasMatch = true;
                }
            });
            return hasMatch ? result : null;
        };
        return filterRecursive(config) || {};
    };
    const isBooleanValue = (value: any): boolean => {
        if (typeof value === 'boolean') return true;
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            return lower === 'true' || lower === 'false';
        }
        return false;
    };
    const getBooleanValue = (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return false;
    };
    const stripQuotes = (value: any): string => {
        const strValue = String(value);
        if (
            (strValue.startsWith('"') && strValue.endsWith('"')) ||
            (strValue.startsWith("'") && strValue.endsWith("'"))
        ) {
            return strValue.slice(1, -1);
        }
        return strValue;
    };
    const isArrayOfObjects = (value: any): boolean => {
        return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null;
    };
    const shouldSkipField = (key: string): boolean => {
        if (key.startsWith('_')) return true;
        if (key.startsWith('@')) return true;
        if (key.endsWith('_quoted')) return true;
        const skipFields = ['comment', 'Comment', 'COMMENT'];
        if (skipFields.includes(key)) return true;
        return false;
    };
    const getDisplayName = (key: string): string => {
        if (key.startsWith('sets_')) {
            return 'sets ' + key.substring(5);
        }
        return key;
    };
    const renderField = (key: string, value: any, section?: string) => {
        if (shouldSkipField(key)) return null;
        if (Array.isArray(value)) {
            const fieldId = `field-${section || 'root'}-${key}-${uuidv4()}`;
            return (
                <div>
                    <Label htmlFor={fieldId} css={tw`mb-2 text-xs uppercase text-neutral-300`}>
                        {getDisplayName(key)} (Multiple Values)
                    </Label>
                    <div css={tw`space-y-2`}>
                        {value.map((item, index) => (
                            <div key={index} css={tw`flex items-center gap-2`}>
                                <Input
                                    id={`${fieldId}-${index}`}
                                    type='text'
                                    value={stripQuotes(item)}
                                    onChange={(e) => {
                                        const newArray = [...value] as any[];
                                        newArray[index] = e.target.value;
                                        handleValueChange(key, newArray, section);
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const newArray = value.filter((_: any, i: number) => i !== index) as any[];
                                        handleValueChange(key, newArray, section);
                                    }}
                                    css={tw`px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700`}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newArray = [...value, ''] as any[];
                                handleValueChange(key, newArray, section);
                            }}
                            css={tw`px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700`}
                        >
                            Add Item
                        </button>
                    </div>
                </div>
            );
        }
        if (Array.isArray(value) && !isArrayOfObjects(value)) {
            const fieldId = `field-${section || 'root'}-${key}-${uuidv4()}`;
            return (
                <div>
                    <Label htmlFor={fieldId} css={tw`mb-2 text-xs uppercase text-neutral-300`}>
                        {getDisplayName(key)}
                    </Label>
                    <Input
                        id={fieldId}
                        type='text'
                        value={value.join(', ')}
                        onChange={(e) => {
                            const arrayValue = e.target.value.split(',').map((v) => v.trim());
                            handleValueChange(key, arrayValue as any, section);
                        }}
                    />
                </div>
            );
        }
        const isBoolean = isBooleanValue(value);
        const fieldId = `field-${section || 'root'}-${key}-${uuidv4()}`;
        const displayValue = stripQuotes(value);
        if (isBoolean) {
            const boolValue = getBooleanValue(value);
            return (
                <div css={tw`flex items-center justify-between`}>
                    <Label htmlFor={fieldId} css={tw`mb-0 text-xs uppercase text-neutral-300 cursor-pointer`}>
                        {getDisplayName(key)}
                    </Label>
                    <ToggleContainer>
                        <Input
                            id={fieldId}
                            type='checkbox'
                            checked={boolValue}
                            onChange={(e) => {
                                const newValue = e.target.checked ? 'true' : 'false';
                                handleValueChange(key, newValue, section);
                            }}
                        />
                        <Label htmlFor={fieldId} />
                    </ToggleContainer>
                </div>
            );
        }
        return (
            <div>
                <Label htmlFor={fieldId} css={tw`mb-2 text-xs uppercase text-neutral-300`}>
                    {getDisplayName(key)}
                </Label>
                <Input
                    id={fieldId}
                    type='text'
                    value={displayValue}
                    onChange={(e) => handleValueChange(key, e.target.value, section)}
                />
            </div>
        );
    };
    const renderFlatConfig = (config: Record<string, any>) => {
        const filtered = filterConfig(config, searchTerm);
        const entries = Object.entries(filtered).filter(([key]) => !shouldSkipField(key));
        if (entries.length === 0) {
            return (
                <div css={tw`flex flex-col items-center justify-center py-12 text-neutral-400`}>
                    <SearchIcon css={tw`h-12 w-12 mb-3 text-neutral-500`} />
                    <p css={tw`text-sm`}>
                        {searchTerm ? 'No matching configuration found' : 'No configuration available'}
                    </p>
                    {searchTerm && <p css={tw`text-xs text-neutral-500 mt-1`}>Try a different search term</p>}
                </div>
            );
        }
        const midPoint = Math.ceil(entries.length / 2);
        const leftColumn = entries.slice(0, midPoint);
        const rightColumn = entries.slice(midPoint);
        return (
            <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-6`}>
                {/* Left Column */}
                <div css={tw`divide-y divide-neutral-600`}>
                    {leftColumn.map(([key, value]) => (
                        <div key={key} css={tw`px-3 py-3 hover:bg-neutral-800 transition-colors`}>
                            {renderField(key, value)}
                        </div>
                    ))}
                </div>
                {/* Right Column */}
                <div css={tw`divide-y divide-neutral-600`}>
                    {rightColumn.map(([key, value]) => (
                        <div key={key} css={tw`px-3 py-3 hover:bg-neutral-800 transition-colors`}>
                            {renderField(key, value)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    const flattenSections = (
        config: Record<string, any>
    ): Array<{ name: string; path: string; fields: Array<[string, any]> }> => {
        const sections: Array<{ name: string; path: string; fields: Array<[string, any]> }> = [];
        const processSection = (sectionName: string, sectionData: Record<string, any>, parentPath: string[] = []) => {
            const primitiveFields: Array<[string, any]> = [];
            const nestedSections: Array<[string, any]> = [];
            const arrayOfObjectsSections: Array<[string, any[]]> = [];
            Object.entries(sectionData).forEach(([key, value]) => {
                if (shouldSkipField(key)) return;
                if (isArrayOfObjects(value)) {
                    arrayOfObjectsSections.push([key, value as any[]]);
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    nestedSections.push([key, value]);
                } else {
                    primitiveFields.push([key, value]);
                }
            });
            const currentPath = [...parentPath, sectionName];
            const pathString = currentPath.join('.');
            if (primitiveFields.length > 0) {
                sections.push({
                    name: sectionName,
                    path: pathString,
                    fields: primitiveFields,
                });
            }
            arrayOfObjectsSections.forEach(([arrayKey, arrayData]) => {
                arrayData.forEach((item, index) => {
                    const itemPath = [...currentPath, arrayKey, String(index)];
                    const itemPathString = itemPath.join('.');
                    const itemFields: Array<[string, any]> = [];
                    Object.entries(item).forEach(([itemKey, itemValue]) => {
                        if (!shouldSkipField(itemKey)) {
                            itemFields.push([itemKey, itemValue]);
                        }
                    });
                    if (itemFields.length > 0) {
                        sections.push({
                            name: `${arrayKey} #${index + 1}`,
                            path: itemPathString,
                            fields: itemFields,
                        });
                    }
                });
            });
            nestedSections.forEach(([nestedName, nestedData]) => {
                processSection(nestedName, nestedData as Record<string, any>, currentPath);
            });
        };
        Object.entries(config).forEach(([sectionName, sectionData]) => {
            if (shouldSkipField(sectionName)) return;
            if (typeof sectionData === 'object' && sectionData !== null) {
                processSection(sectionName, sectionData as Record<string, any>);
            }
        });
        return sections;
    };
    const renderSectionedConfig = (config: Record<string, any>) => {
        const filtered = filterConfig(config, searchTerm);
        const flattenedSections = flattenSections(filtered);
        if (flattenedSections.length === 0) {
            return (
                <div css={tw`flex flex-col items-center justify-center py-12 text-neutral-400`}>
                    <SearchIcon css={tw`h-12 w-12 mb-3 text-neutral-500`} />
                    <p css={tw`text-sm`}>
                        {searchTerm ? 'No matching configuration found' : 'No configuration available'}
                    </p>
                    {searchTerm && <p css={tw`text-xs text-neutral-500 mt-1`}>Try a different search term</p>}
                </div>
            );
        }
        return (
            <div css={tw`divide-y divide-neutral-600`}>
                {flattenedSections.map((section) => {
                    const isExpanded = expandedSections.has(section.path);
                    const entries = section.fields;
                    return (
                        <div key={section.path}>
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.path)}
                                css={tw`w-full px-3 py-3 flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 transition-colors`}
                            >
                                <div css={tw`flex items-center`}>
                                    {isExpanded ? (
                                        <ChevronDownIcon css={tw`w-4 h-4 mr-2 text-neutral-400`} />
                                    ) : (
                                        <ChevronRightIcon css={tw`w-4 h-4 mr-2 text-neutral-400`} />
                                    )}
                                    <span css={tw`font-semibold text-sm text-neutral-200`}>
                                        {formatSectionName(section.name)}
                                    </span>
                                    <span css={tw`ml-2 px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded`}>
                                        {entries.length}
                                    </span>
                                </div>
                            </button>
                            {/* Section Content */}
                            {isExpanded && (
                                <div css={tw`bg-neutral-800/30`}>
                                    {(() => {
                                        const midPoint = Math.ceil(entries.length / 2);
                                        const leftColumn = entries.slice(0, midPoint);
                                        const rightColumn = entries.slice(midPoint);
                                        return (
                                            <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-6`}>
                                                {/* Left Column */}
                                                <div css={tw`divide-y divide-neutral-600`}>
                                                    {leftColumn.map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            css={tw`px-3 py-3 hover:bg-neutral-800 transition-colors`}
                                                        >
                                                            {renderField(key, value, section.path)}
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Right Column */}
                                                <div css={tw`divide-y divide-neutral-600`}>
                                                    {rightColumn.map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            css={tw`px-3 py-3 hover:bg-neutral-800 transition-colors`}
                                                        >
                                                            {renderField(key, value, section.path)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };
    const hasNestedStructure = Object.values(editedConfig).some(
        (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
    );
    return (
        <div css={tw`flex flex-col -m-3`}>
            {hasNestedStructure && !['cfg', 'conf', 'config'].includes(type)
                ? renderSectionedConfig(editedConfig)
                : renderFlatConfig(editedConfig)}
        </div>
    );
};
export default ConfigVisualEditor;
export type { Props };

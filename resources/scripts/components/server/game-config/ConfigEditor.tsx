import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { ServerContext } from '@/state/server';
import { GameConfigFile, getConfigContent, updateConfig } from '@/api/server/game-config';
import { httpErrorToHuman } from '@/api/http';
import useFlash from '@/plugins/useFlash';
import Spinner from '@/components/elements/Spinner';
import FuturisticContentBox from '@/components/elements/rivion/FuturisticContentBox';
import Input from '@/components/elements/Input';
import { Button } from '@/components/elements/button/index';
import { SaveIcon, CodeIcon, TableIcon, SearchIcon } from '@heroicons/react/outline';
import CodemirrorEditor from '@/components/elements/CodemirrorEditor';
import ConfigVisualEditor from './ConfigVisualEditor';
const SearchInput = styled(Input)`
    ${tw`pl-8!`}
`;
interface Props {
    file: GameConfigFile;
}
type EditorMode = 'visual' | 'raw';
const ConfigEditor: React.FC<Props> = ({ file }) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, addFlash, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [parsedConfig, setParsedConfig] = useState<Record<string, any>>({});
    const [editorMode, setEditorMode] = useState<EditorMode>('visual');
    const [searchTerm, setSearchTerm] = useState('');
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [previousMode, setPreviousMode] = useState<EditorMode>('visual');
    let fetchFileContent: null | (() => Promise<string>) = null;
    useEffect(() => {
        loadConfig();
    }, [file.path]);
    useEffect(() => {
        if (editorMode === 'visual' && previousMode === 'raw' && !loading) {
            clearFlashes('game-config');
            getConfigContent(uuid, file.path, file.type)
                .then((response) => {
                    setParsedConfig(response.parsed || {});
                    if (response.content !== content) {
                        setContent(response.content);
                        setOriginalContent(response.content);
                    }
                })
                .catch((error) => {
                    console.error('Failed to reload config on mode switch:', error);
                });
        }
        setPreviousMode(editorMode);
    }, [editorMode]);
    useEffect(() => {
        if (editorMode === 'visual' && content && content !== originalContent && !loading && !saving) {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            const timeout = setTimeout(() => {
                handleSave();
            }, 500);
            setSaveTimeout(timeout);
        }
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
        };
    }, [content, editorMode]);
    const loadConfig = () => {
        setLoading(true);
        clearFlashes('game-config');
        getConfigContent(uuid, file.path, file.type)
            .then((response) => {
                setContent(response.content);
                setOriginalContent(response.content);
                setParsedConfig(response.parsed || {});
            })
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'game-config' });
            })
            .finally(() => setLoading(false));
    };
    const handleSave = () => {
        if (saving) return;
        setSaving(true);
        clearFlashes('game-config');
        const savePromise = editorMode === 'raw' && fetchFileContent ? fetchFileContent() : Promise.resolve(content);
        savePromise
            .then((contentToSave) => {
                return updateConfig(uuid, file.path, contentToSave);
            })
            .then((response) => {
                if (editorMode === 'raw' && fetchFileContent) {
                    return fetchFileContent().then((updatedContent) => {
                        setContent(updatedContent);
                        setOriginalContent(updatedContent);
                        const parsed = parseConfigContent(updatedContent, file.type);
                        setParsedConfig(parsed);
                        return updatedContent;
                    });
                } else {
                    setOriginalContent(content);
                    return content;
                }
            })
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'game-config' });
            })
            .finally(() => setSaving(false));
    };
    const parseConfigContent = (content: string, type: string): Record<string, any> => {
        return {};
    };
    const stringifyConfig = (parsed: Record<string, any>, type: string): string => {
        const stringifyYaml = (obj: Record<string, any>, indent: number = 0, path: string = ''): string => {
            const indentStr = '  '.repeat(indent);
            const quotedValues = parsed['_quoted_values'] || {};
            return Object.entries(obj)
                .filter(([key]) => key !== '_quoted_values')
                .map(([key, value]) => {
                    const currentPath = path ? `${path}.${key}` : key;
                    if (value === null) {
                        return `${indentStr}${key}: null`;
                    }
                    if (value === undefined) {
                        return `${indentStr}${key}:`;
                    }
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        const nested = stringifyYaml(value as Record<string, any>, indent + 1, currentPath);
                        return `${indentStr}${key}:\n${nested}`;
                    } else if (Array.isArray(value)) {
                        if (value.length === 0) {
                            return `${indentStr}${key}: []`;
                        }
                        const arrayItems = value
                            .map((item, index) => {
                                const itemPath = `${currentPath}.${index}`;
                                if (typeof item === 'object' && item !== null) {
                                    const nested = stringifyYaml(item as Record<string, any>, indent + 2, itemPath);
                                    return `${indentStr}  -\n${nested}`;
                                } else if (typeof item === 'string') {
                                    const wasOriginallyQuoted = quotedValues[itemPath] !== undefined;
                                    const needsQuotes = wasOriginallyQuoted || 
                                                      item.includes('\n') || item.includes('\r') || 
                                                      (item.includes(':') && !item.match(/^\s*http/)) ||
                                                      item.includes('#') || item.startsWith('!') || 
                                                      item.includes('|') || item.includes('>') ||
                                                      item.includes('{') || item.includes('}') ||
                                                      item.includes('[') || item.includes(']') ||
                                                      item.includes(',') || (item.includes(' ') && !item.match(/^\s*http/)) ||
                                                      item === '' || item.match(/^[\d\s-:.]+$/);
                                    return `${indentStr}  - ${needsQuotes ? `"${item}"` : item}`;
                                } else {
                                    return `${indentStr}  - ${item}`;
                                }
                            })
                            .join('\n');
                        return `${indentStr}${key}:\n${arrayItems}`;
                    } else if (typeof value === 'string') {
                        const wasOriginallyQuoted = quotedValues[currentPath] !== undefined;
                        const needsQuotes = wasOriginallyQuoted || 
                                          value.includes('\n') || value.includes('\r') || 
                                          (value.includes(':') && !value.match(/^\s*http/)) ||
                                          value.includes('#') || value.startsWith('!') || 
                                          value.includes('|') || value.includes('>') ||
                                          value.includes('{') || value.includes('}') ||
                                          value.includes('[') || value.includes(']') ||
                                          value.includes(',') || (value.includes(' ') && !value.match(/^\s*http/)) ||
                                          value === '' || value.match(/^[\d\s-:.]+$/);
                        return `${indentStr}${key}: ${needsQuotes ? `"${value}"` : value}`;
                    } else if (typeof value === 'boolean') {
                        return `${indentStr}${key}: ${value}`;
                    } else {
                        return `${indentStr}${key}: ${value}`;
                    }
                })
                .join('\n');
        };
        const stringifyIni = (obj: Record<string, any>): string => {
            return Object.entries(obj)
                .map(([section, values]) => {
                    if (typeof values === 'object' && values !== null) {
                        const entries = Object.entries(values as Record<string, any>)
                            .map(([key, value]) => `${key}=${value}`)
                            .join('\n');
                        return `[${section}]\n${entries}`;
                    }
                    return '';
                })
                .join('\n\n');
        };
        switch (type.toLowerCase()) {
            case 'properties':
                return Object.entries(parsed)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('\n');
            case 'ini':
                return stringifyIni(parsed);
            case 'cfg':
            case 'conf':
            case 'config':
                return Object.entries(parsed)
                    .reduce((acc: string[], [key, value]: [string, any]) => {
                        if (key.endsWith('_quoted')) {
                            return acc;
                        }
                        if (Array.isArray(value)) {
                            value.forEach(item => {
                                const strItem = String(item);
                                const cleanItem = strItem.replace(/^["']|["']$/g, '');
                                const needsQuotes = cleanItem.includes(' ') || cleanItem.includes(';') || cleanItem.includes('#');
                                if (cleanItem.trim() !== '') {
                                    acc.push(`${key} ${needsQuotes ? `"${cleanItem}"` : cleanItem}`);
                                }
                            });
                        } else if (value === true) {
                            if (key.startsWith('sets_') || ['sv_endpointprivacy', 'sv_licenseKey', 'onesync', 'steam_webApiKey', 'temp_convar'].includes(key) ||
                                ['start', 'ensure', 'add_ace', 'add_principal', 'endpoint_add_tcp', 'endpoint_add_udp'].includes(key)) {
                                acc.push(key);
                            } else {
                                acc.push(`${key}=true`);
                            }
                        } else if (value === false) {
                            acc.push(`${key}=false`);
                        } else {
                            const strValue = String(value);
                            const cleanValue = strValue.replace(/^["']|["']$/g, '');
                            const needsQuotes = cleanValue.includes(' ') || cleanValue.includes(';') || cleanValue.includes('#');
                            if (key.startsWith('sets_')) {
                                const actualKey = key.substring(5);
                                const wasQuoted = parsed[key + '_quoted'] === true;
                                const shouldQuote = wasQuoted || needsQuotes || cleanValue === '';
                                acc.push(`sets ${actualKey} ${shouldQuote ? `"${cleanValue}"` : cleanValue}`);
                            }
                            else if (/^(ai|creative|demo|fps|global|physics|player|profile|server|steam|rcon|analytics|npcvendingmachine|parachute|ridablehorse|travellingvendor|tutorialisland|waypointrace)\./.test(key) || key.startsWith('boombox.')) {
                                acc.push(`${key} "${cleanValue}"`);
                            }
                            else if (['sv_endpointprivacy', 'sv_licenseKey', 'onesync', 'steam_webApiKey', 'temp_convar', 'sv_maxclients', 'sv_hostname'].includes(key)) {
                                acc.push(`set ${key} ${needsQuotes || cleanValue === '' ? `"${cleanValue}"` : cleanValue}`);
                            }
                            else if (['start', 'ensure', 'add_ace', 'add_principal', 'endpoint_add_tcp', 'endpoint_add_udp'].includes(key)) {
                                acc.push(`${key} ${needsQuotes ? `"${cleanValue}"` : cleanValue}`);
                            } else {
                                acc.push(`${key}=${needsQuotes ? `"${cleanValue}"` : cleanValue}`);
                            }
                        }
                        return acc;
                    }, [])
                    .join('\n');
            case 'env':
                return Object.entries(parsed)
                    .map(([key, value]) => {
                        const needsQuotes = typeof value === 'string' && value.includes(' ');
                        return `${key}=${needsQuotes ? `"${value}"` : value}`;
                    })
                    .join('\n');
            case 'json':
                return JSON.stringify(parsed, null, 2);
            case 'yaml':
            case 'yml':
                return stringifyYaml(parsed);
            default:
                return content;
        }
    };
    const handleVisualUpdate = (newParsed: Record<string, any>) => {
        const newContent = stringifyConfig(newParsed, file.type);
        setContent(newContent);
    };
    if (loading) {
        return (
            <FuturisticContentBox title={file.name}>
                <div css={tw`flex items-center justify-center py-8`}>
                    <Spinner size={'large'} />
                </div>
            </FuturisticContentBox>
        );
    }
    return (
        <FuturisticContentBox>
            {/* Sticky Header */}
            <div css={[tw`sticky top-0 z-50 shadow-md rounded`, { backgroundColor: 'var(--theme-background)' }]}
            >
                {/* Title Bar */}
                <div css={[tw`pl-3 pr-2 py-2 border-b`, { borderBottomColor: 'var(--theme-border)' }]}>
                    <div css={tw`flex items-center justify-between w-full`}>
                        <div>
                            <div css={tw`flex items-center gap-2`}>
                                <p
                                    css={tw`text-sm uppercase`}
                                    style={{
                                        color: 'var(--theme-text-base)',
                                        fontFamily: "'Orbitron', sans-serif",
                                    }}
                                >
                                    {file.name}
                                </p>
                                <p
                                    css={tw`text-xs mt-0.5 normal-case`}
                                    style={{ color: 'var(--theme-text-muted)', fontFamily: "'Electrolize', sans-serif" }}
                                >
                                    /home/container/{file.path}
                                </p>
                                {saving && (
                                    <div css={tw`flex items-center`} style={{ color: 'var(--theme-primary)' }}>
                                        <SaveIcon className='w-4 h-4 mr-2 animate-pulse' />
                                        <span css={tw`text-sm font-medium`}>Saving...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div css={tw`flex items-center gap-2`}>
                            {/* Editor Mode Toggle */}
                            <div css={[tw`flex rounded overflow-hidden`, { backgroundColor: 'var(--theme-background-secondary)' }]}>
                                <button
                                    onClick={() => setEditorMode('visual')}
                                    css={[
                                        tw`px-3 py-1.5 text-xs font-medium transition-colors`,
                                        editorMode === 'visual'
                                            ? { backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)', color: 'var(--theme-primary)' }
                                            : { color: 'var(--theme-text-muted)' },
                                    ]}
                                >
                                    <TableIcon className='w-3.5 h-3.5 inline mr-1' />
                                    Visual
                                </button>
                                <button
                                    onClick={() => setEditorMode('raw')}
                                    css={[
                                        tw`px-3 py-1.5 text-xs font-medium transition-colors`,
                                        editorMode === 'raw'
                                            ? { backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)', color: 'var(--theme-primary)' }
                                            : { color: 'var(--theme-text-muted)' },
                                    ]}
                                >
                                    <CodeIcon className='w-3.5 h-3.5 inline mr-1' />
                                    Raw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Search Bar - Only show in visual mode */}
                {editorMode === 'visual' && (
                    <div
                        css={[
                            tw`px-3 py-3 border-b`,
                            { backgroundColor: 'var(--theme-background-secondary)', borderBottomColor: 'var(--theme-border)' },
                        ]}
                    >
                        <div css={tw`relative`}>
                            <div css={tw`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10`}>
                                <SearchIcon css={[tw`h-4 w-4`, { color: 'var(--theme-text-muted)' }]} />
                            </div>
                            <SearchInput
                                type='text'
                                placeholder='Search configuration...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                css={tw`w-full`}
                                style={{
                                    backgroundColor: 'var(--theme-background)',
                                    borderColor: 'var(--theme-border)',
                                    color: 'var(--theme-text-base)',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            {/* Content */}
            <div css={tw`p-3`}>
                {/* Editor Content */}
                <div css={tw`relative`}>
                    {editorMode === 'visual' ? (
                        <ConfigVisualEditor
                            config={parsedConfig}
                            type={file.type}
                            onChange={handleVisualUpdate}
                            searchTerm={searchTerm}
                        />
                    ) : (
                        <div>
                            <CodemirrorEditor
                                initialContent={content}
                                mode={file.type === 'yaml' || file.type === 'yml' ? 'yaml' : 'properties'}
                                fetchContent={(callback) => {
                                    fetchFileContent = callback;
                                }}
                                onContentSaved={handleSave}
                                onModeChanged={() => { }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </FuturisticContentBox>
    );
};
export default ConfigEditor;
export type { Props };

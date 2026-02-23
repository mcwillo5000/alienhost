import React from 'react';
import tw, { css } from 'twin.macro';
import { GameConfigFile } from '@/api/server/game-config';
import { DocumentIcon, DocumentTextIcon, CodeIcon, CogIcon, DatabaseIcon } from '@heroicons/react/outline';
interface Props {
    files: GameConfigFile[];
    selectedFile: GameConfigFile | null;
    onSelectFile: (file: GameConfigFile) => void;
}
const ConfigFileSelector: React.FC<Props> = ({ files, selectedFile, onSelectFile }) => {
    const getFileIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'properties':
                return <DocumentTextIcon className="w-5 h-5" />;
            case 'yaml':
            case 'yml':
                return <CodeIcon className="w-5 h-5" />;
            case 'ini':
                return <DocumentIcon className="w-5 h-5" />;
            case 'cfg':
            case 'conf':
            case 'config':
                return <CogIcon className="w-5 h-5" />;
            case 'json':
                return <CodeIcon className="w-5 h-5" />;
            case 'env':
                return <CogIcon className="w-5 h-5" />;
            default:
                return <DocumentIcon className="w-5 h-5" />;
        }
    };
    const getFileTypeLabel = (type: string) => {
        const typeMap: Record<string, string> = {
            properties: 'Properties',
            yaml: 'YAML',
            yml: 'YAML',
            ini: 'INI',
            cfg: 'Config',
            conf: 'Config',
            config: 'Config',
            json: 'JSON',
            env: 'Environment',
        };
        return typeMap[type.toLowerCase()] || type.toUpperCase();
    };
    return (
        <div css={tw`-m-3 max-h-[calc(100vh-12rem)] overflow-y-auto`}>
            <div css={[tw`divide-y`, { borderColor: 'var(--theme-border)' }]}>
                {files.map((file) => (
                    <button
                        key={file.path}
                        onClick={() => onSelectFile(file)}
                        css={[
                            tw`w-full px-4 py-3 text-left transition-colors duration-150 focus:outline-none`,
                            css`
                                &:hover {
                                    background-color: var(--theme-background-secondary);
                                }
                            `,
                            selectedFile?.path === file.path
                                ? css`
                                      background-color: rgba(var(--theme-primary-rgb), 0.18);
                                      &:hover {
                                          background-color: rgba(var(--theme-primary-rgb), 0.24);
                                      }
                                  `
                                : css`
                                      background-color: transparent;
                                  `,
                        ]}
                    >
                        <div css={tw`flex items-start`}>
                            <div
                                css={[
                                    tw`flex-shrink-0 mr-3 mt-0.5`,
                                    selectedFile?.path === file.path
                                        ? { color: 'var(--theme-text-base)' }
                                        : { color: 'var(--theme-text-muted)' },
                                ]}
                            >
                                {getFileIcon(file.type)}
                            </div>
                            <div css={tw`flex-1 min-w-0`}>
                                <div
                                    css={[
                                        tw`text-sm font-medium truncate`,
                                        selectedFile?.path === file.path
                                            ? { color: 'var(--theme-text-base)' }
                                            : { color: 'var(--theme-text-base)' },
                                    ]}
                                >
                                    {file.name}
                                </div>
                                <div
                                    css={[
                                        tw`text-xs mt-1 flex items-center gap-2`,
                                        selectedFile?.path === file.path
                                            ? { color: 'var(--theme-text-muted)' }
                                            : { color: 'var(--theme-text-muted)' },
                                    ]}
                                >
                                    <span
                                        css={[
                                            tw`px-2 py-0.5 rounded text-xs font-medium`,
                                            selectedFile?.path === file.path
                                                ? {
                                                      backgroundColor: 'rgba(var(--theme-primary-rgb), 0.24)',
                                                      color: 'var(--theme-primary)',
                                                      border: '1px solid var(--theme-border)',
                                                  }
                                                : {
                                                      backgroundColor: 'var(--theme-background-secondary)',
                                                      color: 'var(--theme-text-muted)',
                                                      border: '1px solid var(--theme-border)',
                                                  },
                                        ]}
                                    >
                                        {getFileTypeLabel(file.type)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
export default ConfigFileSelector;
export type { Props };

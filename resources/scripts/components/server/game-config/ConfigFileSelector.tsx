import React from 'react';
import tw from 'twin.macro';
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
            <div css={tw`divide-y divide-neutral-600`}>
                {files.map((file) => (
                    <button
                        key={file.path}
                        onClick={() => onSelectFile(file)}
                        css={[
                            tw`w-full px-4 py-3 text-left transition-colors duration-150`,
                            tw`hover:bg-neutral-600 focus:outline-none`,
                            selectedFile?.path === file.path
                                ? tw`bg-primary-600 hover:bg-primary-700`
                                : tw`bg-transparent`,
                        ]}
                    >
                        <div css={tw`flex items-start`}>
                            <div
                                css={[
                                    tw`flex-shrink-0 mr-3 mt-0.5`,
                                    selectedFile?.path === file.path ? tw`text-white` : tw`text-neutral-400`,
                                ]}
                            >
                                {getFileIcon(file.type)}
                            </div>
                            <div css={tw`flex-1 min-w-0`}>
                                <div
                                    css={[
                                        tw`text-sm font-medium truncate`,
                                        selectedFile?.path === file.path ? tw`text-white` : tw`text-neutral-200`,
                                    ]}
                                >
                                    {file.name}
                                </div>
                                <div
                                    css={[
                                        tw`text-xs mt-1 flex items-center gap-2`,
                                        selectedFile?.path === file.path ? tw`text-neutral-200` : tw`text-neutral-400`,
                                    ]}
                                >
                                    <span
                                        css={[
                                            tw`px-2 py-0.5 rounded text-xs font-medium`,
                                            selectedFile?.path === file.path
                                                ? tw`bg-primary-700 text-white`
                                                : tw`bg-neutral-700 text-neutral-300`,
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

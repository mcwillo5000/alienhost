import { action, Action } from 'easy-peasy';
import { cleanDirectoryPath } from '@/helpers';

export interface FileUploadData {
    loaded: number;
    readonly abort: AbortController;
    readonly total: number;
}

export interface ServerFileStore {
    directory: string;
    selectedFiles: string[];
    selectedTrashIds: number[];
    uploads: Record<string, FileUploadData>;

    setDirectory: Action<ServerFileStore, string>;
    setSelectedFiles: Action<ServerFileStore, string[]>;
    setSelectedTrashIds: Action<ServerFileStore, number[]>;
    appendSelectedFile: Action<ServerFileStore, string>;
    removeSelectedFile: Action<ServerFileStore, string>;
    appendSelectedTrashId: Action<ServerFileStore, number>;
    removeSelectedTrashId: Action<ServerFileStore, number>;

    pushFileUpload: Action<ServerFileStore, { name: string; data: FileUploadData }>;
    setUploadProgress: Action<ServerFileStore, { name: string; loaded: number }>;
    clearFileUploads: Action<ServerFileStore>;
    removeFileUpload: Action<ServerFileStore, string>;
    cancelFileUpload: Action<ServerFileStore, string>;
}

const files: ServerFileStore = {
    directory: '/',
    selectedFiles: [],
    selectedTrashIds: [],
    uploads: {},

    setDirectory: action((state, payload) => {
        state.directory = cleanDirectoryPath(payload);
    }),

    setSelectedFiles: action((state, payload) => {
        state.selectedFiles = payload;
    }),

    setSelectedTrashIds: action((state, payload) => {
        state.selectedTrashIds = payload;
    }),

    appendSelectedFile: action((state, payload) => {
        state.selectedFiles = state.selectedFiles.filter((f) => f !== payload).concat(payload);
    }),

    removeSelectedFile: action((state, payload) => {
        state.selectedFiles = state.selectedFiles.filter((f) => f !== payload);
    }),

    appendSelectedTrashId: action((state, payload) => {
        state.selectedTrashIds = state.selectedTrashIds.filter((f) => f !== payload).concat(payload);
    }),

    removeSelectedTrashId: action((state, payload) => {
        state.selectedTrashIds = state.selectedTrashIds.filter((f) => f !== payload);
    }),

    clearFileUploads: action((state) => {
        Object.values(state.uploads).forEach((upload) => upload.abort.abort());

        state.uploads = {};
    }),

    pushFileUpload: action((state, payload) => {
        state.uploads[payload.name] = payload.data;
    }),

    setUploadProgress: action((state, { name, loaded }) => {
        if (state.uploads[name]) {
            state.uploads[name].loaded = loaded;
        }
    }),

    removeFileUpload: action((state, payload) => {
        if (state.uploads[payload]) {
            delete state.uploads[payload];
        }
    }),

    cancelFileUpload: action((state, payload) => {
        if (state.uploads[payload]) {
            // Abort the request if it is still in flight. If it already completed this is
            // a no-op.
            state.uploads[payload].abort.abort();

            delete state.uploads[payload];
        }
    }),
};

export default files;

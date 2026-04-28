export interface DialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export interface ModaleteAPI {
    dialog(options: DialogOptions): Promise<boolean>;
    open(): void;
    close(): void;
}
export interface ModaleteConfirmDetail {
    title: string;
    message: string;
}
export interface ModaleteConfirmDetail {
    title: string;
    message: string;
}

export interface ModaleteEventMap {
    'modalete:confirm': CustomEvent<ModaleteConfirmDetail>;
    'modalete:cancel': CustomEvent<ModaleteConfirmDetail>;
}
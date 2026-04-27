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
import type { DialogOptions, ModaleteAPI } from './modalete.types';

class ModaleteDialog extends HTMLElement implements ModaleteAPI {

    private shadow: ShadowRoot;
    private resolver?: (value: boolean) => void;
    private controller = new AbortController();
    private triggerer: HTMLElement | null = null;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        this.renderShell();
        this.bindEvents();
        this.bindKeyboard();
    }

    disconnectedCallback(): void {
        this.controller.abort();
    }

    // ═══════════════════════════════════════
    // API PÚBLICA
    // ═══════════════════════════════════════

    dialog(options: DialogOptions): Promise<boolean> {
        if (this.hasAttribute('open')) {
            return Promise.resolve(false);
        }
        this.triggerer = document.activeElement as HTMLElement;
        this.fillContent(options);
        this.open();

        return new Promise<boolean>((resolve) => {
            this.resolver = resolve;
        });
    }

    open(): void {
        this.setAttribute('open', '');
        const backdrop = this.shadow.querySelector<HTMLElement>('[data-modalete-backdrop]');
        if (backdrop) backdrop.style.display = 'flex';

        const btnCancel = this.shadow.querySelector<HTMLElement>('[data-modalete-cancel]');
        btnCancel?.focus();
    }

    close(): void {
        this.removeAttribute('open');
        const backdrop = this.shadow.querySelector<HTMLElement>('[data-modalete-backdrop]');
        if (backdrop) backdrop.style.display = 'none';
    }

    // ═══════════════════════════════════════
    // PRIVADOS
    // ═══════════════════════════════════════

    private handleConfirm(): void {
        this.resolver?.(true);
        this.cleanup();
    }

    private handleCancel(): void {
        this.resolver?.(false);
        this.cleanup();
    }

    private cleanup(): void {
        this.resolver = undefined;
        this.close();
        this.triggerer?.focus();
        this.triggerer = null;
    }

    private bindEvents(): void {
        this.shadow
            .querySelector('[data-modalete-confirm]')
            ?.addEventListener('click', () => this.handleConfirm());

        this.shadow
            .querySelector('[data-modalete-cancel]')
            ?.addEventListener('click', () => this.handleCancel());
    }

    private bindKeyboard(): void {
        document.addEventListener(
            'keydown',
            (e: KeyboardEvent) => {
                if (e.key === 'Escape' && this.hasAttribute('open')) {
                    this.handleCancel();
                }
            },
            { signal: this.controller.signal }
        );
    }

    private fillContent(options: DialogOptions): void {
        const title = this.shadow.querySelector('[data-modalete-title]');
        const message = this.shadow.querySelector('[data-modalete-message]');
        const confirm = this.shadow.querySelector('[data-modalete-confirm]');
        const cancel = this.shadow.querySelector('[data-modalete-cancel]');

        if (title) title.textContent = options.title;
        if (message) message.textContent = options.message;
        if (confirm) confirm.textContent = options.confirmText ?? 'Confirmar';
        if (cancel) cancel.textContent = options.cancelText ?? 'Cancelar';
    }

    private renderShell(): void {
        this.shadow.innerHTML = `
            <style>
                .modalete-backdrop {
                    display:          none;
                    position:         fixed;
                    inset:            0;
                    background:       rgba(0, 0, 0, 0.6);
                    justify-content:  center;
                    align-items:      center;
                    z-index:          1000;
                }
                .modalete {
                    background:    #1e1e1e;
                    border:        1px solid #2f3032;
                    border-radius: 12px;
                    padding:       28px;
                    width:         min(360px, 90vw);
                    font-family:   "Open Sans", "Segoe UI", sans-serif;
                    box-shadow:    0 8px 32px rgba(0, 0, 0, 0.5);
                }
                .modalete__title {
                    margin:      0 0 12px 0;
                    font-size:   1.1rem;
                    font-weight: 700;
                    color:       #f0f0ea;
                }
                .modalete__message {
                    margin:      0 0 20px 0;
                    font-size:   0.9rem;
                    color:       #e6edf3;
                    line-height: 1.5;
                }
                .modalete__actions {
                    display:         flex;
                    justify-content: flex-end;
                    gap:             8px;
                }
                .modalete__btn {
                    padding:       10px 20px;
                    border:        none;
                    border-radius: 4px;
                    font-family:   inherit;
                    font-size:     0.875rem;
                    font-weight:   600;
                    cursor:        pointer;
                    transition:    opacity 120ms;
                }
                .modalete__btn:hover   { opacity: 0.85; }
                .modalete__btn:focus-visible {
                    outline:        2px solid #3eb4ff;
                    outline-offset: 2px;
                }
                .modalete__btn--confirm {
                    background: #3eb4ff;
                    color:      #111315;
                }
                .modalete__btn--cancel {
                    background: #4a4b4e;
                    color:      #f0f0ea;
                }
            </style>

            <div class="modalete-backdrop" data-modalete-backdrop role="dialog" aria-modal="true">
                <div class="modalete">
                    <h2  class="modalete__title"   data-modalete-title></h2>
                    <p   class="modalete__message" data-modalete-message></p>
                    <div class="modalete__actions">
                        <button class="modalete__btn modalete__btn--cancel"  data-modalete-cancel></button>
                        <button class="modalete__btn modalete__btn--confirm" data-modalete-confirm></button>
                    </div>
                </div>
            </div>
        `;
    }
}

if (!customElements.get('modalete-dialog')) {
    customElements.define('modalete-dialog', ModaleteDialog);
}

export { ModaleteDialog };
export type { DialogOptions, ModaleteAPI } from './modalete.types';
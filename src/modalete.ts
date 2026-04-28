import type { DialogOptions, ModaleteAPI, ModaleteConfirmDetail } from './modalete.types';
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
        this.bindFocusTrap(); // ← nueva línea
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
        if (backdrop) {
            backdrop.style.display = 'flex';
            // forzamos reflow para que el navegador registre el display:flex
            // antes de agregar la clase que dispara la animación
            backdrop.offsetHeight;
            backdrop.classList.add('is-open');
        }

        const btnCancel = this.shadow.querySelector<HTMLElement>('[data-modalete-cancel]');
        btnCancel?.focus();
    }

    close(): void {
        const backdrop = this.shadow.querySelector<HTMLElement>('[data-modalete-backdrop]');
        if (!backdrop) return;

        backdrop.classList.remove('is-open');
        backdrop.classList.add('is-closing');

        // esperamos que termine la animación de salida
        backdrop.addEventListener(
            'animationend',
            () => {
                backdrop.classList.remove('is-closing');
                backdrop.style.display = 'none';
                this.removeAttribute('open');
            },
            { once: true } // ← se autodestruye después de ejecutarse una vez
        );
    }

    // ═══════════════════════════════════════
    // PRIVADOS
    // ═══════════════════════════════════════

    private handleConfirm(): void {
        this.dispatchModaleteEvent('modalete:confirm');
        this.resolver?.(true);
        this.cleanup();
    }

    private handleCancel(): void {
        this.dispatchModaleteEvent('modalete:cancel');
        this.resolver?.(false);
        this.cleanup();
    }

    private cleanup(): void {
        this.resolver = undefined;
        this.close();
        this.triggerer?.focus();
        this.triggerer = null;
    }
    private dispatchModaleteEvent(type: 'modalete:confirm' | 'modalete:cancel'): void {
        const detail: ModaleteConfirmDetail = {
            title: this.shadow.querySelector('[data-modalete-title]')?.textContent ?? '',
            message: this.shadow.querySelector('[data-modalete-message]')?.textContent ?? '',
        };

        this.dispatchEvent(new CustomEvent(type, {
            detail,
            bubbles: true,
            composed: true,
        }));
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
    private bindFocusTrap(): void {
        document.addEventListener(
            'keydown',
            (e: KeyboardEvent) => {
                if (!this.hasAttribute('open')) return;
                if (e.key !== 'Tab') return;
                const focusables = Array.from(
                    this.shadow.querySelectorAll<HTMLElement>('[data-modalete-focusable]')
                );
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    // Shift+Tab — viene del primero, manda al último
                    if (this.shadow.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    // Tab — viene del último, manda al primero
                    if (this.shadow.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
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
            :host {
                --modalete-bg:                #1e1e1e;
                --modalete-border:            #2f3032;
                --modalete-radius:            12px;
                --modalete-title-color:       #f0f0ea;
                --modalete-message-color:     #e6edf3;
                --modalete-backdrop-bg:       rgba(0, 0, 0, 0.6);
                --modalete-btn-confirm-bg:    #3eb4ff;
                --modalete-btn-confirm-color: #111315;
                --modalete-btn-cancel-bg:     #4a4b4e;
                --modalete-btn-cancel-color:  #f0f0ea;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to   { opacity: 0; }
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-24px); }
                to   { opacity: 1; transform: translateY(0);     }
            }
            @keyframes slideUp {
                from { opacity: 1; transform: translateY(0);     }
                to   { opacity: 0; transform: translateY(-24px); }
            }

            .modalete-backdrop {
                display:         none;
                position:        fixed;
                inset:           0;
                background:      var(--modalete-backdrop-bg);
                justify-content: center;
                align-items:     center;
                z-index:         1000;
            }
            .modalete-backdrop.is-open {
                display:   flex;
                animation: fadeIn 180ms ease forwards;
            }
            .modalete-backdrop.is-open .modalete {
                animation: slideDown 220ms ease forwards;
            }
            .modalete-backdrop.is-closing {
                display:   flex;
                animation: fadeOut 160ms ease forwards;
            }
            .modalete-backdrop.is-closing .modalete {
                animation: slideUp 160ms ease forwards;
            }

            .modalete {
                background:    var(--modalete-bg);
                border:        1px solid var(--modalete-border);
                border-radius: var(--modalete-radius);
                padding:       28px;
                width:         min(360px, 90vw);
                font-family:   "Open Sans", "Segoe UI", sans-serif;
                box-shadow:    0 8px 32px rgba(0, 0, 0, 0.5);
            }
            .modalete__title {
                margin:      0 0 12px 0;
                font-size:   1.1rem;
                font-weight: 700;
                color:       var(--modalete-title-color);
            }
            .modalete__message {
                margin:      0 0 20px 0;
                font-size:   0.9rem;
                color:       var(--modalete-message-color);
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
            .modalete__btn:hover        { opacity: 0.85; }
            .modalete__btn:focus-visible {
                outline:        2px solid var(--modalete-btn-confirm-bg);
                outline-offset: 2px;
            }
            .modalete__btn--confirm {
                background: var(--modalete-btn-confirm-bg);
                color:      var(--modalete-btn-confirm-color);
            }
            .modalete__btn--cancel {
                background: var(--modalete-btn-cancel-bg);
                color:      var(--modalete-btn-cancel-color);
            }
        </style>

        <div class="modalete-backdrop" data-modalete-backdrop role="dialog" aria-modal="true">
            <div class="modalete">
                <h2  class="modalete__title"   data-modalete-title></h2>
                <p   class="modalete__message" data-modalete-message></p>
                <div class="modalete__actions">
                    <button class="modalete__btn modalete__btn--cancel"  data-modalete-cancel  data-modalete-focusable></button>
                    <button class="modalete__btn modalete__btn--confirm" data-modalete-confirm data-modalete-focusable></button>
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
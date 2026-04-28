# modalete

A lightweight Web Component modal dialog with a Promise-based API.  
No dependencies. No framework. Pure TypeScript + Shadow DOM.

## Install

```bash
npm install modalete
```

## Usage

### 1. Add the tag to your HTML

```html
<modalete-dialog data-modalete></modalete-dialog>
```

### 2. Import and call

```typescript
import 'modalete';

const modal = document.querySelector('[data-modalete]');

const ok = await modal.dialog({
  title:       'Delete record?',
  message:     'This action cannot be undone.',
  confirmText: 'Yes, delete',
  cancelText:  'Cancel'
});

if (ok) {
  // user confirmed — do your fetch, delete, etc.
} else {
  // user cancelled
}
```

## API

### `dialog(options): Promise<boolean>`

Opens the modal and returns a Promise that resolves to `true` (confirm) or `false` (cancel).

| Option | Type | Required | Default |
|---|---|---|---|
| `title` | `string` | ✅ | — |
| `message` | `string` | ✅ | — |
| `confirmText` | `string` | ❌ | `'Confirmar'` |
| `cancelText` | `string` | ❌ | `'Cancelar'` |

### `open(): void`

Opens the modal manually without a Promise.

### `close(): void`

Closes the modal manually.

## Events

`modalete` dispatches Custom Events on the `<modalete-dialog>` element that bubble up through the DOM.

```typescript
document.addEventListener('modalete:confirm', (e) => {
  console.log('User confirmed:', e.detail);
  // e.detail → { title: string, message: string }
});

document.addEventListener('modalete:cancel', (e) => {
  console.log('User cancelled:', e.detail);
});
```

| Event | When | `e.detail` |
|---|---|---|
| `modalete:confirm` | User clicks confirm button | `{ title, message }` |
| `modalete:cancel` | User clicks cancel or presses Escape | `{ title, message }` |

## TypeScript

Types are included out of the box:

```typescript
import type { DialogOptions, ModaleteConfirmDetail } from 'modalete';

const options: DialogOptions = {
  title:   'Are you sure?',
  message: 'This cannot be undone.'
};

document.addEventListener('modalete:confirm', (e: CustomEvent<ModaleteConfirmDetail>) => {
  console.log(e.detail.title);
});
```

## Keyboard

| Key | Action |
|---|---|
| `Escape` | Cancels and closes the modal |
| `Tab` | Navigates forward between buttons — trapped inside modal |
| `Shift + Tab` | Navigates backward between buttons — trapped inside modal |

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the backdrop
- Focus moves to cancel button on open
- Focus returns to the triggering element on close
- Full keyboard navigation with focus trap
## Animations

`modalete` includes built-in enter and exit animations out of the box.

- **Open** → backdrop fades in, dialog slides down from above
- **Close** → dialog slides up, backdrop fades out

No configuration needed — animations run automatically.

To disable animations, target the Shadow DOM parts with your own CSS (coming in a future release).
## Customization

`modalete` exposes CSS custom properties so you can style it from outside the Shadow DOM.

```css
modalete-dialog {
    --modalete-bg:                #ffffff;
    --modalete-border:            #e0e0e0;
    --modalete-radius:            12px;
    --modalete-title-color:       #111111;
    --modalete-message-color:     #444444;
    --modalete-backdrop-bg:       rgba(0, 0, 0, 0.4);
    --modalete-btn-confirm-bg:    #2563eb;
    --modalete-btn-confirm-color: #ffffff;
    --modalete-btn-cancel-bg:     #e5e7eb;
    --modalete-btn-cancel-color:  #111111;
}
```

### Available CSS custom properties

| Property | Description | Default |
|---|---|---|
| `--modalete-bg` | Modal background color | `#1e1e1e` |
| `--modalete-border` | Modal border color | `#2f3032` |
| `--modalete-radius` | Modal border radius | `12px` |
| `--modalete-title-color` | Title text color | `#f0f0ea` |
| `--modalete-message-color` | Message text color | `#e6edf3` |
| `--modalete-backdrop-bg` | Backdrop background | `rgba(0,0,0,0.6)` |
| `--modalete-btn-confirm-bg` | Confirm button background | `#3eb4ff` |
| `--modalete-btn-confirm-color` | Confirm button text color | `#111315` |
| `--modalete-btn-cancel-bg` | Cancel button background | `#4a4b4e` |
| `--modalete-btn-cancel-color` | Cancel button text color | `#f0f0ea` |

### Dark / Light theme example

```css
/* Light theme */
modalete-dialog {
    --modalete-bg:            #ffffff;
    --modalete-title-color:   #111111;
    --modalete-message-color: #444444;
}

/* Dark theme */
modalete-dialog {
    --modalete-bg:            #1e1e1e;
    --modalete-title-color:   #f0f0ea;
    --modalete-message-color: #e6edf3;
}

/* Respect system preference */
@media (prefers-color-scheme: light) {
    modalete-dialog {
        --modalete-bg:            #ffffff;
        --modalete-title-color:   #111111;
        --modalete-message-color: #444444;
    }
}
```
## Browser support

All modern browsers that support Custom Elements v1 and Shadow DOM.

## License

MIT
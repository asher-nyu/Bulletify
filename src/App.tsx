import { useEffect, useRef, useState } from 'react';
import { convertText } from './convertText';

const COPY_RESET_DELAY = 2000;

export default function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [buttonText, setButtonText] = useState('Convert & Copy');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    const brandMark = document.querySelector<HTMLElement>('.brand-mark');

    if (!textarea) {
      return;
    }

    const textareaElement = textarea;

    let selectAllOnFocus = true;
    let pageWasBlurred = !document.hasFocus();
    let activationClickGuard = false;
    let suppressNextClick = false;
    let activationClickTimer: number | undefined;

    if (favicon && brandMark) {
      brandMark.style.backgroundImage = `url("${favicon.href}")`;
    }

    function focusTextareaAndSelectAll() {
      requestAnimationFrame(() => {
        textareaElement.focus({ preventScroll: true });
        textareaElement.select();
      });
    }

    function guardActivationClick() {
      activationClickGuard = true;
      window.clearTimeout(activationClickTimer);
      activationClickTimer = window.setTimeout(() => {
        activationClickGuard = false;
      }, 120);
    }

    function handleWindowBlur() {
      pageWasBlurred = true;
      selectAllOnFocus = true;
      activationClickGuard = false;
      suppressNextClick = false;
    }

    function handleWindowFocus() {
      if (!pageWasBlurred) {
        return;
      }

      pageWasBlurred = false;
      selectAllOnFocus = true;
      guardActivationClick();
      focusTextareaAndSelectAll();
    }

    function handleActivationPointerDown(event: PointerEvent) {
      if (!activationClickGuard || event.detail > 1) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activationClickGuard = false;
      suppressNextClick = true;
      focusTextareaAndSelectAll();
    }

    function handleActivationClick(event: MouseEvent) {
      if (!activationClickGuard && !suppressNextClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activationClickGuard = false;
      suppressNextClick = false;
      focusTextareaAndSelectAll();
    }

    function handleBlurredPagePointerDown(event: PointerEvent) {
      if (!pageWasBlurred) {
        return;
      }

      if (event.detail > 1) {
        pageWasBlurred = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      pageWasBlurred = false;
      selectAllOnFocus = true;
      suppressNextClick = true;
      focusTextareaAndSelectAll();
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        pageWasBlurred = true;
        selectAllOnFocus = true;
      }
    }

    function handleTextareaFocus() {
      if (!selectAllOnFocus) {
        selectAllOnFocus = true;
        return;
      }

      focusTextareaAndSelectAll();
    }

    function handleTextareaBlur() {
      selectAllOnFocus = true;
    }

    function handleTextareaPointerDown(event: PointerEvent) {
      const isSingleClick = event.detail <= 1;
      const isAlreadyEditing = document.activeElement === textareaElement;

      selectAllOnFocus = isSingleClick && !isAlreadyEditing;
    }

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('pointerdown', handleActivationPointerDown, true);
    document.addEventListener('click', handleActivationClick, true);
    document.addEventListener('pointerdown', handleBlurredPagePointerDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    textareaElement.addEventListener('pointerdown', handleTextareaPointerDown);
    textareaElement.addEventListener('focus', handleTextareaFocus);
    textareaElement.addEventListener('blur', handleTextareaBlur);

    return () => {
      window.clearTimeout(activationClickTimer);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('pointerdown', handleActivationPointerDown, true);
      document.removeEventListener('click', handleActivationClick, true);
      document.removeEventListener('pointerdown', handleBlurredPagePointerDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      textareaElement.removeEventListener('pointerdown', handleTextareaPointerDown);
      textareaElement.removeEventListener('focus', handleTextareaFocus);
      textareaElement.removeEventListener('blur', handleTextareaBlur);
    };
  }, []);

  async function handleConvertClick() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const text = convertText(textarea.value);
    textarea.value = text;

    try {
      await navigator.clipboard.writeText(text);

      setButtonText('✓ Copied!');
      setButtonDisabled(true);

      window.setTimeout(() => {
        setButtonText('Convert & Copy');
        setButtonDisabled(false);
      }, COPY_RESET_DELAY);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Unable to copy to clipboard.');
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="app-title">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <h1 id="app-title">Bulletify</h1>
          </div>
        </header>

        <div className="editor-panel">
          <div className="field-head">
            <label htmlFor="input">Text</label>
          </div>
          <textarea
            ref={textareaRef}
            id="input"
            placeholder="Paste or edit text here..."
          />

          <div className="actions">
            <button id="convertBtn" disabled={buttonDisabled} onClick={handleConvertClick}>
              {buttonText}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

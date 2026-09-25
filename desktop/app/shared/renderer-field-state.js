(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgRendererFieldState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FIELD_SELECTOR = 'input, textarea, select';

  function documentFor(root) {
    return root?.nodeType === 9 ? root : root?.ownerDocument || null;
  }

  function dataSignature(field) {
    return Object.entries(field?.dataset || {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join('&');
  }

  function fieldSignature(field) {
    const tag = String(field?.tagName || '').toLowerCase();
    const type = String(field?.type || '').toLowerCase();
    const name = String(field?.getAttribute?.('name') || '');
    return `${tag}|${type}|${name}|${dataSignature(field)}`;
  }

  function listFields(root) {
    return [...(root?.querySelectorAll?.(FIELD_SELECTOR) || [])];
  }

  function capture(root) {
    const doc = documentFor(root);
    const activeElement = doc?.activeElement || null;
    const signatureCounts = new Map();
    return listFields(root).filter(field => !field.disabled && !field.readOnly).map(field => {
      const signature = fieldSignature(field);
      const ordinal = signatureCounts.get(signature) || 0;
      signatureCounts.set(signature, ordinal + 1);
      let selectionStart = null;
      let selectionEnd = null;
      let selectionDirection = 'none';
      try {
        selectionStart = field.selectionStart;
        selectionEnd = field.selectionEnd;
        selectionDirection = field.selectionDirection || 'none';
      } catch (_error) {
        // Einige Eingabetypen stellen keine Textauswahl bereit.
      }
      return {
        id: String(field.id || ''),
        signature,
        ordinal,
        value: String(field.value ?? ''),
        checked: Boolean(field.checked),
        selectedValues: field.multiple && field.options
          ? [...field.options].filter(option => option.selected).map(option => String(option.value))
          : null,
        active: field === activeElement,
        selectionStart,
        selectionEnd,
        selectionDirection
      };
    });
  }

  function restore(root, snapshots = []) {
    const fields = listFields(root);
    const byId = new Map(fields.filter(field => field.id).map(field => [String(field.id), field]));
    const bySignature = new Map();
    fields.forEach(field => {
      const signature = fieldSignature(field);
      if (!bySignature.has(signature)) bySignature.set(signature, []);
      bySignature.get(signature).push(field);
    });

    let activeField = null;
    let activeSnapshot = null;
    snapshots.forEach(snapshot => {
      const field = (snapshot.id && byId.get(snapshot.id))
        || bySignature.get(snapshot.signature)?.[snapshot.ordinal]
        || null;
      if (!field) return;
      if (String(field.type || '').toLowerCase() !== 'file') {
        try { field.value = snapshot.value; } catch (_error) { /* Nicht beschreibbarer Feldtyp. */ }
      }
      if ('checked' in field) field.checked = snapshot.checked;
      if (snapshot.selectedValues && field.options) {
        const selected = new Set(snapshot.selectedValues);
        [...field.options].forEach(option => { option.selected = selected.has(String(option.value)); });
      }
      if (snapshot.active) {
        activeField = field;
        activeSnapshot = snapshot;
      }
    });

    if (!activeField) return;
    try { activeField.focus({ preventScroll: true }); }
    catch (_error) { try { activeField.focus(); } catch (_focusError) { /* Feld wurde zwischenzeitlich entfernt. */ } }
    if (Number.isInteger(activeSnapshot.selectionStart) && Number.isInteger(activeSnapshot.selectionEnd)) {
      try {
        activeField.setSelectionRange(
          activeSnapshot.selectionStart,
          activeSnapshot.selectionEnd,
          activeSnapshot.selectionDirection
        );
      } catch (_error) {
        // Nicht alle Eingabetypen unterstützen setSelectionRange.
      }
    }
  }

  function renderPreservingFields(render, { root = globalThis.document } = {}) {
    const snapshots = capture(root);
    const result = render();
    restore(root, snapshots);
    return result;
  }

  return { capture, restore, renderPreservingFields, fieldSignature };
});

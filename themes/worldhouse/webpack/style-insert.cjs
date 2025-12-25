/**
 * WordPress block editor renders the block canvas inside an iframe:
 *   <iframe name="editor-canvas" ...>
 *
 * When using style-loader, CSS is normally injected into the *parent* document <head>.
 * That means your block styles don't affect the canvas iframe content.
 *
 * This file is used as style-loader's `insert` hook so every <style> tag is inserted
 * into the iframe document <head> instead.
 *
 * Design:
 * - style-loader creates <style> elements and calls this insert function with each element.
 * - We store those elements in a Set so we can re-attach them if the iframe reloads.
 * - We avoid polling:
 *   - We observe the parent document to detect when the iframe appears or is replaced.
 *   - We observe the iframe <head> to detect if our style elements are removed.
 *   - We listen to iframe `load` to re-wire observers after a reload.
 */

const insertedStyleElements = new Set();

/** Prevent wiring observers multiple times. */
let hasStarted = false;

/** Track currently active iframe/head so we can re-bind observers when they change. */
let currentIframe = null;
let currentHeadDocument = null;

/** Observes the iframe <head> for style removals. */
let headObserver = null;

/** Observes the parent document for iframe creation/replacement. */
let iframeObserver = null;

/**
 * Find the editor canvas iframe element.
 * WordPress uses name="editor-canvas" in the post editor (and often in the site editor too).
 */
function getCanvasIframe() {
  return document.querySelector('iframe[name="editor-canvas"]');
}

/**
 * Get the iframe document <head>, if available.
 * Returns null until the iframe exists and its contentDocument is ready.
 */
function getCanvasHead() {
  const iframe = getCanvasIframe();
  const doc = iframe && iframe.contentDocument;
  return doc && doc.head ? doc.head : null;
}

/**
 * Ensure every style-loader-generated <style> tag is attached to the *current* iframe head.
 * This handles:
 * - the iframe appearing late
 * - the iframe document being replaced (reload)
 * - our style tags being removed by something else
 */
function ensureStylesAttached() {
  const head = getCanvasHead();
  if (!head) return false;

  for (const styleEl of insertedStyleElements) {
    // If the element isn't in the current iframe head, re-append it.
    if (
      styleEl.parentNode !== head ||
      styleEl.ownerDocument !== head.ownerDocument
    ) {
      try {
        head.appendChild(styleEl);
      } catch {
        // If adoption fails due to timing, we’ll try again on next event.
      }
    }
  }

  return true;
}

/**
 * Observe the iframe <head> for removals.
 * If any of our tracked style tags are removed, we re-attach them.
 */
function observeHeadForRemovals(head) {
  if (headObserver) headObserver.disconnect();

  headObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type !== "childList") continue;

      for (const removed of m.removedNodes) {
        if (removed && insertedStyleElements.has(removed)) {
          ensureStylesAttached();
          return;
        }
      }
    }
  });

  headObserver.observe(head, { childList: true });
}

/**
 * (Re)wire head observer if the iframe document changes, and ensure styles are attached.
 */
function ensureAndObserve() {
  const head = getCanvasHead();
  if (!head) return;

  const headDoc = head.ownerDocument;
  if (currentHeadDocument !== headDoc) {
    currentHeadDocument = headDoc;
    observeHeadForRemovals(head);
  }

  ensureStylesAttached();
}

/**
 * Hook iframe `load` so that if the iframe reloads we re-bind observers and re-attach styles.
 */
function hookIframeLoad(iframe) {
  // Using a function ref is fine because we only attach when iframe changes.
  iframe.addEventListener("load", ensureAndObserve, { passive: true });
}

/**
 * Set the active iframe (if new), hook its load, then ensure styles are attached.
 */
function setActiveIframe(iframe) {
  if (currentIframe === iframe) return;

  currentIframe = iframe;
  hookIframeLoad(iframe);

  // The iframe might already be loaded; do an immediate attempt.
  ensureAndObserve();
}

/**
 * Start observers:
 * - Watch parent document for iframe appearing/replacing
 * - If iframe exists already, wire it immediately
 */
function start() {
  if (hasStarted) return;
  hasStarted = true;

  iframeObserver = new MutationObserver(() => {
    const iframe = getCanvasIframe();
    if (iframe) setActiveIframe(iframe);
  });

  iframeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // If iframe is already in DOM, hook it now.
  const iframe = getCanvasIframe();
  if (iframe) setActiveIframe(iframe);
}

/**
 * This is the function style-loader calls with the generated <style> element.
 * We register it and attempt to insert it into the iframe head.
 */
module.exports = function insertStyleElement(styleEl) {
  // Check if document.body exists (it may be null if DOM isn't ready)
  const isAdmin = document.body && document.body.classList.contains("wp-admin");  
  // If we're not in the admin, insert as normal
  if (!isAdmin) {
    const parent = document.querySelector("head");
    if (parent) {
      parent.appendChild(styleEl);
    }
    return;
  }
  
  insertedStyleElements.add(styleEl);

  start();
  ensureAndObserve();
};

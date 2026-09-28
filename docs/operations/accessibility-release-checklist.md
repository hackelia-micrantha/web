# Accessibility and responsive release checklist

Automated Playwright and axe contracts cover representative desktop/mobile
routes, shell interactions, 320px document containment, reduced motion,
hydration health, and JavaScript-disabled navigation/content. Some release
behaviors still require human inspection because browser/device assistive
technology semantics cannot be represented reliably by deterministic CI.

Run this checklist before a material public layout/navigation change, a design
system migration, or a production release that changes long-form rendering.

## Keyboard

- Navigate the full primary navigation, main content, linked cards, article
  links, and support/contact actions using only Tab, Shift+Tab, Enter, Space,
  and Escape.
- Confirm the skip link becomes visible on focus and moves focus to
  `main#content`.
- Confirm focus order follows reading order and no interactive element traps
  focus.
- Confirm visible focus indicators remain distinguishable on every surface.

## Screen reader

Use current VoiceOver on macOS/iOS or NVDA on Windows for representative:

- homepage;
- project collection;
- blog index;
- article containing a table/callout/diagram;
- security or privacy page;
- 404 page.

Confirm landmarks and headings provide a useful outline, linked cards expose a
single understandable action, tables announce row/column relationships, and
figures/diagrams retain understandable text alternatives.

## Zoom and reflow

At 200% and 400% browser zoom:

- confirm primary content reflows without document-level horizontal scrolling;
- confirm navigation remains usable;
- confirm text is not clipped, overlapped, or hidden;
- confirm code, tables, and diagrams scroll only inside their intended local
  regions when horizontal scrolling is necessary.

The automated 320px contract is evidence for narrow reflow but does not replace
browser zoom validation.

## Mobile Safari

On a current iPhone/iOS Safari:

- open and dismiss the navigation disclosure with touch and an attached
  keyboard when available;
- confirm safe viewport containment in portrait and landscape;
- confirm tap targets remain reachable without accidental overlap;
- inspect long-form tables and diagrams for local scrolling.

## Forced colors / high contrast

On a platform supporting forced-colors or high-contrast mode:

- confirm focus indicators, links, buttons, borders, and disclosure state remain
  perceivable;
- confirm meaning is not conveyed only through background color, gradients, or
  shadows.

## JavaScript disabled

Confirm:

- primary navigation and links remain usable;
- core article text and structured long-form content remain readable;
- Mermaid-enhanced diagrams expose their source/text fallback;
- error pages remain understandable.

## Slow network

Using browser throttling:

- confirm server-rendered primary content appears before client enhancement;
- confirm delayed analytics or Mermaid enhancement does not block reading or
  navigation;
- confirm layout remains stable enough to operate while assets load.

## Content expansion

Use long labels or browser text-size controls to exercise navigation, cards,
buttons, headings, metadata, and table cells. Confirm content wraps rather than
clipping or overlapping.

## Evidence

Record the browser/OS/assistive-technology versions and any failures in the
release PR or issue. A failed manual check is release evidence, not a cosmetic
observation; either fix it or document an explicit bounded exception.

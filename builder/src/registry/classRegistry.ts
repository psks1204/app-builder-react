// ============================================================
// ICG Class Registry — Complete whitelist of valid ICG classes
// ============================================================

/** Every valid ICG CSS class, organized by category. */
export const ICG_CLASS_REGISTRY: Record<string, string[]> = {

  /* ── Display ──────────────────────────────────────────── */
  display: [
    'lmn-d-none', 'lmn-d-block', 'lmn-d-flex', 'lmn-d-inline',
    'lmn-d-inline-block', 'lmn-d-inline-flex', 'lmn-d-table',
    // Responsive
    'lmn-d-sm-none', 'lmn-d-sm-block', 'lmn-d-sm-flex', 'lmn-d-sm-inline',
    'lmn-d-md-none', 'lmn-d-md-block', 'lmn-d-md-flex', 'lmn-d-md-inline',
    'lmn-d-lg-none', 'lmn-d-lg-block', 'lmn-d-lg-flex', 'lmn-d-lg-inline',
    'lmn-d-xl-none', 'lmn-d-xl-block', 'lmn-d-xl-flex', 'lmn-d-xl-inline',
  ],

  /* ── Flex ──────────────────────────────────────────────── */
  flex: [
    'lmn-flex-row', 'lmn-flex-column', 'lmn-flex-row-reverse', 'lmn-flex-column-reverse',
    'lmn-flex-wrap', 'lmn-flex-nowrap', 'lmn-flex-wrap-reverse',
    'lmn-justify-content-start', 'lmn-justify-content-center', 'lmn-justify-content-end',
    'lmn-justify-content-between', 'lmn-justify-content-around', 'lmn-justify-content-evenly',
    'lmn-align-items-start', 'lmn-align-items-center', 'lmn-align-items-end',
    'lmn-align-items-stretch', 'lmn-align-items-baseline',
    'lmn-align-self-start', 'lmn-align-self-center', 'lmn-align-self-end',
    'lmn-align-self-stretch', 'lmn-align-self-baseline',
    'lmn-flex-grow-0', 'lmn-flex-grow-1', 'lmn-flex-shrink-0', 'lmn-flex-shrink-1',
    'lmn-flex-fill',
  ],

  /* ── Grid ──────────────────────────────────────────────── */
  grid: [
    'lmn-container', 'lmn-container-fluid',
    'lmn-row', 'lmn-no-gutters',
    'lmn-col', 'lmn-col-1', 'lmn-col-2', 'lmn-col-3', 'lmn-col-4',
    'lmn-col-5', 'lmn-col-6', 'lmn-col-7', 'lmn-col-8', 'lmn-col-9',
    'lmn-col-10', 'lmn-col-11', 'lmn-col-12',
    'lmn-col-sm-1', 'lmn-col-sm-2', 'lmn-col-sm-3', 'lmn-col-sm-4',
    'lmn-col-sm-5', 'lmn-col-sm-6', 'lmn-col-sm-7', 'lmn-col-sm-8',
    'lmn-col-sm-9', 'lmn-col-sm-10', 'lmn-col-sm-11', 'lmn-col-sm-12',
    'lmn-col-md-1', 'lmn-col-md-2', 'lmn-col-md-3', 'lmn-col-md-4',
    'lmn-col-md-5', 'lmn-col-md-6', 'lmn-col-md-7', 'lmn-col-md-8',
    'lmn-col-md-9', 'lmn-col-md-10', 'lmn-col-md-11', 'lmn-col-md-12',
    'lmn-col-lg-1', 'lmn-col-lg-2', 'lmn-col-lg-3', 'lmn-col-lg-4',
    'lmn-col-lg-5', 'lmn-col-lg-6', 'lmn-col-lg-7', 'lmn-col-lg-8',
    'lmn-col-lg-9', 'lmn-col-lg-10', 'lmn-col-lg-11', 'lmn-col-lg-12',
    'lmn-col-xl-1', 'lmn-col-xl-2', 'lmn-col-xl-3', 'lmn-col-xl-4',
    'lmn-col-xl-5', 'lmn-col-xl-6', 'lmn-col-xl-7', 'lmn-col-xl-8',
    'lmn-col-xl-9', 'lmn-col-xl-10', 'lmn-col-xl-11', 'lmn-col-xl-12',
    'lmn-col-2xl-1', 'lmn-col-2xl-2', 'lmn-col-2xl-3', 'lmn-col-2xl-4',
    'lmn-col-2xl-5', 'lmn-col-2xl-6', 'lmn-col-2xl-7', 'lmn-col-2xl-8',
    'lmn-col-2xl-9', 'lmn-col-2xl-10', 'lmn-col-2xl-11', 'lmn-col-2xl-12',
  ],

  /* ── Spacing — Margin ──────────────────────────────────── */
  margin: [
    'lmn-m-0', 'lmn-m-2px', 'lmn-m-4px', 'lmn-m-8px', 'lmn-m-12px', 'lmn-m-16px',
    'lmn-m-24px', 'lmn-m-32px', 'lmn-m-40px', 'lmn-m-48px', 'lmn-m-56px', 'lmn-m-64px',
    'lmn-mt-0', 'lmn-mt-2px', 'lmn-mt-4px', 'lmn-mt-8px', 'lmn-mt-12px', 'lmn-mt-16px',
    'lmn-mt-24px', 'lmn-mt-32px', 'lmn-mt-40px', 'lmn-mt-48px', 'lmn-mt-56px', 'lmn-mt-64px',
    'lmn-mb-0', 'lmn-mb-2px', 'lmn-mb-4px', 'lmn-mb-8px', 'lmn-mb-12px', 'lmn-mb-16px',
    'lmn-mb-24px', 'lmn-mb-32px', 'lmn-mb-40px', 'lmn-mb-48px', 'lmn-mb-56px', 'lmn-mb-64px',
    'lmn-ml-0', 'lmn-ml-2px', 'lmn-ml-4px', 'lmn-ml-8px', 'lmn-ml-12px', 'lmn-ml-16px',
    'lmn-ml-24px', 'lmn-ml-32px', 'lmn-ml-40px', 'lmn-ml-48px', 'lmn-ml-56px', 'lmn-ml-64px',
    'lmn-mr-0', 'lmn-mr-2px', 'lmn-mr-4px', 'lmn-mr-8px', 'lmn-mr-12px', 'lmn-mr-16px',
    'lmn-mr-24px', 'lmn-mr-32px', 'lmn-mr-40px', 'lmn-mr-48px', 'lmn-mr-56px', 'lmn-mr-64px',
    'lmn-mx-0', 'lmn-mx-2px', 'lmn-mx-4px', 'lmn-mx-8px', 'lmn-mx-12px', 'lmn-mx-16px',
    'lmn-mx-24px', 'lmn-mx-32px', 'lmn-mx-auto',
    'lmn-my-0', 'lmn-my-2px', 'lmn-my-4px', 'lmn-my-8px', 'lmn-my-12px', 'lmn-my-16px',
    'lmn-my-24px', 'lmn-my-32px', 'lmn-my-auto',
  ],

  /* ── Spacing — Padding ─────────────────────────────────── */
  padding: [
    'lmn-p-0', 'lmn-p-2px', 'lmn-p-4px', 'lmn-p-8px', 'lmn-p-12px', 'lmn-p-16px',
    'lmn-p-24px', 'lmn-p-32px', 'lmn-p-40px', 'lmn-p-48px', 'lmn-p-56px', 'lmn-p-64px',
    'lmn-pt-0', 'lmn-pt-2px', 'lmn-pt-4px', 'lmn-pt-8px', 'lmn-pt-12px', 'lmn-pt-16px',
    'lmn-pt-24px', 'lmn-pt-32px', 'lmn-pt-40px', 'lmn-pt-48px', 'lmn-pt-56px', 'lmn-pt-64px',
    'lmn-pb-0', 'lmn-pb-2px', 'lmn-pb-4px', 'lmn-pb-8px', 'lmn-pb-12px', 'lmn-pb-16px',
    'lmn-pb-24px', 'lmn-pb-32px', 'lmn-pb-40px', 'lmn-pb-48px', 'lmn-pb-56px', 'lmn-pb-64px',
    'lmn-pl-0', 'lmn-pl-2px', 'lmn-pl-4px', 'lmn-pl-8px', 'lmn-pl-12px', 'lmn-pl-16px',
    'lmn-pl-24px', 'lmn-pl-32px', 'lmn-pl-40px', 'lmn-pl-48px', 'lmn-pl-56px', 'lmn-pl-64px',
    'lmn-pr-0', 'lmn-pr-2px', 'lmn-pr-4px', 'lmn-pr-8px', 'lmn-pr-12px', 'lmn-pr-16px',
    'lmn-pr-24px', 'lmn-pr-32px', 'lmn-pr-40px', 'lmn-pr-48px', 'lmn-pr-56px', 'lmn-pr-64px',
    'lmn-px-0', 'lmn-px-2px', 'lmn-px-4px', 'lmn-px-8px', 'lmn-px-12px', 'lmn-px-16px',
    'lmn-px-24px', 'lmn-px-32px',
    'lmn-py-0', 'lmn-py-2px', 'lmn-py-4px', 'lmn-py-8px', 'lmn-py-12px', 'lmn-py-16px',
    'lmn-py-24px', 'lmn-py-32px',
  ],

  /* ── Sizing ────────────────────────────────────────────── */
  sizing: [
    'lmn-w-25', 'lmn-w-50', 'lmn-w-75', 'lmn-w-100', 'lmn-w-auto',
    'lmn-h-25', 'lmn-h-50', 'lmn-h-75', 'lmn-h-100', 'lmn-h-auto',
    'lmn-mw-100', 'lmn-mh-100',
  ],

  /* ── Typography ────────────────────────────────────────── */
  typography: [
    'lmn-h1', 'lmn-h2', 'lmn-h3', 'lmn-h4', 'lmn-h5', 'lmn-h6',
    'lmn-display-1', 'lmn-display-2', 'lmn-display-3',
    'lmn-lead', 'lmn-ui-compact', 'lmn-ui-spacious',
  ],

  /* ── Text Utilities ────────────────────────────────────── */
  text: [
    'lmn-text-left', 'lmn-text-center', 'lmn-text-right',
    'lmn-text-nowrap', 'lmn-text-wrap', 'lmn-text-truncate',
    'lmn-font-weight-bold', 'lmn-font-weight-regular', 'lmn-font-weight-light',
    'lmn-font-italic',
    'lmn-font-size-10', 'lmn-font-size-12', 'lmn-font-size-14', 'lmn-font-size-16',
    'lmn-font-size-18', 'lmn-font-size-20', 'lmn-font-size-24', 'lmn-font-size-28',
    'lmn-font-size-32', 'lmn-font-size-36', 'lmn-font-size-40', 'lmn-font-size-48',
    'lmn-font-size-56', 'lmn-font-size-64', 'lmn-font-size-68',
  ],

  /* ── Font Family ───────────────────────────────────────── */
  fontFamily: [
    'lmn-font-body', 'lmn-font-heading', 'lmn-font-serif', 'lmn-font-condensed',
    'lmn-font-monospace', 'lmn-font-table', 'lmn-font-table-condensed',
  ],

  /* ── Colors ────────────────────────────────────────────── */
  colors: [
    'lmn-text-strong', 'lmn-text-weak', 'lmn-text-disabled',
    'lmn-text-success', 'lmn-text-warning', 'lmn-text-error',
    'lmn-heading-primary', 'lmn-heading-secondary',
    'lmn-text-link',
  ],

  /* ── Backgrounds ───────────────────────────────────────── */
  backgrounds: [
    'lmn-background', 'lmn-layer-primary', 'lmn-layer-secondary',
    'lmn-layer-brand-primary', 'lmn-layer-brand-secondary',
  ],

  /* ── Borders ───────────────────────────────────────────── */
  borders: [
    'lmn-border', 'lmn-border-top', 'lmn-border-right', 'lmn-border-bottom', 'lmn-border-left',
    'lmn-border-0',
    'lmn-border-primary', 'lmn-border-secondary', 'lmn-border-success',
    'lmn-border-warning', 'lmn-border-error',
    'lmn-rounded', 'lmn-rounded-top', 'lmn-rounded-right', 'lmn-rounded-bottom',
    'lmn-rounded-left', 'lmn-rounded-circle', 'lmn-rounded-0',
  ],

  /* ── Shadows ───────────────────────────────────────────── */
  shadows: [
    'lmn-shadow-none', 'lmn-shadow-raised', 'lmn-shadow-overlay',
  ],

  /* ── Position ──────────────────────────────────────────── */
  position: [
    'lmn-position-static', 'lmn-position-relative', 'lmn-position-absolute',
    'lmn-position-fixed', 'lmn-position-sticky',
    'lmn-fixed-top', 'lmn-fixed-bottom', 'lmn-sticky-top',
  ],

  /* ── Image ─────────────────────────────────────────────── */
  image: [
    'lmn-img-fluid', 'lmn-img-thumbnail', 'lmn-float-left', 'lmn-float-right',
  ],

  /* ── Visibility ────────────────────────────────────────── */
  visibility: [
    'lmn-visible', 'lmn-invisible',
  ],
};

/** Flat set of all valid ICG classes for O(1) lookup. */
const _allClasses = new Set(Object.values(ICG_CLASS_REGISTRY).flat());

/** Check whether a CSS class name is a valid ICG class. */
export const isValidIcgClass = (className: string): boolean => _allClasses.has(className);

/** Get all valid ICG classes as a flat array. */
export const getAllIcgClasses = (): string[] => [..._allClasses];

/** Get classes for a specific category. */
export const getClassesByCategory = (category: string): string[] =>
  ICG_CLASS_REGISTRY[category] ?? [];

/** Get the list of category names. */
export const getClassCategories = (): string[] => Object.keys(ICG_CLASS_REGISTRY);

/** Filter classes to only valid ICG classes (sanitize). */
export const sanitizeClasses = (classes: string[]): string[] =>
  classes.filter((c) => _allClasses.has(c));

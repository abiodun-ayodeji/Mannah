import DOMPurify from 'dompurify'

/**
 * Sanitize SVG markup so it's safe for dangerouslySetInnerHTML.
 * Allows only SVG elements/attributes and strips scripts, event handlers, etc.
 */
export function sanitizeSvg(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
  })
}

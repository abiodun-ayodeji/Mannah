const FEEDBACK_COUNT_KEY = 'mannah_feedback_count'
const SHOW_EVERY = 5

/** Increment the quiz counter and return true if we should show the prompt. */
export function shouldShowFeedback(): boolean {
  const count = parseInt(localStorage.getItem(FEEDBACK_COUNT_KEY) ?? '0', 10) + 1
  localStorage.setItem(FEEDBACK_COUNT_KEY, String(count))
  return count % SHOW_EVERY === 0
}

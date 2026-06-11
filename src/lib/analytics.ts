/**
 * Заглушка аналитики. В проде здесь был бы амплитуд/ га4 — контракт событий тот же.
 * Все ключевые шаги воронки инструментированы: см. вызовы track() по компонентам.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.info('[track]', event, props ?? {})
}

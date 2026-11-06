import { translations } from './translations.js'
export const LANGUAGE_KEY = 'akbope-language'
export function readLanguage(storage) {
  try { return (storage ?? globalThis.localStorage)?.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'kk' } catch { return 'kk' }
}
const requested = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('lang')
export const language = ['kk', 'en'].includes(requested) ? requested : readLanguage()
if (typeof document !== 'undefined') {
  document.documentElement.lang = language
  try { localStorage.setItem(LANGUAGE_KEY, language) } catch { /* Optional persistence. */ }
}
const dictionary = new Map()
for (const pair of translations) for (const source of pair) dictionary.set(source, pair)
dictionary.set('Сәлем, I’m Akbope.', ['Сәлем, мен Ақбөпе.', 'Hello, I’m Akbope.'])
dictionary.set('3D fantasy meadow with a treasure chest, elemental waystone and village. Бағыттауыш пернелермен жүріңіз, айналаға қарау үшін сүйреңіз, сандықты ашу үшін Enter басыңыз.', ['Сиқырлы жайлау: сандық, белгі және ауыл. Бағыттауыштармен жүр, сүйреп қара, Enter арқылы сандықты аш.', '3D fantasy meadow with a treasure chest, elemental waystone and village. Use arrow keys to walk, drag to look around, and press Enter to open the chest.'])
export function t(source, locale = language) {
  return dictionary.get(source)?.[locale === 'en' ? 1 : 0] ?? source
}
export function setLanguage(next) {
  if (!['kk', 'en'].includes(next) || next === language) return
  try { localStorage.setItem(LANGUAGE_KEY, next) } catch { /* URL remains usable without storage. */ }
  const url = new URL(location.href); url.searchParams.set('lang', next)
  location.assign(url.href)
}
export function format(source, values, locale = language) {
  return t(source, locale).replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? ''))
}
export function localHref(path) {
  const url = new URL(path, 'https://local.invalid')
  url.searchParams.set('lang', language)
  return url.pathname + url.search + url.hash
}

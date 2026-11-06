import React from 'react'
import { language, setLanguage } from './i18n.js'
export default function LanguageSwitch({ inline = false, panel }) {
  const choose = next => {
    if (next === language) return
    // Keep the inspected object open after the scene is rebuilt in its new language.
    if (panel) window.history.replaceState(null, '', `${location.pathname}${location.search}#${panel}`)
    setLanguage(next)
  }
  return <nav className={`language-switch ${inline ? 'language-switch-inline' : ''}`} aria-label={language === 'kk' ? 'Сайт тілі' : 'Website language'}>
    <button lang="kk" aria-label="Қазақша" aria-pressed={language === 'kk'} onClick={() => choose('kk')}>KK</button>
    <span aria-hidden="true">/</span>
    <button lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => choose('en')}>EN</button>
  </nav>
}

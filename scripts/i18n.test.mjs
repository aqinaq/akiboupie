import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { t, format, readLanguage, localHref, LANGUAGE_KEY } from '../src/i18n.js'
import { projectCopyKK } from '../src/projects.kk.js'
import { projects } from '../src/projects.js'

test('language defaults, persistence and unavailable storage', () => {
  assert.equal(readLanguage({ getItem: () => null }), 'kk')
  assert.equal(readLanguage({ getItem: key => key === LANGUAGE_KEY ? 'en' : null }), 'en')
  assert.equal(readLanguage({ getItem: () => 'invalid' }), 'kk')
  assert.equal(readLanguage({ getItem: () => { throw new Error('denied') } }), 'kk')
})
test('both languages, dynamic game messages and user text', () => {
  assert.equal(t('Су үзілісі', 'en'), 'Water break')
  assert.equal(t('Water break', 'kk'), 'Су үзілісі')
  assert.equal(t('Сәлем, I’m Akbope.', 'en'), 'Hello, I’m Akbope.')
  assert.equal(format('{0} / 6 жұп · {1} қадам', [3, 7], 'en'), '3 / 6 pairs · 7 moves')
  assert.equal(format('Істі өшіру: {0}', ['My note {1}'], 'en'), 'Remove task: My note {1}')
  assert.equal(t('My private note', 'kk'), 'My private note')
})
test('all nine Kazakh case studies retain translated content and screen evidence', () => {
  assert.equal(projects.length, 9)
  assert.equal(Object.keys(projectCopyKK).length, 9)
  for (const p of projects) {
    for (const key of ['description','overview','problem','audience','role','responsibility','strategy','technical','validation','outcome','result','accessibility','next','status','category','typeLabel']) assert.match(p[key], /[А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]/u, `${p.slug}.${key}`)
    assert.ok(p.screens.length)
    for (const screen of p.screens) { assert.ok(screen.src.startsWith('/')); assert.match(screen.note, /[А-Яа-я]/u) }
    assert.ok(p.url.startsWith('https://'))
  }
  assert.match(projects.find(p=>p.slug==='dos-optics').outcome, /қабылдамады/)
  assert.match(projects.find(p=>p.slug==='aielts').result, /ресми IELTS нәтижесі емес/)
  assert.match(projects.find(p=>p.slug==='bagyt').status, /сұрау жібермейді/)
})
test('language is preserved in internal links without dropping hashes or queries', () => {
  assert.equal(localHref('/#work'), '/?lang=kk#work')
  assert.equal(localHref('/work/focus10?ref=book'), '/work/focus10?ref=book&lang=kk')
})
test('English URL overrides stored Kazakh, including project modules', () => {
  const result = execFileSync(process.execPath, ['--input-type=module','-e', `
    globalThis.location = { search: '?lang=en' };
    globalThis.localStorage = { getItem: () => 'kk' };
    const { projects } = await import('./src/projects.js');
    const { language, t } = await import('./src/i18n.js');
    console.log(JSON.stringify({language, title:t('Су үзілісі'), description:projects[0].description}));
  `], {encoding:'utf8'})
  const data = JSON.parse(result)
  assert.equal(data.language, 'en'); assert.equal(data.title, 'Water break'); assert.match(data.description, /^A task and time-tracking/)
})

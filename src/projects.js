export const profile = {
  name: 'Akbope',
  education: 'Astana IT University · Senior year',
  location: 'Astana, Kazakhstan',
  availability: 'Available for selected freelance and junior product opportunities',
  telegram: 'https://t.me/meuseuk',
  linkedin: 'https://www.linkedin.com/in/akbope-bakytkeldy-b8a1332aa/',
  github: 'https://github.com/aqinaq',
  cv: '/akbope-detailed-cv.pdf'
}

const projectCatalog = [
  {
    slug: 'dos-optics', name: 'DOS Optics', label: 'Independent concept', category: 'Commerce · Retail experience', year: '2026', visual: 'optics', preview: '/projects/dos-optics.png', status: 'Proposal declined · Independent concept', url: 'https://dosoptics.vercel.app/',
    description: 'A multilingual retail concept for a Kazakhstan eyewear brand, joining a 3D catalog, salon discovery and vision-check booking in one experience.',
    role: 'Product strategy, art direction, UX/UI design and frontend development', capabilities: ['Responsive design', '3D product catalog', 'Kazakh, Russian & English', 'Appointment flow', 'Account & cart prototype'],
    alt: 'Abstract black eyewear frame floating on a cobalt blue field',
    overview: 'DOS Optics reframes an eyewear site as a connected customer journey: discover a frame, find a nearby salon, and book a vision check without losing context.',
    problem: 'Retail discovery, location information and appointment booking often live in separate journeys. The concept brings them into one coherent path.',
    audience: 'Kazakhstan customers comparing frames online and deciding when and where to visit a physical salon.',
    constraints: ['The work is an independent proposal, not a commissioned client project.', 'It needed to represent a seven-city footprint without overwhelming the main journey.', 'The experience is designed Kazakh-first, with room for additional locales.'],
    strategy: 'Use products as the entry point, then surface practical next steps at moments of intent. Store discovery and appointment booking behave as parts of the shopping experience, rather than utility pages hidden in navigation.',
    journey: ['Discover', 'Compare', 'Find a salon', 'Book a check', 'Visit'],
    decisions: [{title:'Product-first navigation',body:'Frames remain visually dominant while filters and categories stay compact.'},{title:'Local presence',body:'A seven-city directory makes proximity and availability easy to understand.'},{title:'A clear handoff',body:'Appointment prompts appear when a customer has enough context to act.'}],
    technical: 'A responsive, three-language frontend prototype with reusable catalog data, 3D product presentation, filtering, product detail, cart and account states, a seven-city salon directory and a privacy-aware appointment flow.',
    accessibility: 'The direction prioritizes keyboard-reachable controls, visible focus, legible product detail and motion that can be reduced. A production version would validate localized labels and booking consent with users.',
    result: 'DOS Optics declined the proposal. The prototype remains an independent portfolio concept with catalog, lens guide, salon, booking, account and cart journeys. Business results have not been measured; the concept is not an official DOS website.',
    learned: 'A retail experience becomes more useful when digital discovery acknowledges the physical decision that follows it.',
    next: 'Test frame comparison and booking with customers, then integrate live catalog and location data.'
  },
  {
    slug: 'mountain', name: 'Mountain', label: 'Full-stack learning product', category: 'Learning · Reading', year: '2026', visual: 'mountain', preview: '/projects/mountain.png', status: 'Independent project · Currently testing', url: 'https://mountain-sepia.vercel.app/',
    description: 'A private English-reading environment for books, articles and subtitles, with instant Kazakh translation and vocabulary review in context.',
    role: 'Product design and full-stack development', capabilities: ['EPUB, PDF & text import', 'Article import', 'Markdown & subtitles', 'Kazakh translation', 'Vocabulary & progress', 'Device connection'],
    alt: 'Minimal reading interface showing a selected word, translation and reading progress',
    overview: 'Mountain keeps reading, understanding and review in one quiet environment. Readers can bring a book, article or subtitle file, investigate a word without leaving the page, and save useful vocabulary for later.',
    problem: 'Looking up unfamiliar language often breaks concentration. Separate dictionary and flashcard tools add friction between understanding a passage and remembering it.',
    audience: 'Independent English learners who read longer texts and want a private, focused way to build vocabulary in context.',
    constraints: ['Imported files can vary widely in structure and quality.', 'Dictionary help needs to inform without taking over the page.', 'Personal libraries and reading progress require careful privacy choices.'],
    strategy: 'Design one continuous learning loop. A sample story and public-domain catalog explain the product before an import is required, while transparent storage controls keep the private library understandable.',
    journey: ['Import', 'Read', 'Tap a word', 'Understand', 'Save', 'Review'],
    decisions: [{title:'Reading stays central',body:'Definitions appear beside the text instead of replacing it.'},{title:'Context becomes memory',body:'Saved words retain the passage that made them relevant.'},{title:'Progress without pressure',body:'Tracking is informative and calm, not gamified for its own sake.'}],
    technical: 'The product handles EPUB, PDF, TXT, Markdown, subtitle and article ingestion, reading state, search, vocabulary records and one-time device connection as distinct flows joined by a shared content model.',
    accessibility: 'Reader preferences support comfortable text sizing and layout. Keyboard access, clear selection states and contrast are central; imported content remains private to the user’s library.',
    result: 'Currently testing. Learning outcomes have not been measured yet.',
    learned: 'The best assistance arrives in context and leaves quickly, allowing the reader to return to the text.',
    next: 'Improve import resilience, expand reading preferences and validate vocabulary review with longer-term readers.'
  },
  {
    slug: 'agylshyn', name: 'Agylshyn', label: 'Full-stack learning platform', category: 'Learning · Practice system', year: '2026', visual: 'agylshyn', preview: '/projects/agylshyn.png', status: 'Independent project · Live product', url: 'https://aqinaq.github.io/agylshyn/',
    description: 'A bilingual practice platform that turns Cambridge grammar, vocabulary and IELTS coursebooks into one connected learning loop.',
    role: 'Product design, learning-system design, content engineering and full-stack development', capabilities: ['Instant answer checking', 'Progressive hints', 'Mistake practice', 'Spaced repetition', 'Teacher dashboard', 'Kazakh & English', 'Offline PWA'],
    alt: 'Agylshyn learning platform overview showing its Kazakh-language introduction and course library statistics',
    overview: 'Agylshyn brings exercises from a broad Cambridge coursebook library into one browser-based workspace. Learners answer, get immediate feedback, revisit mistakes and build long-term recall without moving between disconnected tools.',
    problem: 'A coursebook provides strong material, but the learning loop around it is fragmented: checking answers, tracking progress, collecting mistakes and knowing what to review next all require separate effort.',
    audience: 'Kazakh- and English-speaking independent learners, IELTS students and teachers who want a clearer view of practice across multiple coursebooks.',
    constraints: ['Exercises extracted from source books need careful validation and deterministic repair.', 'Feedback should support learning without revealing every answer too early.', 'The core experience needs to remain useful without requiring an account or a constant connection.'],
    strategy: 'Treat every book as part of the same practice system. Instant checking creates the first feedback loop; progressive hints preserve productive effort; mistakes and saved words then return through focused practice and spaced repetition.',
    journey: ['Choose a book', 'Answer', 'Use a hint', 'Check', 'Review mistakes', 'Return with SRS'],
    decisions: [{title:'One library, one loop',body:'Grammar, vocabulary and IELTS materials share the same progress and review model.'},{title:'Help in stages',body:'Hints reveal structure and first letters before showing the full answer.'},{title:'Progress with evidence',body:'Accuracy, coverage, activity and weak areas stay distinct instead of collapsing into one score.'}],
    technical: 'A browser-first PWA combines structured exercise data, deterministic content-build tools, instant answer validation, local progress storage, import and export, offline caching and optional account sync. The interface supports both learner practice and a class-level teacher view.',
    accessibility: 'Inputs have descriptive labels, result changes are announced, keyboard states remain visible and active locations are identified. The bilingual interface, light and dark themes, and mobile navigation keep the experience usable across contexts.',
    result: 'Live learning platform with a connected book library, mistake review, spaced repetition, progress views, offline support and teacher workflows.',
    learned: 'A digital learning tool becomes more valuable when it strengthens the practice around trusted material instead of trying to replace the material itself.',
    next: 'Keep auditing extracted content, refine the review schedule with learner behaviour and test teacher insights with real classes.'
  },
  {
    slug: 'aielts', name: 'AIELTS', label: 'AI-assisted learning tool', category: 'AI · Language learning', year: '2026', visual: 'aielts', preview: '/projects/aielts.png', status: 'Independent project · Updated prototype', url: 'https://aielts-sigma.vercel.app/',
    description: 'A bilingual IELTS practice tool with speaking, writing and study modes, giving criterion-level AI feedback to Kazakh-speaking learners.',
    role: 'Product design, AI integration and frontend development', capabilities: ['Speech input', 'Writing analysis', 'Ready-made tasks', 'Study mode', 'Estimated practice band', 'Kazakh & English'],
    alt: 'Estimated practice band interface with an audio waveform on a deep violet field',
    overview: 'AIELTS helps Kazakh-speaking learners practice from their own prompt or a ready-made task, then understand stronger speaking and writing responses through criterion-level feedback and concrete corrections.',
    problem: 'Generic scores say little about what to change. Learners need feedback they can understand, trace to their response and turn into the next practice step.',
    audience: 'Kazakh-speaking IELTS learners who want more detailed practice feedback between lessons or independent study sessions.',
    constraints: ['AI feedback is fallible and must not be framed as an official assessment.', 'Audio and written responses are sensitive learning data.', 'Feedback needs to be specific without becoming cognitively overwhelming.'],
    strategy: 'Frame every output as practice guidance. Pair an estimated practice band with criterion-level explanation, corrections and a study path that turns feedback into the next action.',
    journey: ['Choose task', 'Respond', 'Analyse', 'Review criteria', 'Apply correction'],
    decisions: [{title:'Honest scoring language',body:'The interface says “estimated practice band,” never “official IELTS score.”'},{title:'Criteria before verdict',body:'Feedback explains fluency, vocabulary, grammar and task response separately.'},{title:'Localized guidance',body:'Kazakh-language context lowers the barrier to understanding nuanced feedback.'}],
    technical: 'The frontend orchestrates editable speech transcription, writing input, ready-made prompts, structured AI analysis, bilingual feedback and study states. Outputs are shaped into predictable criteria rather than displayed as raw model text.',
    accessibility: 'Speaking practice needs text alternatives and clear recording state. A production path should minimize audio retention, state data use plainly and let learners remove their attempts.',
    result: 'Prototype. The estimated practice band is not an official IELTS result, and accuracy has not been independently validated.',
    learned: 'Responsible AI product design is as much about limits and language as it is about model capability.',
    next: 'Validate feedback clarity with learners, strengthen uncertainty cues and add transparent retention controls.'
  },
  {
    slug: 'focus10', name: 'Focus10', label: 'Full-stack productivity app', category: 'Productivity · Business tools', year: '2026', visual: 'focus', preview: '/projects/focus10.png', status: 'Independent project · Live product', url: 'https://focus10-ten.vercel.app/',
    description: 'A task and time-tracking product with a no-sign-up live demo, built for freelancers who need evidence of where their working hours go.',
    role: 'Full-stack product development', capabilities: ['React', 'Express', 'PostgreSQL', 'Interactive demo', 'Authentication', 'Weekly reporting', 'CSV export', 'Automated API tests'],
    alt: 'Time tracker dashboard with active timer and a weekly bar chart',
    overview: 'Focus10 joins tasks, projects and time records so independent workers can move from “what should I do?” to “where did the week go?” without maintaining separate systems.',
    problem: 'Timers capture hours but often lose the work’s context. Task tools hold context but do not explain how time was actually spent.',
    audience: 'Freelancers and independent professionals balancing several projects and needing a practical view of billable and non-billable work.',
    constraints: ['Timing must feel instant and reliable.', 'Sessions and account data require secure handling.', 'Reports need to remain understandable with sparse or imperfect data.'],
    strategy: 'Connect each running timer to a concrete task and project. Let people experience the complete workflow in a private 30-day demo workspace before asking them to create an account.',
    journey: ['Plan task', 'Start timer', 'Work', 'Stop', 'Review week', 'Export'],
    decisions: [{title:'One-click tracking',body:'The primary action starts time with minimal setup.'},{title:'Context travels with time',body:'Every record remains connected to its task and project.'},{title:'Ownership by default',body:'CSV export gives users a portable copy of their own records.'}],
    technical: 'A React frontend connects to an Express API and PostgreSQL data model. Guest workspaces, account conversion, protected sessions, reporting queries, CSV export, a guided tour and automated API tests cover the core product path.',
    accessibility: 'Timer state is communicated with text as well as color. Controls are keyboard reachable, and account/session behavior is designed around clear ownership and predictable sign-out.',
    result: 'Live independent product with a bilingual marketing site, interactive sample workspace and account flow. Usage and productivity outcomes have not been measured yet.',
    learned: 'Time data becomes meaningful only when it remains attached to the intention behind the work.',
    next: 'Add stronger interruption handling, refine weekly insights and expand automated coverage around session edge cases.'
  }
]

const evidence = {
  focus10: {
    codeUrl: 'https://github.com/aqinaq/focus10',
    typeLabel: 'Working product',
    responsibility: 'I owned product definition, interaction design, the React interface, Express API, PostgreSQL model, authentication, testing and deployment.',
    alternatives: [
      'I rejected a signup-first trial because it hid the product before trust was earned; the guest workspace exposes the complete workflow immediately.',
      'I rejected an application-only check for concurrent timers because two requests can race; a per-user PostgreSQL advisory lock serializes starts and a partial unique index remains the final invariant.',
      'I rejected invented customer logos, testimonials and adoption numbers; the marketing site uses verifiable product and test evidence instead.'
    ],
    validation: 'The repository documents 127 automated tests against real PostgreSQL via PGlite. They cover guest mode, account conversion, validation, password hashing, session expiry, user isolation, timer invariants, reporting, CSV escaping, security headers and rate limiting.',
    outcome: 'A live bilingual product with a no-sign-up 30-day guest workspace, account conversion, weekly and 28-day reporting, RFC 4180 CSV export, secure sessions and database-enforced timer integrity.',
    metrics: ['127 automated tests', 'Advisory lock + partial unique index', '30-day private guest workspace', 'RFC 4180 CSV export'],
    screens: [
      { src: '/evidence/focus10-dashboard.png', alt: 'Focus10 dashboard with tasks, projects and a weekly chart', label: '01 / Connected workspace', note: 'Tasks, projects and time records share one working context.' },
      { src: '/evidence/focus10-timer.png', alt: 'Focus10 active timer controls', label: '02 / Timer state', note: 'The server remains authoritative; returning to the tab resynchronizes timer state.' },
      { src: '/evidence/focus10-reports.png', alt: 'Focus10 weekly report and project breakdown', label: '03 / Evidence and export', note: 'Weekly reporting stays readable and records remain portable through CSV.' }
    ],
    architecture: ['React client', 'Express API', 'Session + ownership checks', 'PostgreSQL invariants', 'Reports + RFC 4180 export']
  },
  agylshyn: {
    codeUrl: 'https://github.com/aqinaq/agylshyn',
    typeLabel: 'Working product',
    responsibility: 'I owned the learning-system design, bilingual UX, structured content pipeline, answer validation, progress model, offline behavior, teacher view and deployment checks.',
    alternatives: [
      'I kept questions anchored to their source books instead of pretending to replace the books; the product strengthens practice around trusted material.',
      'I removed content sets whose OCR could not be audited reliably rather than shipping a larger but less trustworthy library.',
      'I separated accuracy, coverage and weak areas instead of compressing learning into one motivational score.'
    ],
    validation: 'The content build reports 13 books, 937 units or test sections and 21,562 tracked questions. Automated checks cover data integrity, answer matching, mobile behavior, dialogs, mistakes, SRS, classes, bilingual explanations, progress persistence, audio and PDF sources; CI runs on pushes and pull requests.',
    outcome: 'A live bilingual learning platform with instant checking, progressive hints, mistake practice, spaced repetition, offline support, teacher workflows and an audited content pipeline.',
    metrics: ['21,562 tracked questions', '937 units and test sections', '13 books', 'Automated browser and data checks'],
    screens: [
      { src: '/evidence/agylshyn-library.png', alt: 'Agylshyn course library and learning overview', label: '01 / One library', note: 'Grammar, vocabulary and IELTS material enter the same practice system.' },
      { src: '/projects/agylshyn.png', alt: 'Agylshyn bilingual introduction and course statistics', label: '02 / Clear scope', note: 'Book, unit and question counts are generated from audited content.' }
    ],
    architecture: ['Structured book data', 'Practice + instant checks', 'Progressive hints', 'Mistake queue', 'Spaced repetition + teacher view']
  },
  mountain: {
    codeUrl: 'https://github.com/aqinaq/mountain',
    typeLabel: 'Working product',
    responsibility: 'I owned product design and the full-stack implementation: multi-format ingestion, the reading surface, translation and vocabulary tools, private libraries, device linking, testing and deployment.',
    alternatives: [
      'I parse and sanitize books into owned chapter HTML instead of embedding EPUB pages, which makes word-level interaction and selection reliable.',
      'I use a one-time device code instead of passwords so a private library can move between devices without a conventional signup flow.',
      'I keep reading and review in one product instead of sending learners between a reader, dictionary and flashcard app.'
    ],
    validation: 'Node tests target silent failure modes: malformed article markup, safe-fetch restrictions, account races, one-time code redemption and schema migration. Database race tests use a real temporary SQLite file.',
    outcome: 'A working private reader for EPUB, PDF, text, subtitles and articles with contextual Kazakh translation, full-text search, vocabulary export, spaced review, reading progress and offline chapter access.',
    metrics: ['5 import families', 'One-time device linking', 'SQLite FTS5 search', 'Three-card vocabulary review'],
    screens: [
      { src: '/evidence/mountain-library.png', alt: 'Mountain private reading library', label: '01 / Private library', note: 'A reader can start with a sample, import a file or browse public-domain books.' },
      { src: '/projects/mountain.png', alt: 'Mountain reading view with a contextual word translation', label: '02 / Help in context', note: 'Translation, pronunciation and saving appear without replacing the page.' }
    ],
    architecture: ['EPUB / PDF / text / article', 'Sanitized chapters', 'Reader + word index', 'Translation + vocabulary', 'Private library + offline cache']
  },
  'dos-optics': {
    codeUrl: 'https://github.com/aqinaq',
    typeLabel: 'Independent concept',
    responsibility: 'I independently created the product strategy, art direction, responsive UX, multilingual information architecture and frontend prototype.',
    alternatives: ['I connected product discovery to salon and booking actions instead of treating them as unrelated utility pages.'],
    validation: 'The prototype verifies responsive catalog, localization, filtering, salon discovery, cart, account and appointment states. It is not an official DOS Optics product and has no claimed business results.',
    outcome: 'The proposal was declined by DOS Optics. Retained as an independent portfolio concept demonstrating a multilingual retail journey across digital discovery and physical service.',
    metrics: ['3 interface languages', '7-city salon directory', 'Responsive catalog and booking'],
    screens: [{ src: '/projects/dos-optics.png', alt: 'DOS Optics product catalog concept', label: '01 / Retail journey', note: 'Product discovery leads toward a nearby salon and vision-check booking.' }]
  },
  aielts: {
    codeUrl: 'https://github.com/aqinaq/aielts',
    typeLabel: 'Experimental product',
    responsibility: 'I owned the bilingual product UX, speech and writing workflows, structured model outputs and responsible scoring language.',
    alternatives: ['I use estimated practice band and criterion-level explanations instead of presenting model output as an official IELTS score.'],
    validation: 'The prototype verifies the speaking, writing and study flows. AI feedback has not been independently validated against official IELTS assessment.',
    outcome: 'A working responsible-AI prototype that turns a model response into bounded, criterion-level practice guidance.',
    metrics: ['Speaking and writing modes', 'Kazakh and English', 'Criterion-level feedback'],
    screens: [{ src: '/projects/aielts.png', alt: 'AIELTS estimated practice band interface', label: '01 / Bounded feedback', note: 'The interface explains criteria and limitations before the learner acts on a score.' }]
  }
}

const projectOrder = ['focus10', 'agylshyn', 'mountain', 'dos-optics', 'aielts']

export const projects = projectOrder.map(slug => {
  const project = projectCatalog.find(item => item.slug === slug)
  return { ...project, ...evidence[slug], featured: projectOrder.indexOf(slug) < 3 }
})

export const experiments = [
  { name: 'OFF//RECORD', label: 'Fictional · Editorial design experiment', url: 'https://qedqed.netlify.app/', description: 'A fictional independent culture magazine exploring editorial typography, art direction and responsive storytelling.' },
  { name: 'Tesokeu', label: 'Reading-interface experiment', url: 'https://tesokeu.vercel.app/', description: 'A calm focus reader with a personal bookshelf, adjustable one-word-at-a-time pacing, bookmarks and reading insights.' }
]

export const capabilities = [
  { title: 'Product definition sprint', summary: 'Turn an early idea into a focused build plan.', items: ['Audience and problem framing', 'Core user journey', 'Feature priorities', 'Scope and delivery plan'] },
  { title: 'Product UI and prototype', summary: 'Make the experience tangible enough to test and align.', items: ['Responsive interface', 'Interaction design', 'Accessible states', 'Testable prototype'] },
  { title: 'MVP design and development', summary: 'Ship a working first product with one accountable owner.', items: ['Frontend and API', 'Database and authentication', 'Automated testing', 'Deployment'] }
]

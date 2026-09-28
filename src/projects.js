export const profile = { name: 'akbope', location: 'Almaty, Kazakhstan', telegram: 'https://t.me/meuseuk' }

export const projects = [
  {
    slug: 'dos-optics', name: 'DOS Optics', label: 'Independent client concept', category: 'Commerce · Retail experience', year: '2026', visual: 'optics', preview: '/projects/dos-optics.png', status: 'Independent proposal · Updated prototype', url: 'https://dosoptics.vercel.app/',
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
    result: 'Updated prototype with catalog, lens guide, salon, booking, account and cart journeys. Business results have not been measured; the concept is not an official DOS website.',
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

export const experiments = [
  { name: 'OFF//RECORD', label: 'Fictional · Editorial design experiment', url: 'https://qedqed.netlify.app/', description: 'A fictional independent culture magazine exploring editorial typography, art direction and responsive storytelling.' },
  { name: 'Tesokeu', label: 'Reading-interface experiment', url: 'https://tesokeu.vercel.app/', description: 'A calm focus reader with a personal bookshelf, adjustable one-word-at-a-time pacing, bookmarks and reading insights.' }
]

export const capabilities = [
  { title: 'Product', items: ['Product definition', 'User flows', 'Prototyping', 'Usability testing'] },
  { title: 'Design', items: ['Interface design', 'Responsive systems', 'Accessibility', 'Interaction design'] },
  { title: 'Engineering', items: ['Frontend development', 'Backend APIs', 'Authentication', 'Relational databases', 'Automated testing', 'Deployment'] },
  { title: 'AI', items: ['Structured AI feedback', 'Speech & text workflows', 'Prompt & output design', 'Responsible AI UX'] }
]

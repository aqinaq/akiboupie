#!/usr/bin/env python3
"""Build an editorial screen-first portfolio and a concise one-page resume."""
from pathlib import Path
from shutil import copyfile
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'
ASSETS=ROOT/'public/evidence'
FONT=Path('/Users/aruispan/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype')
for name,file in [('Sans','NotoSans-Regular.ttf'),('Bold','NotoSans-Bold.ttf'),('Serif','DejaVuSerif-Italic.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(FONT/file)))
BG='#F7F5F0'; INK='#192D29'; MUTED='#5C6B66'; GREEN='#266D58'; LINE='#D8DED5'; WHITE='#FFFFFF'
W,H=960,640
CONTACT=[('Portfolio','https://akiboupie.vercel.app/'),('LinkedIn','https://www.linkedin.com/in/akbope-bakytkeldy-b8a1332aa/'),('GitHub','https://github.com/aqinaq'),('Telegram','https://t.me/meuseuk')]
PROJECTS=[
 dict(name='Focus10',tag='PRODUCTIVITY / FULL-STACK PRODUCT',color='#E8E5FF',image='focus10-dashboard.png',url='https://focus10-ten.vercel.app/',title='Make working hours\nmean something.',summary='A task and time-tracking product for freelancers, connecting daily work to projects, weekly reports and exportable records.',role='Product definition, UX/UI and full-stack development',points=[('Try before signup','A private 30-day guest workspace makes the whole workflow available before registration.'),('Protect the data','PostgreSQL constraints and serialized timer starts keep concurrent sessions consistent.')],scope='React / Express / PostgreSQL / Authentication / CSV export',result='Working product with guest-to-account conversion, weekly reporting and 127 documented automated tests.'),
 dict(name='Agylshyn',tag='EDTECH / LEARNING SYSTEM',color='#E3EAF8',image='agylshyn-library.png',url='https://aqinaq.github.io/agylshyn/',title='Practice. Understand.\nCome back stronger.',summary='A bilingual learning system that connects coursebook exercises, hints, answer checking and mistake review.',role='Learning-system design, UX, content engineering and development',points=[('One learning loop','Different books share a consistent practice, feedback and progress model.'),('Support before answers','Progressive hints help learners understand the structure before revealing a solution.')],scope='Browser-first PWA / Structured content / Local progress / Offline support',result='13 books and 937 units or sections, with mistake practice, spaced repetition and teacher workflows.'),
 dict(name='Mountain',tag='LANGUAGE LEARNING / PRIVATE READER',color='#DDECE1',image='mountain-library.png',url='https://mountain-sepia.vercel.app/',title='Keep the context.\nKeep reading.',summary='A private English reader with contextual Kazakh translation and vocabulary review attached to the original passage.',role='Product design and full-stack development',points=[('Reading stays central','Word lookup sits beside the passage, keeping the learner in the reading flow.'),('Bring your own material','Books, articles and subtitles enter one connected private library.')],scope='Multi-format import / Translation / Vocabulary / Search / Device linking',result='Working reading environment with EPUB, PDF, text, article and subtitle workflows; ongoing testing.'),
 dict(name='Akanki',tag='LEARNING / LOCAL-FIRST APP',color='#E9E4F4',image='akanki.png',url='https://akanki.vercel.app/',title='Turn study material\ninto a habit.',summary='A free flashcard and quiz app for creating decks, importing materials and returning to spaced review.',role='Product design and frontend development',points=[('Flexible study input','Cards, scenario questions and text imports become searchable decks and quizzes.'),('Private by default','Decks and progress stay in the browser; PDF extraction does not upload study files.')],scope='JavaScript / localStorage / Spaced repetition / PDF.js / File imports',result='Independent browser app with four-rating review, multiple-choice quizzes and lecture-learning guides.'),
 dict(name='JORYQ Travel',tag='TRAVEL / BILINGUAL PORTFOLIO DEMO',color='#DDEBDD',image='joryq.png',url='https://joryq.vercel.app/',title='Explore the route.\nFeel the journey.',summary='A Kazakh/Russian travel experience that connects destination discovery, tour comparison and immersive stories.',role='Product design, interaction design and frontend development',points=[('Make choices tangible','Six tour pages combine route maps, day-by-day programmes and two-tour comparison.'),('Build a sense of place','Day/night landscapes, optional ambience and a local travel passport extend discovery.')],scope='React / TypeScript / Vite / Leaflet / Bilingual data / PNG export',result='Portfolio demo with illustrative tours and prices. Enquiries do not create real bookings.'),
 dict(name='MammaMia! Studio',tag='CREATIVE SERVICES / FICTIONAL CONCEPT',color='#DFE9F4',image='mammamia.png',url='https://mammamia-swart-delta.vercel.app/',title='A little sunshine.\nA clear next step.',summary='A bilingual concept for an Almaty photo studio, pottery workshop and painting space.',role='Art direction, UX/UI, motion and frontend development',points=[('Atmosphere with purpose','An Aegean-inspired identity and illustrated pottery animation introduce the studio.'),('Guide the enquiry','Service pages connect to a validated form with schedule rules and price calculation.')],scope='React / TypeScript / SVG motion / Pricing logic / WhatsApp handoff',result='Fictional studio demo with illustrative services, prices and schedules; no live booking backend.'),
 dict(name='BAGYT Academy',tag='EDUCATION / FICTIONAL ACADEMY CONCEPT',color='#F5E5D3',image='bagyt.png',url='https://bagyt-mauve.vercel.app/',title='Choose your\nnext direction.',summary='A Kazakh/Russian course-discovery concept for learners comparing language and creative programmes.',role='Product design, interaction design and frontend development',points=[('Start with a direction','An interactive compass and course filters make exploration approachable.'),('Compare before choosing','Two-course comparison and a three-question finder help narrow the options.')],scope='React / TypeScript / React Router / Bilingual data / Accessible dialogs',result='Fictional academy demo. Courses and fees are illustrative; consultation forms do not send requests.'),
 dict(name='DOS Optics',tag='RETAIL / INDEPENDENT CONCEPT',color='#E9E6DF',image='dos-optics.png',url='https://dosoptics.vercel.app/',title='From frame discovery\nto a salon visit.',summary='A multilingual retail concept connecting eyewear discovery, a 3D catalog and vision-check booking.',role='Product strategy, art direction, UX/UI and frontend development',points=[('Connect digital and physical','Frame discovery leads into a seven-city salon directory and appointment flow.'),('Design Kazakh-first','Catalog, product details, account and cart states work across three interface languages.')],scope='Responsive frontend / Localization / Catalog / Salon directory / Booking',result='DOS Optics declined the proposal. Retained as an independent portfolio concept; not commissioned or official.'),
 dict(name='AIELTS',tag='AI / EXPERIMENTAL LANGUAGE TOOL',color='#E8E3F4',image='aielts.png',url='https://aielts-sigma.vercel.app/',title='Practice with feedback\nyou can understand.',summary='A bilingual IELTS practice prototype combining speaking, writing and structured AI feedback for Kazakh-speaking learners.',role='Product design, AI integration and frontend development',points=[('Structure the feedback','Results separate vocabulary, grammar, fluency and task response into readable criteria.'),('Communicate limits','Estimated practice bands are presented as guidance, with explicit assessment limitations.')],scope='Speech and text / Transcription / Bilingual AI feedback / Study modes',result='Experimental prototype. Feedback has not been independently validated as official IELTS scoring.')
]

def rect(c,x,y,w,h,color,r=0):
 c.setFillColor(HexColor(color));c.roundRect(x,y,w,h,r,fill=1,stroke=0)
def text(c,s,x,y,size=12,font='Sans',color=INK):
 c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,y,s)
def para(c,s,x,top,width,size=12,color=INK,font='Sans',leading=None):
 p=Paragraph(s,ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.45,textColor=HexColor(color)))
 _,h=p.wrap(width,1000);p.drawOn(c,x,top-h);return top-h
def label(c,s,x,y,color=GREEN):text(c,s.upper(),x,y,8.5,'Bold',color)
def link(c,s,url,x,y,size=10,color=GREEN):
 text(c,s,x,y,size,'Bold',color);c.linkURL(url,(x,y-3,x+pdfmetrics.stringWidth(s,'Bold',size),y+size+3),relative=0)
def photo(c,path,x,y,w,h):
 if not path.exists():raise FileNotFoundError(path)
 with Image.open(path) as im:iw,ih=im.size
 scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
 c.drawImage(str(path),x+(w-dw)/2,y+(h-dh)/2,dw,dh,mask='auto')
def footer(c,page):
 rect(c,40,27,880,.7,LINE);text(c,'AKBOPE BAKYTKELDY / SELECTED WORK / 2026',40,13,8,color=MUTED)
 text(c,f'{page:02d} / 11',876,13,8,color=MUTED)
def base(c,page):rect(c,0,0,W,H,BG);footer(c,page)

def cover(c):
 base(c,1);label(c,'Product design + full-stack development',40,599)
 text(c,'Akbope',40,504,68,'Bold');text(c,'Bakytkeldy',40,426,58,'Serif',GREEN)
 para(c,'Thoughtful interfaces.<br/>Working products.',44,358,370,25,font='Bold',leading=34)
 para(c,'I take ideas from user flows and interface design to frontend, APIs, databases and testing.',44,251,332,14,color=MUTED)
 label(c,'Astana, Kazakhstan / AITU senior year',44,146)
 link(c,'View portfolio  /',CONTACT[0][1],44,102,12)
 rect(c,455,180,465,340,'#DEE7DB',18);photo(c,ASSETS/'focus10-dashboard.png',474,198,427,301)
 rect(c,557,62,350,193,'#192D29',12);photo(c,ASSETS/'agylshyn-library.png',570,74,324,169)
 c.showPage()

def project_page(c,p,i):
 base(c,i+2);label(c,p['tag'],40,598);text(c,f'{i+1:02d}',878,589,25,'Serif',GREEN)
 text(c,p['name'],40,548,31,'Bold')
 top=para(c,p['title'].replace('\n','<br/>'),40,507,281,24,font='Serif',leading=32)
 top=para(c,p['summary'],40,top-18,270,12.3,color=MUTED)
 label(c,'My role',40,top-29);top=para(c,p['role'],40,top-41,270,10.8)
 for heading,body in p['points']:
  top-=21;top=para(c,heading,40,top,270,11.5,font='Bold');top=para(c,body,40,top-6,270,10.7,color=MUTED)
 if top<64:raise ValueError(f"Text overflow: {p['name']} {top}")
 rect(c,342,187,578,337,p['color'],14);photo(c,ASSETS/p['image'],354,199,554,313)
 label(c,'System / scope',356,163);para(c,p['scope'],356,152,543,10.5,color=MUTED)
 rect(c,342,57,578,67,'#E6ECE2',10);para(c,p['result'],356,111,419,10.3,leading=14)
 link(c,'Open project /',p['url'],794,77,10)
 c.showPage()

def closing(c):
 base(c,11);label(c,'About / Contact',40,596)
 text(c,'Design it well.',40,493,58,'Bold');text(c,'Build it to work.',40,416,55,'Serif',GREEN)
 para(c,'Product-minded designer and developer building multilingual learning, productivity and service experiences.',44,351,530,20,leading=29)
 rect(c,664,230,256,314,'#E5EBDD',16);photo(c,ROOT/'public/akbope-portrait.jpg',682,250,220,269)
 label(c,'More explorations',44,245)
 link(c,'OFF//RECORD /','https://qedqed.netlify.app/',44,223,10.5)
 link(c,'Tesokeu /','https://tesokeu.vercel.app/',218,223,10.5)
 cols=[('PRODUCT + DESIGN','User flows, prototyping, responsive interfaces, interaction design and accessibility.'),('ENGINEERING','JavaScript, React, TypeScript, APIs, PostgreSQL, authentication and deployment.'),('EDUCATION','Astana IT University, senior-year student. Astana, Kazakhstan.')]
 for j,(head,body) in enumerate(cols):
  x=44+j*298;label(c,head,x,191);para(c,body,x,176,254,11.3,color=MUTED)
 for j,(s,u) in enumerate(CONTACT):link(c,s+' /',u,44+j*155,78,12)
 c.showPage()

def resume():
 path=OUT/'akbope-resume.pdf';c=canvas.Canvas(str(path),pagesize=A4)
 w,h=A4;margin=39;cw=w-2*margin
 c.setTitle('Akbope Bakytkeldy - Resume');c.setAuthor('Akbope Bakytkeldy')
 text(c,'Akbope Bakytkeldy',margin,h-58,27,'Bold')
 text(c,'Product Designer + Full-Stack Developer',margin,h-83,12,'Bold',GREEN)
 text(c,'Astana, Kazakhstan / Astana IT University, senior year',margin,h-105,9.5,color=MUTED)
 for j,(s,u) in enumerate(CONTACT):link(c,s,u,margin+j*113,h-126,9.5)
 y=h-149
 def section(s):
  nonlocal y
  label(c,s,margin,y);rect(c,margin,y-8,cw,.6,LINE);y-=22
 section('Profile')
 y=para(c,'Product-minded designer and developer taking independent products from user flows and interface design through frontend, APIs, databases and testing. Focused on multilingual learning, productivity and service experiences.',margin,y,cw,10,leading=14)-18
 section('Skills')
 y=para(c,'Design: product definition, user flows, prototyping, responsive UI, interaction design, accessibility.<br/>Development: JavaScript, TypeScript, React, Vite, Express, PostgreSQL, REST APIs, authentication, testing, deployment and offline-first PWA workflows.',margin,y,cw,9.6,leading=13.4)-18
 section('Selected independent projects / 2026')
 entries=[
 ('Focus10','Full-stack productivity product','Built a private guest workspace, task timers, weekly reporting and CSV export with React, Express and PostgreSQL; 127 documented automated tests.'),
 ('Agylshyn','Bilingual learning system','Connected 13 books and 937 units or sections through answer checking, progressive hints, mistake review, spaced repetition and offline practice.'),
 ('Mountain','Private language-learning reader','Designed and built multi-format reading, contextual Kazakh translation, vocabulary review, library search and device linking.'),
 ('Akanki','Local-first study app','Built deck editing, imports, spaced review, quizzes and browser-side PDF extraction; decks and progress remain on the device.'),
 ('JORYQ Travel','Interactive travel portfolio demo','Created bilingual tour discovery, comparison, Leaflet route maps, destination stories and postcard export; illustrative travel demo.')]
 for name,kind,body in entries:
  p=next(p for p in PROJECTS if p['name']==name)
  link(c,name,p['url'],margin,y,11);text(c,kind,margin+113,y,9.3,color=MUTED)
  y=para(c,body,margin,y-10,cw,9.4,leading=13)-13
 section('Additional design concepts')
 y=para(c,'<link href="https://mammamia-swart-delta.vercel.app/">MammaMia! Studio</link> - bilingual studio and workshop demo.<br/><link href="https://bagyt-mauve.vercel.app/">BAGYT Academy</link> - course discovery, comparison and programme finder.<br/><link href="https://dosoptics.vercel.app/">DOS Optics</link> - independent retail concept; proposal declined by the brand.<br/><link href="https://aielts-sigma.vercel.app/">AIELTS</link> - experimental bilingual AI practice feedback, not official scoring.',margin,y,cw,9.4,leading=13)-18
 section('Education')
 y=para(c,'Astana IT University / Senior-year student / Astana, Kazakhstan',margin,y,cw,9.6,leading=13)
 if y<30:raise ValueError(f'Resume overflow {y}')
 c.save();copyfile(path,ROOT/'public/akbope-resume.pdf');print(path)

def build():
 OUT.mkdir(parents=True,exist_ok=True)
 path=OUT/'akbope-product-fullstack-portfolio.pdf';c=canvas.Canvas(str(path),pagesize=(W,H))
 c.setTitle('Akbope Bakytkeldy - Product Design and Full-Stack Portfolio');c.setAuthor('Akbope Bakytkeldy')
 cover(c)
 for i,p in enumerate(PROJECTS):project_page(c,p,i)
 closing(c);c.save()
 copyfile(path,OUT/'akbope-portfolio.pdf');print(path);resume()
if __name__=='__main__':build()

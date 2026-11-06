#!/usr/bin/env python3
"""Build Akbope's detailed product design and full-stack development CV."""

from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "akbope-detailed-cv.pdf"
W, H = A4

PAPER = HexColor("#F4F7FA")
INK = HexColor("#132238")
MUTED = HexColor("#607086")
BURGUNDY = HexColor("#2563EB")
DEEP = HexColor("#10243E")
YELLOW = HexColor("#5EEAD4")
WHITE = HexColor("#F8FBFF")
LINE = Color(37 / 255, 99 / 255, 235 / 255, alpha=0.18)

M = 42
CW = W - 2 * M


def paragraph(c, text, x, y_top, width, size=9, leading=None, color=INK,
              font="Helvetica", bold=False):
    style = ParagraphStyle(
        "cv",
        fontName="Helvetica-Bold" if bold else font,
        fontSize=size,
        leading=leading or size * 1.38,
        textColor=color,
        alignment=TA_LEFT,
        spaceAfter=0,
        splitLongWords=True,
    )
    p = Paragraph(text, style)
    _, ph = p.wrap(width, H)
    p.drawOn(c, x, y_top - ph)
    return y_top - ph


def caps(c, text, x, y, color=MUTED, size=6.5, spacing=1.0):
    t = c.beginText(x, y)
    t.setFillColor(color)
    t.setFont("Helvetica-Bold", size)
    t.setCharSpace(spacing)
    t.textLine(text.upper())
    c.drawText(t)


def rule(c, y, x1=M, x2=W - M):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(x1, y, x2, y)


def section(c, title, y):
    caps(c, title, M, y, color=BURGUNDY, size=7.1, spacing=1.2)
    rule(c, y - 9)
    return y - 25


def footer(c, page):
    rule(c, 29)
    caps(c, "AKBOPE / PRODUCT DESIGN + FULL-STACK DEVELOPMENT", M, 16,
         color=MUTED, size=5.4, spacing=0.65)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6)
    c.drawRightString(W - M, 16, f"{page:02d} / 05")


def page_background(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def link(c, label, url, x, y, width=None, color=BURGUNDY):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(x, y, label)
    hit_w = width or c.stringWidth(label, "Helvetica-Bold", 7.2)
    c.linkURL(url, (x, y - 3, x + hit_w, y + 9), relative=0)


def bullets(c, items, x, y_top, width, size=8.1, leading=11.2, gap=5):
    y = y_top
    for item in items:
        c.setFillColor(BURGUNDY)
        c.rect(x, y - 6, 4, 4, fill=1, stroke=0)
        y = paragraph(c, item, x + 12, y, width - 12, size=size,
                      leading=leading, color=INK)
        y -= gap
    return y


def project(c, y, name, kind, year, role, summary, achievements, technical,
            status, url, status_color=DEEP):
    caps(c, f"{year} / {kind}", M, y, color=BURGUNDY, size=6.1, spacing=0.8)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(M, y - 31, name)

    right_x = M + 250
    caps(c, "ROLE", right_x, y - 7, color=MUTED, size=5.8, spacing=0.8)
    paragraph(c, role, right_x, y - 18, CW - 270, size=7.6,
              leading=10.5, color=INK)

    body_top = y - 52
    y_left = paragraph(c, summary, M, body_top, 190, size=8.1,
                       leading=11.7, color=MUTED)
    y_right = bullets(c, achievements, right_x, body_top, CW - 270,
                      size=7.4, leading=10.2, gap=3)
    body_bottom = min(y_left, y_right)

    tech_top = body_bottom - 9
    caps(c, "SYSTEM / TECHNICAL SCOPE", M, tech_top, color=MUTED,
         size=5.6, spacing=0.75)
    tech_bottom = paragraph(c, technical, M, tech_top - 10, CW - 100, size=7.1,
                            leading=10.2, color=INK)

    box_y = tech_bottom - 41
    c.setFillColor(status_color)
    c.roundRect(M, box_y, CW, 32, 7, fill=1, stroke=0)
    caps(c, "STATUS", M + 10, box_y + 13, color=YELLOW, size=5.1, spacing=0.7)
    paragraph(c, status, M + 60, box_y + 24, 345, size=6.2,
              leading=7.8, color=WHITE)
    c.setFillColor(YELLOW)
    c.setFont("Helvetica-Bold", 6.4)
    c.drawRightString(W - M - 12, box_y + 11, "VIEW PRODUCT")
    c.linkURL(url, (M, box_y, W - M, box_y + 32), relative=0)
    rule(c, box_y - 14)
    return box_y - 31


def first_page(c):
    page_background(c)
    c.setFillColor(DEEP)
    c.rect(0, H - 188, W, 188, fill=1, stroke=0)
    caps(c, "CURRICULUM VITAE / 2026", M, H - 41, color=YELLOW,
         size=6.5, spacing=1.1)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 40)
    c.drawString(M, H - 93, "Akbope Bakytkeldy")
    c.setFillColor(YELLOW)
    c.setFont("Times-Italic", 22)
    c.drawString(M, H - 125, "Product Designer + Full-Stack Developer")
    c.setFillColor(Color(1, 1, 1, alpha=0.70))
    c.setFont("Helvetica", 7.5)
    c.drawString(M, H - 154, "Astana, Kazakhstan  /  Astana IT University, senior year  /  Open to collaborations")

    contact_y = H - 174
    link(c, "PORTFOLIO", "https://akiboupie.vercel.app/", M, contact_y,
         color=WHITE)
    link(c, "LINKEDIN", "https://www.linkedin.com/in/akbope-bakytkeldy-b8a1332aa/",
         M + 88, contact_y, color=WHITE)
    link(c, "GITHUB", "https://github.com/aqinaq", M + 171, contact_y,
         color=WHITE)
    link(c, "TELEGRAM", "https://t.me/meuseuk", M + 245, contact_y,
         color=WHITE)

    y = section(c, "PROFILE", H - 220)
    paragraph(
        c,
        "Product-minded designer and full-stack developer who takes ideas from problem framing and user flows through interface design, implementation and testing. Builds independent products across EdTech, language learning, responsible AI, retail and productivity, with particular attention to bilingual experiences, accessibility, privacy and honest product communication.",
        M, y, CW - 45, size=9.5, leading=13.2, color=INK,
    )

    y = section(c, "EDUCATION + CORE CAPABILITIES", H - 340)
    col = (CW - 22) / 2
    caps(c, "EDUCATION", M, y, color=MUTED, size=5.8)
    paragraph(c, "<b>Astana IT University</b><br/>Senior-year student<br/>Astana, Kazakhstan", M, y - 13, col,
              size=8.4, leading=12, color=INK)
    caps(c, "PRODUCT + DESIGN", M + col + 22, y, color=MUTED, size=5.8)
    paragraph(c, "Product definition / user flows / prototyping / usability testing<br/>Interface design / responsive systems / interaction design / accessibility", M + col + 22, y - 13, col - 14,
              size=8.1, leading=11.5, color=INK)

    caps(c, "ENGINEERING", M, y - 78, color=MUTED, size=5.8)
    paragraph(c, "Frontend development / backend APIs / authentication<br/>Relational databases / automated testing / deployment<br/>Offline-first PWA workflows", M, y - 91, col - 14,
              size=8.1, leading=11.5, color=INK)
    caps(c, "TOOLS + SYSTEMS", M + col + 22, y - 78, color=MUTED, size=5.8)
    paragraph(c, "JavaScript / React / Vite / Express / PostgreSQL<br/>REST-style APIs / structured content pipelines / CSV export<br/>AI feedback and speech-text workflows", M + col + 22, y - 91, col - 14,
              size=8.1, leading=11.5, color=INK)

    exp_y = section(c, "INDEPENDENT PRODUCT EXPERIENCE", H - 505)
    project(
        c, exp_y, "DOS Optics", "COMMERCE / RETAIL EXPERIENCE", "2026",
        "Product strategy, art direction, UX/UI design and frontend development",
        "A multilingual retail concept for a Kazakhstan eyewear brand, connecting frame discovery, a 3D catalog, salon search and vision-check booking in one customer journey.",
        [
            "Designed a Kazakh-first, three-language responsive experience with catalog, filters, product details, cart and account states.",
            "Connected digital discovery to a seven-city salon directory and privacy-aware appointment flow.",
            "Created the concept independently and presented the idea to DOS Optics for consideration.",
        ],
        "Reusable catalog data, 3D product presentation, localized navigation, booking flow, salon directory and responsive frontend prototype.",
        "Proposal declined by DOS Optics; retained as an independent portfolio concept. Not commissioned or official.",
        "https://dosoptics.vercel.app/",
    )
    footer(c, 1)
    c.showPage()


def second_page(c):
    page_background(c)
    caps(c, "INDEPENDENT PRODUCT EXPERIENCE / CONTINUED", M, H - 43,
         color=BURGUNDY, size=6.8, spacing=1.0)

    y = H - 67
    y = project(
        c, y, "Focus10", "PRODUCTIVITY / BUSINESS TOOLS", "2026",
        "Full-stack product development",
        "A task and time-tracking product for freelancers who need to connect working hours to concrete tasks and projects, then understand the week through reports and exportable records.",
        [
            "Built a no-sign-up, private 30-day demo workspace so users can experience the full workflow before registering.",
            "Connected one-click timers to task and project context, weekly reporting and CSV export.",
            "Implemented account conversion, protected sessions, guided onboarding and automated API tests.",
        ],
        "React frontend, Express API, PostgreSQL data model, authentication, reporting queries, CSV export and automated API tests.",
        "Live independent product; bilingual marketing site, interactive demo and account flow available.",
        "https://focus10-ten.vercel.app/",
        status_color=INK,
    )

    y = project(
        c, y - 2, "Agylshyn", "LEARNING / PRACTICE SYSTEM", "2026",
        "Product design, learning-system design, content engineering and full-stack development",
        "A bilingual browser-based platform that turns Cambridge grammar, vocabulary and IELTS coursebooks into a connected practice, feedback and review system.",
        [
            "Unified multiple books through instant answer checking, progressive hints, mistake review and spaced repetition.",
            "Built deterministic content tooling, local progress storage, import/export, offline caching and optional account sync.",
            "Designed learner practice and teacher-facing progress views with keyboard and bilingual accessibility in mind.",
        ],
        "Browser-first PWA, structured exercise data, offline caching, validation tools, local progress, optional sync and responsive learner/teacher interfaces.",
        "Live product with mistake practice, spaced repetition, progress views, offline support and teacher workflows.",
        "https://aqinaq.github.io/agylshyn/",
    )

    footer(c, 2)
    c.showPage()


def third_page(c):
    page_background(c)
    caps(c, "INDEPENDENT PRODUCT EXPERIENCE / CONTINUED", M, H - 43,
         color=BURGUNDY, size=6.8, spacing=1.0)

    y = H - 67
    y = project(
        c, y, "Mountain", "LEARNING / READING", "2026",
        "Product design and full-stack development",
        "A private English-reading environment for books, articles and subtitles, with instant Kazakh translation and vocabulary review that stays attached to the original context.",
        [
            "Designed one learning loop across import, reading, contextual lookup, saving and review.",
            "Separated EPUB, PDF, text, Markdown, subtitle and article ingestion into resilient but connected flows.",
            "Prioritized reader preferences, calm progress, keyboard access and transparent private-library controls.",
        ],
        "Multi-format content ingestion, reading state, search, vocabulary records, contextual translation, reader preferences and one-time device connection.",
        "Independent product currently in testing; import resilience and long-term vocabulary review are next.",
        "https://mountain-sepia.vercel.app/",
    )

    y = project(
        c, y - 2, "AIELTS", "AI / LANGUAGE LEARNING", "2026",
        "Product design, AI integration and frontend development",
        "A bilingual IELTS practice tool for Kazakh-speaking learners, combining speaking, writing and study modes with structured criterion-level AI feedback.",
        [
            "Turned speech transcription, writing input and ready-made prompts into consistent practice workflows.",
            "Structured feedback by fluency, vocabulary, grammar and task response instead of exposing raw model output.",
            "Used the phrase 'estimated practice band' and explicit limitations to avoid presenting AI feedback as official assessment.",
        ],
        "Speech and text input, editable transcription, bilingual structured AI analysis, prompt workflows, criterion-level results and study states.",
        "Updated prototype; feedback is practice guidance and has not been independently validated as official scoring.",
        "https://aielts-sigma.vercel.app/",
    )

    y = section(c, "ADDITIONAL DESIGN EXPLORATIONS", y - 1)
    col = (CW - 40) / 2
    caps(c, "OFF//RECORD", M, y, color=INK, size=6.5)
    paragraph(c, "Fictional culture-magazine experiment exploring editorial typography, art direction and responsive storytelling.", M, y - 13, col - 32, size=7.3, leading=10.4, color=MUTED)
    link(c, "qedqed.netlify.app  /", "https://qedqed.netlify.app/", M, y - 58)
    caps(c, "TESOKEU", M + col + 55, y, color=INK, size=6.5)
    paragraph(c, "A calm focus reader with a personal bookshelf, adjustable pacing, bookmarks and reading insights.", M + col + 55, y - 13, col - 40, size=7.3, leading=10.4, color=MUTED)
    link(c, "tesokeu.vercel.app  /", "https://tesokeu.vercel.app/", M + col + 55, y - 58)

    footer(c, 3)
    c.showPage()


def fourth_page(c):
    page_background(c)
    caps(c, "INDEPENDENT PRODUCT EXPERIENCE / CONTINUED", M, H - 43,
         color=BURGUNDY, size=6.8, spacing=1.0)
    y = project(
        c, H - 67, "Akanki", "LEARNING / FLASHCARDS + QUIZZES", "2026",
        "Product design and frontend development",
        "A free, local-first flashcard and quiz app that connects deck creation, imported study materials, spaced review and self-check quizzes in one browser workspace.",
        [
            "Built deck and card editing, search, text/file imports and scenario-based quiz parsing.",
            "Connected four-rating spaced repetition, multiple-choice quizzes and local progress tracking.",
            "Added lecture-learning guides and browser-side PDF extraction without uploading study files.",
        ],
        "Browser-based application, localStorage decks and progress, CSV/TSV/text imports, Mozilla PDF.js extraction and responsive study interfaces.",
        "Independent browser app; study data stays locally on the user's device.",
        "https://akanki.vercel.app/",
    )
    project(
        c, y - 2, "JORYQ Travel", "TRAVEL / INTERACTIVE EXPERIENCE", "2026",
        "Product design, interaction design and frontend development",
        "A Kazakh/Russian travel portfolio demo for exploring Kazakhstan through tour discovery, route maps, comparison and immersive destination storytelling.",
        [
            "Designed six tour pages with filters, two-tour comparison and validated demo enquiry flows.",
            "Integrated Leaflet maps, schematic routes and bilingual place stories with sourced photography.",
            "Created day/night landscapes, opt-in ambience, a local travel passport and PNG postcard export.",
        ],
        "React, TypeScript, Vite, Leaflet/OpenTopoMap, bilingual tour data, local/session storage, accessible dialogs and reduced-motion interactions.",
        "Portfolio demo with illustrative itineraries and prices; requests do not create real bookings.",
        "https://joryq.vercel.app/",
    )
    footer(c, 4)
    c.showPage()


def fifth_page(c):
    page_background(c)
    caps(c, "INDEPENDENT PRODUCT EXPERIENCE / CONTINUED", M, H - 43,
         color=BURGUNDY, size=6.8, spacing=1.0)
    y = project(
        c, H - 67, "MammaMia! Studio", "SERVICES / CREATIVE STUDIO CONCEPT", "2026",
        "Art direction, UX/UI design, motion and frontend development",
        "A bilingual concept for a fictional Almaty photo studio and creative workshop, bringing photo-room rental, pottery and painting into a guided service-selection journey.",
        [
            "Designed Kazakh/Russian service pages, galleries and a schedule-aware enquiry form with price calculation.",
            "Created an Aegean-inspired visual identity and a scroll-driven illustrated pottery composition.",
            "Implemented form validation and a configurable WhatsApp handoff with reduced-motion support.",
        ],
        "React, TypeScript, Vite, routed service pages, bilingual configuration, schedule and pricing logic, SVG motion and responsive layouts.",
        "Fictional studio demo; schedule and prices are illustrative, with no live booking backend.",
        "https://mammamia-swart-delta.vercel.app/",
    )
    project(
        c, y - 2, "BAGYT Academy", "EDUCATION / COURSE DISCOVERY CONCEPT", "2026",
        "Product design, interaction design and frontend development",
        "A Kazakh/Russian website concept for a fictional learning academy, helping prospective learners explore language and creative courses and choose a next step.",
        [
            "Built an interactive course compass, programme filters and detailed course pages.",
            "Connected two-programme comparison with a three-question, rule-based programme finder.",
            "Designed a validated demo consultation flow, keyboard interactions and responsive navigation.",
        ],
        "React, TypeScript, Vite, React Router, bilingual programme data, browser preferences, accessible modal focus and reduced-motion transitions.",
        "Fictional academy demo; courses and fees are illustrative and consultations are not sent.",
        "https://bagyt-mauve.vercel.app/",
    )
    c.setFillColor(DEEP)
    c.roundRect(M, 51, CW, 54, 12, fill=1, stroke=0)
    caps(c, "CONTACT", M + 15, 87, color=YELLOW, size=5.8)
    paragraph(c, "Open to thoughtful product design, frontend and full-stack collaborations.", M + 15, 80, 305, size=8.2, leading=11, color=WHITE)
    link(c, "PORTFOLIO  /", "https://akiboupie.vercel.app/", W - M - 137, 69, color=YELLOW)
    link(c, "TELEGRAM  /", "https://t.me/meuseuk", W - M - 69, 69, color=YELLOW)

    footer(c, 5)
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("Akbope Bakytkeldy - Detailed Product Design and Full-Stack CV")
    c.setAuthor("Akbope Bakytkeldy")
    c.setSubject("Detailed CV covering product design and full-stack development projects")
    c.setCreator("Akbope CV")
    first_page(c)
    second_page(c)
    third_page(c)
    fourth_page(c)
    fifth_page(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()

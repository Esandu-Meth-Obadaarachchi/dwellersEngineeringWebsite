import { projects } from './projects'

/**
 * Site register — the drawing set.
 *
 * Each page is a sheet with its own number; each section on a page is a
 * gridline lettered A, B, C. The nav, the rail, the menu, the title
 * blocks and the home index all read from here, so the numbering can
 * never drift between them.
 */

type SectionDef = { id: string; nav: string }

type PageDef = {
  path: string
  nav: string
  /** The page's h1 and the first half of the document title. */
  title: string
  /** One line under the h1, and the card text on the home index. */
  summary: string
  /** Meta description for search results. */
  description: string
  sections: SectionDef[]
  /** A page with nothing to show yet stays out of the nav. */
  live?: () => boolean
}

const register: PageDef[] = [
  {
    path: '/',
    nav: 'Home',
    title: 'Dwellers Engineering',
    summary: 'Building with Integrity, Engineering with Excellence.',
    description:
      'Dwellers Engineering (Pvt) Ltd is a Sri Lankan engineering and construction company delivering civil and structural works, building construction, design coordination and project management, from concept to handover.',
    sections: [
      { id: 'build', nav: 'The Build' },
      { id: 'overview', nav: 'Overview' },
      { id: 'index', nav: 'The Set' },
      { id: 'enquire', nav: 'Enquire' },
    ],
  },
  {
    path: '/company',
    nav: 'Company',
    title: 'Company',
    summary: 'Who we are, what we stand for and how the work is organised.',
    description:
      'The Dwellers Engineering profile: vision and mission, core divisions, operational strategy, core values and our commitment to sustainability.',
    sections: [
      { id: 'about', nav: 'Profile' },
      { id: 'values', nav: 'Values' },
      { id: 'sustainability', nav: 'Sustainability' },
    ],
  },
  {
    path: '/services',
    nav: 'Services',
    title: 'Services',
    summary: 'Seven disciplines and one six-stage method, from concept to handover.',
    description:
      'Civil and structural engineering, building construction and renovation, design coordination, project management, interior fit-out, infrastructure and engineering consultancy.',
    sections: [
      { id: 'services', nav: 'Disciplines' },
      { id: 'method', nav: 'Method' },
    ],
  },
  {
    path: '/leadership',
    nav: 'Leadership',
    title: 'Leadership',
    summary: 'The directors, the technical appointments and the team behind every project.',
    description:
      'Meet the executive directors and technical specialists of Dwellers Engineering (Pvt) Ltd.',
    sections: [
      { id: 'directors', nav: 'Directors' },
      { id: 'expertise', nav: 'Expertise' },
      { id: 'team', nav: 'Our people' },
    ],
  },
  {
    path: '/projects',
    nav: 'Projects',
    title: 'Projects',
    summary: 'Selected work delivered by Dwellers Engineering.',
    description: 'A portfolio of projects delivered by Dwellers Engineering (Pvt) Ltd.',
    sections: [{ id: 'portfolio', nav: 'Portfolio' }],
    live: () => projects.length > 0,
  },
  {
    path: '/contact',
    nav: 'Contact',
    title: 'Contact',
    summary: 'Tell us the site, the brief and the programme.',
    description:
      'Contact Dwellers Engineering in Angoda, Sri Lanka, to discuss a construction or engineering project.',
    sections: [
      { id: 'enquiry', nav: 'Enquiry' },
      { id: 'office', nav: 'Office' },
    ],
  },
]

const GRID = 'ABCDEFGHJKLMNP' // I and O are skipped on drawings: they read as 1 and 0.

export type Section = SectionDef & { grid: string; sheet: string }
export type Page = Omit<PageDef, 'sections' | 'live'> & {
  sheet: string
  sections: Section[]
  live: boolean
}

const isLive = (p: PageDef) => (p.live ? p.live() : true)

// Live pages are numbered first, in register order; a hidden page takes
// the next number after them, so the live set always counts 01, 02, 03
// without a gap.
const ordered = [...register.filter(isLive), ...register.filter((p) => !isLive(p))]

export const allPages: Page[] = ordered.map((p, i) => {
  const sheet = String(i + 1).padStart(2, '0')
  return {
    ...p,
    sheet,
    live: isLive(p),
    sections: p.sections.map((s, j) => ({
      ...s,
      grid: GRID[j],
      sheet: `${sheet}.${j + 1}`,
    })),
  }
})

/** The pages shown in the nav, in order. */
export const pages = allPages.filter((p) => p.live)

export function pageFor(pathname: string): Page | undefined {
  const path = pathname.replace(/\/+$/, '') || '/'
  return allPages.find((p) => p.path === path)
}

export function sectionMeta(id: string): Section {
  for (const p of allPages) {
    const found = p.sections.find((s) => s.id === id)
    if (found) return found
  }
  throw new Error(`Unknown section: ${id}`)
}

/** The sheet after this one, wrapping back to the start. */
export function nextPage(path: string): Page {
  const i = pages.findIndex((p) => p.path === path)
  return pages[(i + 1) % pages.length]
}

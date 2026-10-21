/**
 * The project portfolio.
 *
 * Empty until real projects are added. While it is empty the Projects
 * page stays out of the nav, the menu and the home index, so the site
 * never shows visitors an unfinished page. Add the first entry here and
 * the page appears everywhere on its own.
 */

export type Project = {
  /** URL-safe id, e.g. 'angoda-residence'. */
  slug: string
  title: string
  location: string
  year: string
  /** One of the service names, so a project can be traced to a discipline. */
  category: string
  summary: string
  /** Path without extension under /public, e.g. '/assets/img/projects/angoda'.
   *  A .webp and a .jpg of the same name are expected. */
  cover?: string
}

export const projects: Project[] = []

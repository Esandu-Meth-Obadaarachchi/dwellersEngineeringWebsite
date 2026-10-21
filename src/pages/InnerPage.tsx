import type { ReactNode } from 'react'
import { allPages } from '../data/site'
import { PageHeader } from '../components/PageHeader'
import { NextSheet } from '../components/NextSheet'

/** Every inner sheet: its header, its sections, then the next sheet. */
export function InnerPage({ path, children }: { path: string; children: ReactNode }) {
  const page = allPages.find((p) => p.path === path)
  if (!page) throw new Error(`Unregistered page: ${path}`)

  return (
    <>
      <PageHeader page={page} />
      {children}
      <NextSheet from={path} />
    </>
  )
}

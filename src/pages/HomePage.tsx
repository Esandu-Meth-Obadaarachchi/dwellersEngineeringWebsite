import { Hero } from '../components/Hero'
import { BuildSequence } from '../components/BuildSequence'
import { Overview, SheetIndex, Enquire } from '../components/Home'

export function HomePage() {
  return (
    <>
      <Hero />
      <BuildSequence />
      <Overview />
      <SheetIndex />
      <Enquire />
    </>
  )
}

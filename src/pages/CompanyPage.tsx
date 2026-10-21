import { About } from '../components/About'
import { Values } from '../components/Values'
import { InnerPage } from './InnerPage'

export function CompanyPage() {
  return (
    <InnerPage path="/company">
      <About />
      <Values />
    </InnerPage>
  )
}

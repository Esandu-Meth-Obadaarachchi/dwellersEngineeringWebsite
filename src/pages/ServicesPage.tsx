import { Services, Method } from '../components/Services'
import { InnerPage } from './InnerPage'

export function ServicesPage() {
  return (
    <InnerPage path="/services">
      <Services />
      <Method />
    </InnerPage>
  )
}

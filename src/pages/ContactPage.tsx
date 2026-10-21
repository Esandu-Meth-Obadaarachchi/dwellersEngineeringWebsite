import { Enquiry, Office } from '../components/Contact'
import { InnerPage } from './InnerPage'

export function ContactPage() {
  return (
    <InnerPage path="/contact">
      <Enquiry />
      <Office />
    </InnerPage>
  )
}

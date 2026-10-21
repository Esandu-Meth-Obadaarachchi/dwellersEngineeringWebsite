import { Directors, Expertise, Team } from '../components/Leadership'
import { InnerPage } from './InnerPage'

export function LeadershipPage() {
  return (
    <InnerPage path="/leadership">
      <Directors />
      <Expertise />
      <Team />
    </InnerPage>
  )
}

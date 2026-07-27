import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Foundations } from '@/components/foundations'
import { Components } from '@/components/components-section'
import './home.css'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="page">
        <Hero />
        <Foundations />
        <Components />
      </main>
      <footer className="site-footer md-typescale-body-small">
        Built with Material Web (@material/web) — Material Design 3 for the web.
      </footer>
    </>
  )
}

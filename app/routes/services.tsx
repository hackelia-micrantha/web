import type { MetaFunction } from "@remix-run/node"
import { PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Services",
    description: "Request a consultation for Micrantha software services.",
    path: "/services",
  })

export const Services = () => (
  <div>
    <PageTitle
      title="Services"
      subtitle="Consulting for platform systems, mobile architecture, AI governance, and security-sensitive delivery work."
    />

    <section className="space-y-4">
      <h2 className="text-xl">Request a consultation</h2>
      <p>
        Send a consultation request to{" "}
        <a href="mailto:services@micrantha.com?subject=Consultation">
          services@micrantha.com
        </a>
        .
      </p>
      <a
        className="button"
        href="mailto:services@micrantha.com?subject=Consultation"
      >
        Email services@micrantha.com
      </a>
    </section>

    <section className="mt-8 space-y-4">
      <h2 className="text-xl">What to include</h2>
      <p>Include enough context for an informed first reply:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>the problem or project</li>
        <li>what we can help with</li>
        <li>how and when to contact you</li>
      </ul>
    </section>
  </div>
)

export default Services

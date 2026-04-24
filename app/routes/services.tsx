import type { MetaFunction } from "@remix-run/node"
import { PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Services",
    description:
      "Request a consultation for AI development, AI governance, mobile platform, secure systems, and production deployment services.",
    path: "/services",
  })

export const Services = () => (
  <div>
    <PageTitle
      title="Services"
      subtitle="Engineering support across AI development, AI governance, mobile platforms, secure systems, and production deployments."
    />

    <section className="space-y-4">
      <h2 className="text-xl">Request a consultation</h2>
      <p>
        Request a consultation if you need to turn a fragile product, platform,
        or workflow into a production system. Reach us at{" "}
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
        <li>the product, platform, or workflow you are building</li>
        <li>
          whether you need AI delivery, governance, mobile platform, security,
          or deployment support
        </li>
        <li>your timeline, constraints, and how to contact you</li>
      </ul>
    </section>

    <section className="mt-8 space-y-4">
      <h2 className="text-xl">Architecture notes</h2>
      <p>
        For a clearer sense of how Micrantha approaches governed delivery,
        integration boundaries, and long-lived software structure, see the{" "}
        <a href="/blog">Architecture Notes</a> series.
      </p>
      <p>
        A practical starting point is{" "}
        <a href="/blog/secure-platform-integration-is-not-plumbing">
          Secure Platform Integration Is Not Plumbing
        </a>
        , which outlines where modernization programs usually lose control.
      </p>
    </section>
  </div>
)

export default Services

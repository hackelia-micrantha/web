import type { MetaFunction } from "@remix-run/node"
import { PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Privacy Policy",
    description: "Privacy policy for Micrantha Software.",
    path: "/privacy",
  })

const Privacy = () => (
  <div>
    <PageTitle
      title="Privacy Policy"
      subtitle="How the public Micrantha website handles information and optional analytics."
    />

    <div className="space-y-8">
      <section className="space-y-4">
        <p>
          This policy describes the public <i>micrantha.com</i> website. The
          public site currently has no account registration or first-party
          profile/contact form that asks visitors to submit personal
          information.
        </p>
        <p>
          Last deployment verification for the analytics statements below:
          October 5, 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Website Analytics</h2>
        <p>
          Micrantha has an optional, pageview-only analytics integration, but it
          is currently disabled in the public deployment. When analytics is
          disabled, the site does not render the analytics script or a website
          identifier.
        </p>
        <p>
          The application source does not add custom analytics events, account
          or user identity, session replay, fingerprinting, or analytics
          browser storage. Micrantha will verify the deployed provider&apos;s
          data fields, identity behavior, retention, deletion, and proxy
          handling before treating analytics as enabled production behavior.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Request and Operational Data</h2>
        <p>
          Delivering and securing a website requires processing ordinary HTTP
          request metadata such as the requested URL, network address, browser
          or user-agent information, and request timing. Hosting, content
          delivery, and security infrastructure may process this information
          for delivery, abuse prevention, reliability, and diagnostics.
        </p>
        <p>
          This operational processing is separate from optional product
          analytics. This policy does not claim provider-specific retention or
          identity semantics that have not been verified.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Cookies and Browser Storage</h2>
        <p>
          The Micrantha application does not currently set analytics cookies or
          use <code>localStorage</code> or <code>sessionStorage</code> to create
          an analytics identity. Browser caching and infrastructure security
          mechanisms are separate from product analytics.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">External Services and Links</h2>
        <p>
          The site relies on infrastructure providers to deliver and protect
          the service and may link to third-party sites. External sites and
          services operate under their own privacy practices. Micrantha does
          not treat those external policies as evidence about its own optional
          analytics configuration.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Security</h2>
        <p>
          Micrantha uses technical and operational safeguards appropriate to
          the public website. No network transmission or storage system can be
          guaranteed absolutely secure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Children&apos;s Privacy</h2>
        <p>
          Micrantha services are not directed to children under 13, and
          Micrantha does not knowingly collect personal information from
          children under 13. If you believe a child has provided personal
          information, contact privacy@micrantha.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Changes to This Privacy Policy</h2>
        <p>
          Micrantha will update this page when materially relevant collection,
          analytics, retention, or service-provider behavior changes. In
          particular, optional analytics should not be treated as enabled until
          its deployed behavior has been re-verified and this policy remains
          accurate.
        </p>
      </section>

      <section className="space-y-3 border-t border-gray-200 pt-6">
        <h2 className="text-xl">Contact</h2>
        <p>
          Questions about this Privacy Policy can be sent to{" "}
          <a href="mailto:privacy@micrantha.com">privacy@micrantha.com</a>.
        </p>
      </section>
    </div>
  </div>
)

export default Privacy

import type { MetaFunction } from "@remix-run/node"
import { PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Privacy Policy",
    description: "Privacy policy for Micrantha Software.",
    path: "/privacy",
  })

const Privacy = () => {
  return (
    <div>
      <PageTitle
        title="Privacy Policy"
        subtitle="How Micrantha handles information across the public website and related services."
      />

      <div className="space-y-8">
        <section className="space-y-4">
          <p>
            Micrantha Software operates the <i>micrantha.com</i> website and
            related services.
          </p>
          <p>
            This page describes information handling for the public website.
            Related services may have additional operational requirements or
            provider-specific policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Information You Provide</h2>
          <p>
            Micrantha processes information you choose to provide, such as
            messages sent to Micrantha contact addresses, to respond to your
            request and operate the relevant service. Browsing the public
            website does not require you to provide a name, phone number, or
            postal address.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Request and Security Data</h2>
          <p>
            Requests to <i>micrantha.com</i> pass through hosting and security
            infrastructure. That infrastructure may process request metadata
            such as IP address, user agent, requested URL, referrer, timestamp,
            cache information, and security signals to deliver, protect, and
            troubleshoot the site.
          </p>
          <p>
            This operational request data is distinct from optional product
            analytics. Micrantha does not treat operational observability or
            security evidence as product-usage analytics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Product Analytics</h2>
          <p>
            Micrantha Web includes the Micrantha-owned Phenology browser client
            by default. Its reviewed v1 adapter is inert: it does not collect
            pageviews, export events, or connect to an analytics provider. The
            client is served from <i>analytics.micrantha.com</i> after the
            corresponding Worker and hostname are approved and deployed.
          </p>
          <p>
            The application does not supply a provider website identifier,
            custom analytics events, application user identity, session replay,
            fingerprinting, form contents, or an application-owned analytics
            browser-storage mechanism.
          </p>
          <p>
            Cloudflare Web Analytics is independently enabled for{" "}
            <i>micrantha.com</i>. It records browser page loads and performance
            through a Cloudflare-managed beacon on eligible pages, independently
            of the Micrantha-owned Phenology browser client. Changing or
            removing that client does not disable Cloudflare measurement.
          </p>
          <p>
            Provider-side session identity, IP and user-agent processing,
            referrer handling, retention, deletion, proxy behavior, and data
            residency are not asserted here until the deployed provider
            configuration is verified. Product analytics is not required for
            site rendering or navigation.
          </p>
          <p>
            The Phenology browser script is part of the site application by
            default. Disabling or changing it requires a reviewed source change
            and production release. Previously cached pages must expire or be
            invalidated before the published state can be treated as current.
            Cloudflare measurement is managed independently.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Cookies and Browser Storage</h2>
          <p>
            The Micrantha website application does not use cookies as its
            product-analytics identity mechanism. Hosting and security providers
            may use cookies or similar browser state when necessary for
            delivery, abuse prevention, or security challenges.
          </p>
          <p>
            Provider-specific cookie or persistent-identifier behavior is
            documented only when verified against the deployed configuration,
            rather than inferred from provider defaults.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Service Providers</h2>
          <p>
            Micrantha uses infrastructure providers to deliver and protect the
            public website. The current public site is served through
            Cloudflare, which necessarily processes request data needed to
            route, cache, and protect requests.
          </p>
          <p>
            The Phenology v1 client has no provider integration or event
            exporter. Any future provider connection requires a separate privacy
            and deployment decision. Other related Micrantha services may use
            different providers for their specific functions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Security</h2>
          <p>
            Micrantha uses reasonable technical and organizational measures to
            protect information. No networked service can guarantee absolute
            security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Links to Other Sites</h2>
          <p>
            The service may contain links to third-party sites. Following one of
            those links directs you to a site Micrantha does not operate. Review
            the privacy policy of every external site you visit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Children&apos;s Privacy</h2>
          <p>
            Micrantha services are not directed to children under 13, and
            Micrantha does not knowingly collect personal information from
            children under 13. If you believe a child has provided personal
            information, contact privacy@micrantha.com so Micrantha can take
            appropriate action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">Changes to This Privacy Policy</h2>
          <p>
            Micrantha may update this Privacy Policy as services, providers, or
            information-handling practices change. Changes become effective when
            they are posted on this page.
          </p>
        </section>

        <section className="space-y-3 border-t border-gray-200 pt-6">
          <h2 className="text-xl">Contact</h2>
          <p>
            Questions or suggestions about this Privacy Policy can be sent to{" "}
            <a href="mailto:privacy@micrantha.com">privacy@micrantha.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

export default Privacy

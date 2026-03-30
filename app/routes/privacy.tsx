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
      subtitle="How Micrantha collects, uses, and protects personal information across the website and related services."
    />

    <div className="space-y-8">
      <section className="space-y-4">
        <p>
          Micrantha Software operates the <i>micrantha.com</i> website and
          related services.
        </p>
        <p>
          This page explains how we collect, use, and disclose personal
          information when you use our services.
        </p>
        <p>
          By using the service, you agree to the collection and use of
          information in accordance with this policy. We use personal
          information to provide, operate, and improve the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Information Collection and Use</h2>
        <p>
          For a better experience while using our service, we may ask you to
          provide personally identifiable information, including your name,
          phone number, or postal address. We use that information to contact
          you, support the service, and improve the experience.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Log Data</h2>
        <p>
          When you visit the service, we may collect information your browser
          sends automatically. This can include your IP address, browser
          version, the pages you visit, the time and date of your visit, time
          spent on those pages, and similar diagnostic data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Cookies</h2>
        <p>
          Cookies are small data files commonly used as anonymous unique
          identifiers. They are sent to your browser from websites you visit and
          stored on your device.
        </p>
        <p>
          We use cookies to collect information and improve the service. You can
          accept or refuse cookies, and most browsers let you know when a cookie
          is being sent. If you refuse cookies, some parts of the service may
          not function as expected.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Service Providers</h2>
        <p>
          We may use third-party companies and individuals to help operate the
          service, provide the service on our behalf, perform service-related
          work, or assist us in understanding how the service is used.
        </p>
        <p>
          These providers may have access to personal information only as needed
          to perform those tasks for us, and they are expected not to disclose
          or use it for other purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Security</h2>
        <p>
          We use commercially reasonable measures to protect personal
          information. No method of transmission over the internet or method of
          electronic storage is completely secure, so we cannot guarantee
          absolute security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Links to Other Sites</h2>
        <p>
          The service may contain links to third-party sites. If you follow one
          of those links, you will be directed to a site we do not operate. We
          recommend reviewing the privacy policy of every external site you
          visit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to children under 13, and we do not
          knowingly collect personal information from children under 13. If you
          believe a child has provided us with personal information, contact us
          and we will take appropriate action.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes become
          effective when they are posted on this page.
        </p>
      </section>

      <section className="space-y-3 border-t border-gray-200 pt-6">
        <h2 className="text-xl">Contact Us</h2>
        <p>
          If you have questions or suggestions about this Privacy Policy,
          contact us at{" "}
          <a href="mailto:privacy@micrantha.com">privacy@micrantha.com</a>.
        </p>
      </section>
    </div>
  </div>
)

export default Privacy

import type { MetaFunction } from "@remix-run/node"
import { PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Security",
    description:
      "Security contact and responsible disclosure guidance for Micrantha Software.",
    path: "/security",
  })

const Security = () => (
  <div>
    <PageTitle
      title="Security"
      subtitle="If you believe you have found a security issue in a Micrantha system, report it here."
    />

    <p className="mt-8">
      Send vulnerability reports to{" "}
      <a className="underline" href="mailto:security@micrantha.com">
        security@micrantha.com
      </a>{" "}
      with <b>Security Report</b> in the subject line.
    </p>
    <p>
      Include the affected URL, product, component, impact, reproduction steps,
      proof-of-concept details, and any logs or screenshots that help Micrantha
      validate the issue quickly.
    </p>

    <p className="mt-8 font-bold">Scope</p>
    <p>
      This disclosure channel covers public Micrantha-owned websites,
      applications, and services. If you are unsure whether a system is in
      scope, include the hostname or repository reference in your report so
      Micrantha can clarify.
    </p>

    <p className="mt-8 font-bold">Good-Faith Research</p>
    <p>
      Micrantha welcomes good-faith security research that helps improve the
      security of Micrantha systems.
    </p>
    <p>Please avoid:</p>
    <ul>
      <li>accessing, modifying, or destroying other people&apos;s data</li>
      <li>disrupting service availability or degrading production systems</li>
      <li>social engineering, phishing, spam, or physical attacks</li>
      <li>using privacy-invasive or destructive proof-of-concept techniques</li>
    </ul>

    <p className="mt-8 font-bold">What to Expect</p>
    <p>
      Micrantha reviews reports, validates issues, and prioritizes remediation
      based on severity and impact. For coordinated disclosure, note that in the
      report and include your preferred contact details.
    </p>

    <p className="mt-8 font-bold">Bug Bounty</p>
    <p>
      Micrantha does not currently advertise a paid bug bounty program unless a
      separate written program states otherwise.
    </p>
  </div>
)

export default Security

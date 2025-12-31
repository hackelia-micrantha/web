import type { MetaFunction } from "@remix-run/node"

export const meta: MetaFunction = () => [
  { title: "Micrantha Software | Services" },
  {
    name: "description",
    content: "Request a consultation for Micrantha software services.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://micrantha.com/services",
  },
]

export const Services = () => (
  <div>
    <h1 className="text-2xl">Services</h1>
    <p>
      Request a consultation by sending an
      <a href="mailto:services@micrantha?subject=Consultation">
        email to services@micrantha.com
      </a>
      .
    </p>

    <p>Please describe:</p>
    <ul>
      <li>the problem or project</li>
      <li>what we can help with</li>
      <li>how and when to contact you</li>
    </ul>
  </div>
)

export default Services

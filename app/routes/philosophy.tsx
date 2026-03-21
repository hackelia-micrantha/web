import type { MetaFunction } from "@remix-run/node"
import { useEffect, useState } from "react"
import { buildPageMeta } from "~/utils/seo"

type WebsiteCarbonBadgeComponent =
  (typeof import("react-websitecarbon-badge"))["WebsiteCarbonBadge"]

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Philosophy",
    description:
      "Micrantha's philosophy on building software with quality, time, and cost in balance.",
    path: "/philosophy",
  })

const Philosophy = () => {
  const [mounted, setMounted] = useState(false)
  const [WebsiteCarbonBadge, setWebsiteCarbonBadge] =
    useState<WebsiteCarbonBadgeComponent | null>(null)

  useEffect(() => {
    setMounted(true)

    let isActive = true

    void import("react-websitecarbon-badge")
      .then((module) => {
        if (isActive) {
          setWebsiteCarbonBadge(() => module.WebsiteCarbonBadge)
        }
      })
      .catch(() => {})

    return () => {
      isActive = false
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl">Philosophy</h1>

      <h2 className="mt-8 text-xl">Purpose</h2>
      <p className="mt-8">
        Micrantha aims to generate passive income with services that are
        private, secure, functional, and continuously learning.
      </p>

      <h2 className="mt-8 text-xl">Triangle</h2>
      <p className="mt-8">
        The philosophy of making software is that it is done iteratively with a
        project management triangle of <b>quality</b>, <b>time</b>
        or <b>cost</b>.
      </p>

      <div className="float-right">
        <img
          src="/img/project-management-triangle-venn-diagram.svg"
          alt="project management triangle diagram"
          width="397"
          height="420"
          loading="lazy"
          decoding="async"
        />
      </div>

      <p className="mt-8">
        For the people at Micrantha it is a creative process, forming inherently
        through <b>enjoyment</b>
        <sub>
          <a href="#enjoyment">1</a>
        </sub>
        , <b>enthusiasm</b>
        <sub>
          <a href="#enthusiasm">2</a>
        </sub>{" "}
        or <b>acceptance</b>
        <sub>
          <a href="#acceptance">3</a>
        </sub>
        .
      </p>

      <h2 className="mt-8 text-xl">Metaphor</h2>
      <p className="mt-8">
        An analogy to the software development we do is gardening, growing
        creations over time.
      </p>

      <dl className="mt-8">
        <dt className="font-bold">Flower</dt>
        <dd className="mr-8">Code names for solutions</dd>
        <dt className="font-bold">Soil</dt>
        <dd className="mr-8">The groundwork that helps produces a solution</dd>
        <dt className="font-bold">Seed</dt>
        <dd className="mr-8">The design of a solution</dd>
        <dt className="font-bold">Water</dt>
        <dd>The flow of resources around a solution</dd>
        <dt className="font-bold">Sunlight</dt>
        <dd className="mr-8">The viability and visibility of a solution</dd>
        <dt className="font-bold">Garden</dt>
        <dd>A collection of soil, seeds and flowers</dd>
      </dl>

      <div className="text-xs mt-8 float-right">
        <p>
          [
          <a id="enjoyment" href="#enjoyment">
            1
          </a>
          ] <b>Enjoyment &rarr; Quality</b>: a quality solution is enjoyable
        </p>
        <p>
          [
          <a id="enthusiasm" href="#enthusiasm">
            2
          </a>
          ] <b>Enthusiasm &rarr; Time</b>: there is more time when enthused
        </p>
        <p>
          [
          <a id="acceptance" href="#acceptance">
            3
          </a>
          ] <b>Acceptance &rarr; Cost</b>: there is a need to
        </p>
      </div>

      <div className="mt-8 mb-16 flex items-center justify-center">
        <img
          alt="login"
          src="/img/micrantha.png"
          width="580"
          height="214"
          loading="lazy"
          decoding="async"
        />
      </div>

      {mounted && WebsiteCarbonBadge ? (
        <WebsiteCarbonBadge
          url="https://micrantha.com"
          co2="0.003"
          percentage="97"
        />
      ) : null}
    </div>
  )
}

export default Philosophy

import type { MetaFunction } from "@remix-run/node"
import { useEffect, useState } from "react"
import { PageTitle } from "~/components"
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
      <PageTitle
        title="Philosophy"
        subtitle="Work that compounds through clear tradeoffs, iterative delivery, and durable foundations."
      />

      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl">Purpose</h2>
          <p>
            Micrantha aims to build durable software services that are private,
            secure, functional, and continuously learning.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl">Triangle</h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_397px] lg:items-start">
            <div className="space-y-4">
              <p>
                Software is built iteratively inside a project triangle of{" "}
                <b>quality</b>, <b>time</b>, and <b>cost</b>. The work improves
                when those tradeoffs are explicit instead of implied.
              </p>
              <p>
                For the people at Micrantha, that process is shaped by{" "}
                <b>enjoyment</b>
                <sub>
                  <a id="enjoyment" href="#enjoyment">
                    1
                  </a>
                </sub>
                , <b>enthusiasm</b>
                <sub>
                  <a id="enthusiasm" href="#enthusiasm">
                    2
                  </a>
                </sub>{" "}
                and <b>acceptance</b>
                <sub>
                  <a id="acceptance" href="#acceptance">
                    3
                  </a>
                </sub>
                .
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  [1] <b>Enjoyment → Quality</b>: quality work is enjoyable to
                  build and maintain.
                </p>
                <p>
                  [2] <b>Enthusiasm → Time</b>: motivated teams sustain effort
                  and momentum longer.
                </p>
                <p>
                  [3] <b>Acceptance → Cost</b>: real constraints demand
                  deliberate tradeoffs.
                </p>
              </div>
            </div>

            <img
              src="/img/project-management-triangle-venn-diagram.svg"
              alt="Project management triangle diagram"
              width="397"
              height="420"
              loading="lazy"
              decoding="async"
              className="mx-auto"
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl">Metaphor</h2>
          <p>
            Our working metaphor is gardening: software grows through repeated
            care, environmental support, and patient cultivation over time.
          </p>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="font-bold">Flower</dt>
              <dd>Code names for solutions.</dd>
            </div>
            <div>
              <dt className="font-bold">Soil</dt>
              <dd>The groundwork that helps produce a solution.</dd>
            </div>
            <div>
              <dt className="font-bold">Seed</dt>
              <dd>The design of a solution.</dd>
            </div>
            <div>
              <dt className="font-bold">Water</dt>
              <dd>The flow of resources around a solution.</dd>
            </div>
            <div>
              <dt className="font-bold">Sunlight</dt>
              <dd>The viability and visibility of a solution.</dd>
            </div>
            <div>
              <dt className="font-bold">Garden</dt>
              <dd>A collection of soil, seeds, and flowers.</dd>
            </div>
          </dl>
        </section>

        <div className="flex items-center justify-center border-t border-gray-200 pt-8">
          <img
            alt="Micrantha wordmark"
            src="/img/micrantha.png"
            width="580"
            height="214"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {mounted && WebsiteCarbonBadge ? (
        <div className="mt-8">
          <WebsiteCarbonBadge
            url="https://micrantha.com"
            co2="0.003"
            percentage="97"
          />
        </div>
      ) : null}
    </div>
  )
}

export default Philosophy

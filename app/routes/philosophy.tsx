import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { PageTitle } from "~/components";
import { buildPageMeta } from "~/utils/seo";

type WebsiteCarbonBadgeComponent =
  (typeof import("react-websitecarbon-badge"))["WebsiteCarbonBadge"];

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Philosophy",
    description:
      "Micrantha's approach to secure backend, platform, and AI-governance engineering.",
    path: "/philosophy",
  });

const Philosophy = () => {
  const [mounted, setMounted] = useState(false);
  const [WebsiteCarbonBadge, setWebsiteCarbonBadge] =
    useState<WebsiteCarbonBadgeComponent | null>(null);

  useEffect(() => {
    setMounted(true);

    let isActive = true;

    void import("react-websitecarbon-badge")
      .then((module) => {
        if (isActive) {
          setWebsiteCarbonBadge(() => module.WebsiteCarbonBadge);
        }
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div>
      <PageTitle
        title="About Micrantha"
        subtitle="Principal backend, platform, and AI-governance engineering grounded in concrete systems work."
      />

      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl">Operating Position</h2>
          <p>
            Micrantha focuses on trust-sensitive software foundations: backend
            services, client-server integration, platform automation, secure
            delivery, and AI-assisted workflows that remain auditable and under
            human control.
          </p>
          <p>
            The strongest work sits where product teams need leverage without
            weakening correctness: authentication and authorization paths,
            integration control surfaces, release workflows, evidence capture,
            replayability, and policy boundaries around automation.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl">Evidence</h2>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="font-bold">AI governance</dt>
              <dd>
                Anthesis models agentic SDLC work around governed autonomy,
                approvals, replayability, auditability, deterministic execution,
                and explicit human authority.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Platform engineering</dt>
              <dd>
                Hyperion and Dubnium provide hands-on lab infrastructure for
                GitOps-style operations, secret-management design, reproducible
                environments, and local AI platform experimentation.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Backend and repository control</dt>
              <dd>
                Repora explores repository mirroring, metadata governance,
                RFC/ADR-driven control planes, and provider-neutral operations.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Client-server trust</dt>
              <dd>
                Amaryllis, Bluebell, Digitalis, and Myotosis keep mobile
                inference, attestation, SDK behavior, and LLM tool boundaries
                inside explicit platform contracts.
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl">Triangle</h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_397px] lg:items-start">
            <div className="space-y-4">
              <p>
                Software is built iteratively inside a project triangle of{" "}
                <b>quality</b>, <b>time</b>, and <b>cost</b>. The work improves
                when those tradeoffs are explicit instead of implied, especially
                in systems where security, operational reliability, and AI
                reviewability are part of the product surface.
              </p>
              <p>
                The traditional iron triangle is treated as a management
                constraint, not a slogan. Calathea exists to make that
                constraint operational: it helps decide what work deserves focus
                now, what should wait, and what should be corrected when reality
                changes.
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
          <h2 className="text-xl">Naming</h2>
          <p>
            Micrantha names work according to the kind of thing it is. The names
            are a lightweight taxonomy: they make the role of a project easier
            to remember without turning the system into a rigid brand scheme.
          </p>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="font-bold">Plants and flowers</dt>
              <dd>
                Software systems, services, and tools are usually named from
                living things. Anthesis, Calathea, Bluebell, Amaryllis, and
                Myotosis belong to this line.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Elements</dt>
              <dd>
                Hardware is named from the periodic table. Dubnium is the local
                server/workstation element; Zirconium names the phone, and
                Technetium names the laptop.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Gardens</dt>
              <dd>
                Collections, operating contexts, and supporting environments use
                garden language because they contain the conditions that let the
                work grow.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Laboratory</dt>
              <dd>
                Active experiments live in the laboratory until their purpose,
                constraints, and tradeoffs are clear enough to keep or recycle.
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl">Metaphor</h2>
          <p>
            Our working metaphor is gardening: software grows through repeated
            care, environmental support, and patient cultivation over time. In
            practice, that means keeping foundations healthy: interfaces,
            workflows, domain rules, infrastructure, security controls, and
            governance evidence all need tending.
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
  );
};

export default Philosophy;

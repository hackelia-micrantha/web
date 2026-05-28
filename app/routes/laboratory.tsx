import type { MetaFunction } from "@remix-run/node";
import { Card, PageTitle, ExternalLink } from "~/components";
import { cardStyles } from "~/utils/card-styles";
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo";
import {
  HyperionIcon,
  AchilleaIcon,
  BluebellIcon,
  MobuildIcon,
  MyotosisIcon,
  AnthesisIcon,
  GardenIcon,
  CalatheaIcon,
  DubniumIcon,
} from "~/components/icons";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Laboratory",
    description:
      "Active Micrantha projects for platform automation, AI governance, repository control, mobile trust, and LLM workflow boundaries.",
    path: "/laboratory",
  });

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Laboratory",
    description:
      "Active Micrantha projects for platform automation, AI governance, repository control, mobile trust, and LLM workflow boundaries.",
    path: "/laboratory",
    items: [
      {
        name: "Project Hyperion",
        description:
          "Infrastructure for secure, reproducible laboratory environments, migrations, deployments, GitOps-style operations, and secret-management design.",
        url: "https://hyperion.micrantha.com",
      },
      {
        name: "Project Anthesis",
        description:
          "Internally used agentic SDLC with principles: Governed Autonomy, Human Authority First, Deterministic Execution, Auditability, and a Living Architecture.",
        url: "https://anthesis.dev",
      },
      {
        name: "Project Calathea",
        description:
          "CLI-first, AI-assisted system for deciding what work deserves focus and correcting delivery decisions as constraints change.",
        url: "https://calathea.micrantha.com",
      },
      {
        name: "Project Dubnium",
        description:
          "A Micrantha hardware element: a policy-driven NixOS local server/workstation and AI node with dual-GPU planning and desktop, studio-local, and compute operating modes.",
        url: "https://github.com/ryjen/dubnium",
      },
      {
        name: "Bluebell",
        description:
          "A multiplatform mobile SDK and project template that keeps AI-capable feature generation inside reusable client-platform boundaries.",
        url: "https://github.com/hackelia-micrantha/bluebell",
      },
      {
        name: "Achillea",
        description:
          "Dynamic feature platform for interactive React Native applications. Scientific name is 'Achillea millefolium'.",
        url: "https://achillea.micrantha.com",
      },
      {
        name: "Mobuild Envuscator",
        description:
          "A mobile SDK that randomly obfuscates environment variables on mobile clients per build. An extra-small security layer with a GitHub Action to update it.",
        url: "https://github.com/hackelia-micrantha/mobuild",
      },
      {
        name: "Project Digitalis",
        url: "https://digitalis.micrantha.com",
        description:
          "A backend and mobile SDK concept for mobile client attestation, secure configuration, and client-server trust boundaries.",
      },
      {
        name: "Project Myotosis",
        description:
          "An MCP and LLM registry concept for mobile clients, tool registration, and governed agent workflow integration.",
        url: "https://myotosis.micrantha.com",
      },
      {
        name: "Compost",
        description:
          "A list of recycled projects that may be useful for parts. Sometimes they are returned to the laboratory.",
        url: "https://micrantha.com/compost",
      },
    ],
  }),
};

const Laboratory = () => (
  <div>
    <PageTitle
      title="Laboratory"
      subtitle="Active project evidence for backend, platform, mobile trust, and AI-governance positioning."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        title="Project Hyperion"
        icon={<HyperionIcon />}
        url="https://hyperion.micrantha.com"
        headingLevel={2}
        className={cardStyles.neutral}
      >
        Infrastructure for secure, reproducible laboratory environments,
        migrations, deployments, GitOps-style operations, and secret-management
        design.
      </Card>

      <Card
        title="Project Anthesis"
        url="https://anthesis.dev"
        icon={<AnthesisIcon />}
        headingLevel={2}
        className={cardStyles.green}
      >
        Internally used agentic SDLC with principles: Governed Autonomy, Human
        Authority First, Deterministic Execution, Auditability, and a Living
        Architecture.
      </Card>

      <Card
        title="Project Calathea"
        url="https://calathea.micrantha.com"
        icon={<CalatheaIcon />}
        headingLevel={2}
        className={cardStyles.purple}
      >
        CLI-first, AI-assisted system for deciding what work actually deserves
        focus and continuously correcting delivery decisions as constraints
        change.
      </Card>

      <Card
        title="Project Dubnium"
        url="https://github.com/ryjen/dubnium"
        icon={<DubniumIcon />}
        headingLevel={2}
        className={cardStyles.cyan}
      >
        A Micrantha hardware element: a policy-driven NixOS local
        server/workstation and AI node for reproducible developer environments,
        local model routing, and infrastructure automation.
      </Card>

      <Card
        title="Bluebell"
        url="https://github.com/hackelia-micrantha/bluebell"
        icon={<BluebellIcon />}
        headingLevel={2}
        className={cardStyles.blue}
        actions={[
          <ExternalLink
            key="eyespie"
            href="https://github.com/ryjen/eyespie"
            newTab
          >
            Eyespie Demo App
          </ExternalLink>,
        ]}
      >
        A multiplatform mobile SDK and project template that keeps AI-capable
        feature generation inside reusable client-platform boundaries.
      </Card>

      <Card
        title="Achillea"
        icon={<AchilleaIcon />}
        url="https://achillea.micrantha.com"
        headingLevel={2}
        className={cardStyles.red}
        actions={[<span key="achillea-demo">Asterwild Demo Game</span>]}
      >
        Dynamic feature platform work for interactive applications, useful as
        evidence for runtime composition and client-platform delivery.
      </Card>

      <Card
        title="Mobuild Envuscator"
        url="https://envuscator.com"
        icon={<MobuildIcon />}
        headingLevel={2}
        className={cardStyles.yellow}
      >
        A mobile SDK that randomly obfuscates environment variables on mobile
        clients per build. Compact security-layer work with a GitHub Action to
        update build-time configuration.
      </Card>

      <Card
        title="Mobuild Digitalis"
        url="https://digitalis.micrantha.com"
        icon={<MobuildIcon />}
        headingLevel={2}
        className={cardStyles.purple}
      >
        A backend and mobile SDK concept for mobile client attestation, secure
        configuration, and client-server trust boundaries.
      </Card>

      <Card
        title="Project Myotosis"
        url="https://myotosis.micrantha.com"
        icon={<MyotosisIcon />}
        headingLevel={2}
        className={cardStyles.cyan}
      >
        An MCP and LLM registry concept for mobile clients, tool registration,
        and governed agent workflow integration.
      </Card>

      <Card
        title="Compost"
        icon={<GardenIcon />}
        url="/compost"
        headingLevel={2}
        className={cardStyles.lime}
      >
        A list of recycled projects that may be useful for parts. Sometimes they
        are returned to the laboratory.
      </Card>
    </div>
  </div>
);

export default Laboratory;

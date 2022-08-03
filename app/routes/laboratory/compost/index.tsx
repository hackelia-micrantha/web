import { Card, PageTitle } from "~/components"

const Compost = () => (
  <div>
    <PageTitle
      title="Laboratory Compost"
      subtitle="Projects listed here were neglected and recycled."
    />

    <div class="grid grid-cols-3">
      <Card title="😉 Emotext" url="https://emotext.micrantha.com">
        A scalable chat app that has predefined textual representations of
        emotions. Emotext's are displayed for first, second and third persons,
        leading to a more rich and humorous expression context.
      </Card>

      <Card title="🐞 Testmanship" url="https://testmanship.micrantha.com">
        Research on test automation, fuzz testing, security and machine learning
        and how to bring them all together.
      </Card>

      <Card title="🥠 Fortunes Mobile" url="https://fortunes.micrantha.com">
        A mobile app for the fortunes service. Fortunes are told with a variety
        of extra cute characters like cows and androids. Extra fortune content
        and redesigned categories with the ability for users to submit their
        own.
      </Card>
    </div>
  </div>
)

export default Compost

const Philosophy = () => (
  <div>
    <h1 className="text-2xl">Philosophy</h1>

    <p className="mt-8">
      Software forms naturally and inherently through <b>enjoyment</b>
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

    <p>
      This is akin to the project management triangle of <b>quality</b>
      <sub>
        <a href="#enjoyment">1</a>
      </sub>
      , <b>time</b>
      <sub>
        <a href="#enthusiasm">2</a>
      </sub>{" "}
      or <b>cost</b>
      <sub>
        <a href="#acceptance">3</a>
      </sub>
      .
    </p>

    <p>Projects must have two of these components to be taken on.</p>

    <p>
      An analogy to the software development we do is <b>gardening</b>,{" "}
      <b>growing creations over time</b> with patience.
    </p>

    <div className="mt-8 grid grid-cols-2">
      <dl>
        <dt className="font-bold">Flower</dt>
        <dd>A matured solution</dd>
        <dt className="font-bold">Soil</dt>
        <dd>The groundwork that helps produces a solution</dd>
        <dt className="font-bold">Seed</dt>
        <dd>The design of a solution</dd>
        <dt className="font-bold">Water</dt>
        <dd>The flow of resources around a solution</dd>
        <dt className="font-bold">Sunlight</dt>
        <dd>The visibility of a solution in the market</dd>
        <dt className="font-bold">Garden</dt>
        <dd>A collection of soil, seeds and flowers</dd>
      </dl>
      <img
        src="/img/project-management-triangle-venn-diagram.png"
        alt="project management triangle diagram"
      />
    </div>

    <div className="mt-8 text-xs">
      <p>
        [<a name="enjoyment">1</a>] Enjoyment relates to quality such that a
        quality solution is enjoyable
      </p>
      <p>
        [<a name="enthusiasm">2</a>] Enthusiasm relates to time such that there
        is more time when enthused
      </p>
      <p>
        [<a name="acceptance">3</a>] Acceptance relates to cost such that there
        is a need to
      </p>
    </div>

    <hr className="my-8" />

    <div className="flex items-center justify-center">
      <img alt="login" src="/img/micrantha.png" />
    </div>
  </div>
)

export default Philosophy

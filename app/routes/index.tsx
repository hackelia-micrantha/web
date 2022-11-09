export default function Index() {
  return (
    <div className="flex items-center justify-center">
      <div className="md:shrink-0">
        <img src="/img/logo.svg" width="195" height="300" alt="logo" />
      </div>

      <div className="p-8">
        <h1 className="text-4xl">Micrantha Software</h1>
        <h2 className="subtitle mt-4 text-lg">
          Growing software for functionally appealing solutions.
        </h2>
        <dl className="mt-8">
          <dt className="font-bold italic">Hackelia Micrantha:</dt>
          <dd className="italic">
            A species of flower found in the west coast of North America.
          </dd>
        </dl>
      </div>
    </div>
  );
}

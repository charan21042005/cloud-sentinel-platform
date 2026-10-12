const projectStatus = [
  { area: 'Local demo', status: 'Ready based on recorded checks', tone: 'emerald' },
  { area: 'Core application', status: 'Partially verified', tone: 'amber' },
  { area: 'Cloud/DevOps foundation', status: 'Substantial work completed', tone: 'sky' },
  { area: 'Monitoring and alerting', status: 'Needs completion/verification', tone: 'amber' },
  { area: 'Security hardening', status: 'Outstanding work', tone: 'rose' },
  { area: 'Full production readiness', status: 'Not established', tone: 'zinc' },
] as const;

const toneClasses = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  zinc: 'border-zinc-600 bg-zinc-800/70 text-zinc-200',
};

export default function ProjectStatusTable() {
  return (
    <section
      aria-labelledby="project-status-heading"
      className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-lg shadow-black/10"
    >
      <div className="border-b border-zinc-800 px-4 py-4 sm:px-6">
        <h2
          id="project-status-heading"
          className="text-base font-semibold text-zinc-100 sm:text-lg"
        >
          Project status
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Recorded project checks, not a live infrastructure health monitor.
        </p>
      </div>
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">Project areas and their recorded status</caption>
        <thead className="bg-zinc-950/60 text-xs tracking-wide text-zinc-400 uppercase">
          <tr>
            <th scope="col" className="w-[42%] px-3 py-3 font-medium sm:px-6">
              Area
            </th>
            <th scope="col" className="w-[58%] px-3 py-3 font-medium sm:px-6">
              Current status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {projectStatus.map(({ area, status, tone }) => (
            <tr key={area} className="align-middle transition-colors hover:bg-zinc-800/40">
              <th
                scope="row"
                className="px-3 py-3.5 font-medium break-words text-zinc-200 sm:px-6 sm:py-4"
              >
                {area}
              </th>
              <td className="px-3 py-3.5 break-words sm:px-6 sm:py-4">
                <span
                  className={`inline-flex max-w-full items-start rounded-full border px-2.5 py-1 text-xs leading-5 font-medium sm:text-sm ${toneClasses[tone]}`}
                >
                  {status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

import Link from "next/link";

const features = [
  { number: "01", title: "Keep work organised", text: "Review your orders and account activity from one clear workspace." },
  { number: "02", title: "Share feedback safely", text: "Post comments that display as text, so markup cannot run in another user’s browser." },
  { number: "03", title: "Know what the assistant can access", text: "The local assistant can retrieve notes for your account only." },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 sm:px-8">
      <section className="grid min-h-[560px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-sm font-medium text-sky-200">
            FlowVault · personal workspace
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Your work, kept in one clear place.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
            Check orders, manage account details and review your notes in a calm, focused workspace.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg bg-sky-500 px-5 font-semibold text-slate-950 transition-colors hover:bg-sky-400">
              Sign in to FlowVault
            </Link>
            <Link href="/signup" className="inline-flex min-h-11 items-center rounded-lg border border-zinc-700 px-5 font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900">
              About workshop access
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">Workshop demo accounts are available on the sign-in page.</p>
        </div>

        <div aria-label="FlowVault workspace preview" className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl shadow-sky-950/20 sm:p-7">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
            <div>
              <p className="text-sm font-medium text-zinc-300">Workspace overview</p>
              <p className="mt-1 text-xs text-zinc-500">Your account at a glance</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Local demo</span>
          </div>
          <div className="grid grid-cols-2 gap-3 py-5">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Orders</p><p className="mt-3 text-2xl font-semibold text-white">In one view</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Account data</p><p className="mt-3 text-2xl font-semibold text-white">Private by user</p>
            </div>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-4">
            <p className="text-sm font-medium text-sky-100">Built for a safer demo</p>
            <p className="mt-1 text-sm leading-6 text-zinc-300">The workshop uses simulated data and local services. Never enter real customer information.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="border-t border-zinc-800 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">A practical workspace</p>
          <h2 id="features-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white">Useful tools, with sensible boundaries.</h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.number} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <p className="font-mono text-sm text-sky-300">{feature.number}</p>
              <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

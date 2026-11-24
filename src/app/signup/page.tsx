import Link from "next/link";

const demoAccounts = [
  { account: "User A", access: "Standard workspace", email: "usera@example.com" },
  { account: "User B", access: "Separate sample workspace", email: "userb@example.com" },
  { account: "Admin", access: "Admin panel", email: "admin@example.com" },
];

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-14">
      <section aria-labelledby="access-heading" className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">Workshop access</p>
        <h1 id="access-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white">Use a sample account</h1>
        <p className="mt-3 max-w-xl leading-7 text-zinc-300">
          Self-service registration is not enabled in this local workshop. These accounts use simulated data; do not enter a real password or customer information.
        </p>
        <div className="mt-7 overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Available workshop accounts</caption>
            <thead className="bg-zinc-950 text-zinc-300">
              <tr><th scope="col" className="px-4 py-3 font-medium">Account</th><th scope="col" className="px-4 py-3 font-medium">Access</th><th scope="col" className="px-4 py-3 font-medium">Email</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-200">
              {demoAccounts.map((row) => (
                <tr key={row.email}><th scope="row" className="px-4 py-3 font-medium">{row.account}</th><td className="px-4 py-3 text-zinc-300">{row.access}</td><td className="px-4 py-3 font-mono text-xs">{row.email}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/login" className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-sky-500 px-5 font-semibold text-slate-950 transition-colors hover:bg-sky-400">
          Continue to sign in
        </Link>
      </section>
    </main>
  );
}

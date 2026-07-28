import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ved-navy px-6 text-white">
      <h1 className="text-4xl font-light">404</h1>
      <p className="mt-4 text-white/60">{"\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430"}</p>
      <Link href="/" className="mt-8 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-ved-navy">{"\u041d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e"}</Link>
    </main>
  );
}
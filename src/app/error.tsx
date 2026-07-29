"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex ved-screen flex-col items-center justify-center bg-[#0a1628] px-6 text-white">
      <h1 className="text-2xl font-light">\u041e\u0448\u0438\u0431\u043a\u0430</h1>
      <p className="mt-4 max-w-md text-center text-sm text-white/60">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-[#0a1628]"
      >
        \u041f\u043e\u043f\u0440\u043e\u0431\u043e\u0432\u0430\u0442\u044c \u0441\u043d\u043e\u0432\u0430
      </button>
    </main>
  );
}
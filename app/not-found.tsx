// app/not-found.tsx
import Link from "next/link";
import Header from "@/components/layout/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center text-center px-4">
        <div className="space-y-6">
          <div className="text-8xl">🔍</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
            404
          </h1>
          <p className="text-gray-400 text-lg">Страница не найдена</p>
          <Link href="/" className="btn-primary inline-flex">
            На главную
          </Link>
        </div>
      </main>
    </div>
  );
}

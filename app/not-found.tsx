// app/not-found.tsx
import Link from "next/link";
import Header from "@/components/layout/Header";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center text-center px-4">
        <div className="space-y-6">
          <SearchX className="w-24 h-24 text-gray-600 mx-auto" />
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

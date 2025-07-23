import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold mb-4">Welcome to DTR System</h1>
        <ul className="space-y-4">
          <li>
            <Link href="/dtr" className="text-blue-600 underline">Go to DTR (Daily Time Record)</Link>
          </li>
          <li>
            <Link href="/tracker" className="text-blue-600 underline">Go to Time Tracker</Link>
          </li>
          <li>
            <Link href="/admin" className="text-blue-600 underline">Admin Panel (Admins Only)</Link>
          </li>
        </ul>
      </main>
    </div>
  );
}

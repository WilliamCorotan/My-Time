import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <main className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0369A1] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DTR System
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Modern time tracking solution for organizations. Track attendance, manage schedules, and boost productivity with our intuitive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#0369A1]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#0369A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Time Tracking</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Easy clock in/out with real-time tracking and automatic calculations.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#059669]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Analytics</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Comprehensive reports and insights to optimize workforce management.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0369A1]/10 to-[#059669]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Team Management</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Organize teams, manage permissions, and streamline operations.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-in" 
              className="inline-flex items-center px-8 py-3 bg-[#0369A1] text-white font-medium rounded-xl hover:bg-[#0369A1]/90 transition-colors shadow-sm"
            >
              Sign In
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
            <Link 
              href="/sign-up" 
              className="inline-flex items-center px-8 py-3 bg-white text-[#059669] font-medium rounded-xl border-2 border-[#059669] hover:bg-[#059669] hover:text-white transition-all shadow-sm"
            >
              Create Account
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
import React from 'react'

const Work = () => {
  return (
 <section id="how-it-works" class="py-24 bg-slate-50">
        <div class="max-w-4xl mx-auto px-6">
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900 text-center mb-16">Get started in seconds</h2>
            
            <div class="relative">
                {/* <!-- Connecting Line --> */}
                <div class="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-slate-200 via-purple-200 to-slate-200"></div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* <!-- Step 1 --> */}
                    <div class="relative flex flex-col items-center text-center">
                        <div class="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 z-10 relative">
                            <span class="text-3xl font-bold text-slate-200 absolute top-2 right-4">1</span>
                            <span class="iconify text-purple-600" data-icon="lucide:mail" data-width="32"></span>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-900 mb-2">Sign Up</h3>
                        <p class="text-sm text-slate-500">Use your .edu email to verify your student status instantly.</p>
                    </div>

                    {/* <!-- Step 2 --> */}
                    <div class="relative flex flex-col items-center text-center">
                        <div class="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 z-10 relative">
                             <span class="text-3xl font-bold text-slate-200 absolute top-2 right-4">2</span>
                            <span class="iconify text-pink-600" data-icon="lucide:user-plus" data-width="32"></span>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-900 mb-2">Create Profile</h3>
                        <p class="text-sm text-slate-500">Add your major, grad year, and interests to find like-minded people.</p>
                    </div>

                    {/* <!-- Step 3 --> */}
                    <div class="relative flex flex-col items-center text-center">
                        <div class="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 z-10 relative">
                             <span class="text-3xl font-bold text-slate-200 absolute top-2 right-4">3</span>
                            <span class="iconify text-indigo-600" data-icon="lucide:sparkles" data-width="32"></span>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-900 mb-2">Start Connecting</h3>
                        <p class="text-sm text-slate-500">Join groups, post on the feed, and engage with your campus.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>  )
}

export default Work
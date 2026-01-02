import React from 'react'

const StackSection = () => {
  return (
 <section class="py-16 bg-white border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="text-left md:w-1/3">
                <h3 class="text-lg font-semibold text-slate-900 mb-2">Built with Modern Tech</h3>
                <p class="text-sm text-slate-500">Scalable, secure, and developer-friendly architecture.</p>
            </div>
            <div class="flex flex-wrap items-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div class="flex items-center gap-2 font-semibold text-lg text-[#61DAFB]">
                    <span class="iconify" data-icon="logos:react"></span> React 19
                </div>
                <div class="flex items-center gap-2 font-semibold text-lg text-[#646Cff]">
                    <span class="iconify" data-icon="logos:vitejs"></span> Vite
                </div>
                <div class="flex items-center gap-2 font-semibold text-lg text-[#06B6D4]">
                    <span class="iconify" data-icon="logos:tailwindcss-icon"></span> Tailwind
                </div>
                <div class="flex items-center gap-2 font-semibold text-lg text-[#3178C6]">
                    <span class="iconify" data-icon="logos:typescript-icon"></span> TypeScript
                </div>
            </div>
        </div>
    </section>
  )
}

export default StackSection
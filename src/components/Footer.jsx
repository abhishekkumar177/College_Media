import React from 'react'

const Footer = () => {
  return (
<footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
                <div className="col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white">
                            <span className="iconify" data-icon="lucide:zap" data-width="14"></span>
                        </div>
                        <span className="text-base font-semibold tracking-tight text-slate-900">CollegeMedia</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Recreating the social experience for the modern campus. Safe, fast, and beautiful.
                    </p>
                </div>
                
                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Product</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Features</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Mobile App</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Safety</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Company</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">About</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Careers</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Blog</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Help Center</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Guidelines</a></li>
                        <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Contact</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-4">
                <p className="text-xs text-slate-400">© 2024 College Media Inc. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 hover:text-slate-600"><span className="iconify" data-icon="lucide:twitter" data-width="18"></span></a>
                    <a href="#" className="text-slate-400 hover:text-slate-600"><span className="iconify" data-icon="lucide:instagram" data-width="18"></span></a>
                    <a href="#" className="text-slate-400 hover:text-slate-600"><span className="iconify" data-icon="lucide:github" data-width="18"></span></a>
                </div>
            </div>
        </div>
    </footer>
      )
}

export default Footer
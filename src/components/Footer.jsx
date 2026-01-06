/**
 * Footer Component
 * 
 * Site footer with navigation links, social media, and legal info
 * Updated with UniHub branding and accessibility features
 * 
 * @component
 * @returns {React.ReactElement} Footer section
 */
import React from 'react'

const Footer = () => {
    const currentYear = new Date().getFullYear()
    return (
<footer className="bg-white border-t border-slate-100 pt-16 pb-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
                <div className="col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white">
                            <span aria-hidden="true">🎓</span>
                        </div>
                        <span className="text-base font-semibold tracking-tight text-slate-900">UniHub</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Your centralized platform for everything college - academics, social connections, events, career opportunities, and achievements all in one place.
                    </p>
                </div>
                
                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Product</h4>
                    <nav aria-label="Product links">
                        <ul className="space-y-2">
                            <li><a href="#features" className="text-sm text-slate-500 hover:text-purple-600">Features</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Mobile App</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Safety & Security</a></li>
                        </ul>
                    </nav>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Company</h4>
                    <nav aria-label="Company links">
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">About UniHub</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Careers</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Blog</a></li>
                        </ul>
                    </nav>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
                    <nav aria-label="Resource links">
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Help Center</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Community Guidelines</a></li>
                            <li><a href="/contact" className="text-sm text-slate-500 hover:text-purple-600">Contact Us</a></li>
                        </ul>
                    </nav>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
                    <nav aria-label="Legal links">
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Terms of Service</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-purple-600">Cookie Policy</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-4">
                <p className="text-xs text-slate-400">© {currentYear} UniHub Inc. All rights reserved.</p>
                <div className="flex gap-6" role="list" aria-label="Social media links">
                    <a 
                        href="#" 
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Follow UniHub on Twitter"
                    >
                        <span className="iconify" data-icon="lucide:twitter" data-width="18" aria-hidden="true"></span>
                    </a>
                    <a 
                        href="#" 
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Follow UniHub on Instagram"
                    >
                        <span className="iconify" data-icon="lucide:instagram" data-width="18" aria-hidden="true"></span>
                    </a>
                    <a 
                        href="#" 
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="View UniHub on GitHub"
                    >
                        <span className="iconify" data-icon="lucide:github" data-width="18" aria-hidden="true"></span>
                    </a>
                </div>
            </div>
        </div>
    </footer>
      )
}

export default Footer
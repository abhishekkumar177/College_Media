import React from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import SupportFAQ from '../components/SupportFAQ';
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import SEO from '../components/Seo';

/**
 * ContactUs Page Component
 * 
 * A dedicated page for users to submit feedback, report issues, 
 * and contact campus support teams directly from College Media.
 * 
 * Structure:
 * - SEO: Meta tags for search engines
 * - LandingNavbar: Navigation with branding
 * - Hero: Contact page header with welcome message
 * - Contact Info Cards: Quick contact options
 * - Main Content: FAQ and Contact Form side by side
 * - Footer: Site links and copyright
 * 
 * @component
 * @returns {React.ReactElement} Complete contact us page layout
 */
const ContactUs = () => {
  const contactOptions = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get help via email',
      detail: 'support@unihub.edu',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our team',
      detail: 'Available 9am - 6pm EST',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Call for urgent issues',
      detail: '+1 (555) 123-4567',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title="Contact Us - UniHub Support"
        description="Get in touch with UniHub support team. Submit feedback, report issues, or contact campus support for assistance with your account."
        keywords="contact unihub, support, help, feedback, report issue, customer service"
      />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
        {/* Navigation Bar */}
        <LandingNavbar />

        {/* Main Content */}
        <main className="pt-20 pb-16">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-6 py-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
              <span className="text-sm font-medium text-gray-600">We're here to help</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a question, feedback, or need assistance? We'd love to hear from you.
              Our support team is available to help you with any inquiries.
            </p>
          </section>

          {/* Contact Options Cards */}
          <section className="max-w-7xl mx-auto px-6 mb-12">
            <div className="grid md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white text-xl mb-4`}
                  >
                    <span aria-hidden="true">{option.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{option.description}</p>
                  <p className="text-sm font-medium text-purple-600">{option.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ and Contact Form Section */}
          <section className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* FAQ Section */}
              <div>
                <SupportFAQ />
              </div>

              {/* Contact Form Section */}
              <div>
                <ContactForm />

                {/* Additional Info Card */}
                <div className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">💡 Pro Tip</h3>
                  <p className="text-sm text-purple-100 leading-relaxed">
                    For the fastest response, please include relevant details like your 
                    username, the device you're using, and screenshots if applicable. 
                    This helps our team assist you more efficiently.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Back to Home Link */}
          <section className="max-w-7xl mx-auto px-6 mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default ContactUs;

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Icon } from '@iconify/react';
import ConfettiExplosion from '../components/ConfettiExplosion';

gsap.registerPlugin(ScrollTrigger);

const PLANS = {
  monthly: {
    basic: { price: 29, label: '/mo' },
    pro: { price: 59, label: '/mo' },
    enterprise: { price: 199, label: '/mo' }
  },
  yearly: {
    basic: { price: 290, label: '/yr', save: 'Save $58' },
    pro: { price: 590, label: '/yr', save: 'Save $118' },
    enterprise: { price: 1990, label: '/yr', save: 'Save $398' }
  }
};

const FEATURES = [
  { name: 'Course Access', basic: 'Limited', pro: 'Unlimited', ent: 'Unlimited' },
  { name: 'Certificate', basic: false, pro: true, ent: true },
  { name: 'Mentor Support', basic: false, pro: 'Standard', ent: 'Priority 24/7' },
  { name: 'Offline Mode', basic: false, pro: true, ent: true },
  { name: 'API Access', basic: false, pro: false, ent: true },
  { name: 'Team Seats', basic: '1 User', pro: '1 User', ent: 'Unlimited' },
];

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const tableRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from(toggleRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'back.out(1.7)'
      });

      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.2)',
          delay: 0.5,
          clearProps: "all"
        });
      }

      if (tableRef.current) {
        gsap.from(tableRef.current, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.8,
          scrollTrigger: {
            trigger: tableRef.current,
            start: 'top 85%',
            toggleActions: "play none none reverse"
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePurchase = (planName) => {
    setPaymentStatus('processing');
    
    setTimeout(() => {
      setPaymentStatus('success');
      
      gsap.fromTo(".success-modal", 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.75)" }
      );
    }, 1500);
  };

  const closeSuccess = () => setPaymentStatus('idle');

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
      
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-50 via-purple-50 to-coral-50 -z-10 rounded-b-[4rem]" />
      
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <div ref={headerRef} className="mb-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900">
            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-coral-500">Future</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Choose the plan that fits your learning pace. Upgrade, downgrade, or cancel at any time.
          </p>
        </div>

        <div ref={toggleRef} className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-full shadow-lg border border-slate-100 inline-flex relative cursor-pointer"
               onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}>
            
            <div className={`absolute top-1.5 bottom-1.5 rounded-full bg-slate-900 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-md
              ${billingCycle === 'monthly' ? 'left-1.5 w-[100px]' : 'left-[108px] w-[100px]'}`} 
            />
            
            <button className={`relative z-10 w-[100px] py-2 rounded-full font-semibold text-sm transition-colors duration-300 
              ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              Monthly
            </button>
            <button className={`relative z-10 w-[100px] py-2 rounded-full font-semibold text-sm transition-colors duration-300
              ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
              Yearly
            </button>
          </div>
          {billingCycle === 'yearly' && (
            <span className="ml-4 inline-flex items-center text-sm font-medium text-coral-500 animate-pulse">
              <Icon icon="lucide:sparkles" className="mr-1" /> Save 20%
            </span>
          )}
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24 items-start">
          
          <PricingCard 
            title="Basic"
            icon="lucide:coffee"
            price={PLANS[billingCycle].basic.price}
            cycle={PLANS[billingCycle].basic.label}
            description="Essential tools for casual learners."
            features={['Access to free courses', 'Community Support', 'Basic Quizzes']}
            onSelect={() => handlePurchase('Basic')}
          />

          <PricingCard 
            title="Pro"
            icon="lucide:zap"
            price={PLANS[billingCycle].pro.price}
            cycle={PLANS[billingCycle].pro.label}
            description="Complete power for serious engineers."
            features={['Unlimited Course Access', 'Official Certificates', '1-on-1 Mentor Chat', 'Code Reviews']}
            isPopular
            onSelect={() => handlePurchase('Pro')}
          />

          <PricingCard 
            title="Enterprise"
            icon="lucide:building-2"
            price={PLANS[billingCycle].enterprise.price}
            cycle={PLANS[billingCycle].enterprise.label}
            description="Scalable solutions for teams."
            features={['Everything in Pro', 'SSO Integration', 'Dedicated Success Manager', 'Custom Contracts']}
            onSelect={() => handlePurchase('Enterprise')}
          />
        </div>

        <div ref={tableRef} className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-2xl font-bold text-slate-900">Detailed Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 text-slate-500 font-medium">Features</th>
                  <th className="p-6 text-slate-900 font-bold">Basic</th>
                  <th className="p-6 text-coral-600 font-bold">Pro</th>
                  <th className="p-6 text-purple-600 font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr key={idx} className="border-t border-slate-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 group">
                    <td className="p-6 font-medium text-slate-700 group-hover:translate-x-2 transition-transform">{feature.name}</td>
                    <td className="p-6 text-slate-600">{renderFeatureValue(feature.basic)}</td>
                    <td className="p-6 text-slate-900 font-semibold">{renderFeatureValue(feature.pro)}</td>
                    <td className="p-6 text-slate-900 font-semibold">{renderFeatureValue(feature.ent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {paymentStatus === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <ConfettiExplosion />
          <div className="success-modal bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:check" width="40" strokeWidth="3" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-8">
              Welcome to the future of learning. Your account has been upgraded instantly.
            </p>
            <button 
              onClick={closeSuccess}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              Start Learning
            </button>
          </div>
        </div>
      )}

      {paymentStatus === 'processing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-coral-500 rounded-full animate-spin mb-4"></div>
              <p className="font-semibold text-slate-600 animate-pulse">Processing Payment...</p>
           </div>
        </div>
      )}
    </div>
  );
};

const PricingCard = ({ title, icon, price, cycle, description, features, isPopular, onSelect }) => (
  <div className={`pricing-card relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col h-full
    ${isPopular 
      ? 'bg-white border-coral-200 shadow-2xl scale-105 z-10 ring-4 ring-coral-50/50' 
      : 'bg-white/80 border-slate-100 hover:border-purple-200 hover:shadow-xl backdrop-blur-sm'
    }`}>
    
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-coral-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg">
        Most Popular
      </div>
    )}

    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl
      ${isPopular ? 'bg-coral-50 text-coral-600' : 'bg-slate-50 text-slate-600'}`}>
      <Icon icon={icon} />
    </div>

    <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-6 leading-relaxed">{description}</p>

    <div className="mb-8">
      <span className="text-4xl font-bold text-slate-900">${price}</span>
      <span className="text-slate-400 font-medium">{cycle}</span>
    </div>

    <div className="space-y-4 mb-8 flex-1">
      {features.map((feat, i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
          <Icon icon="lucide:check-circle-2" className={`flex-shrink-0 w-5 h-5 ${isPopular ? 'text-green-500' : 'text-slate-400'}`} />
          <span>{feat}</span>
        </div>
      ))}
    </div>

    <button 
      onClick={onSelect}
      className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95
      ${isPopular 
        ? 'bg-slate-900 text-white hover:bg-slate-800' 
        : 'bg-white text-slate-900 border border-slate-200 hover:border-coral-300 hover:bg-coral-50'
      }`}>
      Choose {title}
    </button>
  </div>
);

const renderFeatureValue = (value) => {
  if (value === true) return <Icon icon="lucide:check" className="text-green-500 w-6 h-6" />;
  if (value === false) return <Icon icon="lucide:minus" className="text-slate-300 w-6 h-6" />;
  return value;
};

export default PricingPage;
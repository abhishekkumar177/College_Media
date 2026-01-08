import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Icon } from '@iconify/react';
import ScrollFloat from '../components/ScrollFloat';

gsap.registerPlugin(ScrollTrigger);

const CoursesLanding = () => {
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(wrapperRef.current, {
        backgroundPosition: '0% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      gsap.to(cardRef.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      const card = cardRef.current;
      const handleMouseMove = (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        gsap.to(card, {
          rotationY: x * 20,
          rotationX: -y * 20,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 1000,
          transformOrigin: 'center',
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      };

      if (heroRef.current) {
        heroRef.current.addEventListener('mousemove', handleMouseMove);
        heroRef.current.addEventListener('mouseleave', handleMouseLeave);
      }

      const sections = gsap.utils.toArray('.animate-on-scroll');
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={wrapperRef} 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-coral-50 bg-[length:200%_200%] overflow-hidden"
    >
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-12 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 z-10 order-2 md:order-1">
            <div className="inline-block px-4 py-2 bg-coral-100 text-coral-600 rounded-full text-sm font-semibold mb-2">
              New Course Available
            </div>
            
            <ScrollFloat 
              containerClassName="text-5xl md:text-7xl font-bold text-slate-900 leading-tight"
              textClassName="inline-block"
              animationDuration={1.2}
              ease="back.out(1.7)"
              scrollStart="top 80%"
            >
              Master The Future
            </ScrollFloat>
            
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed animate-on-scroll">
              Unlock your potential with our comprehensive Full-Stack Engineering path. 
              Build real-world projects and join a community of innovators.
            </p>

            <div className="flex gap-4 pt-4 animate-on-scroll">
              <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                Start Learning
              </button>
              <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:border-coral-300 hover:bg-coral-50 transition-all">
                View Syllabus
              </button>
            </div>
          </div>

          <div className="relative z-10 flex justify-center perspective-1000 order-1 md:order-2">
            <div 
              ref={cardRef}
              className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="relative z-10 space-y-4 pointer-events-none">
                <div className="h-48 rounded-2xl bg-gradient-to-tr from-coral-400 to-purple-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded backdrop-blur-md">
                      CERTIFIED
                    </span>
                    <h3 className="text-2xl font-bold mt-2">Full Stack Pro</h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                       <Icon icon="lucide:book-open" /> 12 Modules
                    </span>
                    <span className="flex items-center gap-1">
                       <Icon icon="lucide:clock" /> 40 Hours
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-coral-500 h-2 rounded-full w-2/3"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                        ))}
                     </div>
                     <span className="text-slate-900 font-bold">$499</span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300 rounded-full blur-2xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-coral-300 rounded-full blur-2xl opacity-50 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={featuresRef}
        className="py-24 px-6 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
             <ScrollFloat 
              containerClassName="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
              animationDuration={1}
              ease="power2.out"
            >
              What You'll Learn
            </ScrollFloat>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A curriculum designed for modern engineering, covering everything from frontend aesthetics to backend scalability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[280px]">
            
            <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between overflow-hidden group animate-on-scroll">
              <div className="z-10 relative">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">
                  <Icon icon="lucide:layers" width="32" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">System Architecture</h3>
                <p className="text-slate-600 leading-relaxed">
                  Learn to design scalable systems. We cover microservices, load balancing, and database optimization strategies used by top tech companies.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-indigo-50 to-transparent rounded-tl-full translate-y-20 translate-x-20 group-hover:translate-y-10 group-hover:translate-x-10 transition-transform duration-500"></div>
            </div>

            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 animate-on-scroll">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">React Ecosystem</h3>
                <p className="text-slate-300">Master Hooks, Context, Redux, and Next.js.</p>
              </div>
              <Icon icon="lucide:atom" className="absolute -bottom-6 -right-6 text-slate-800 w-40 h-40 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            <div className="md:row-span-2 bg-gradient-to-b from-orange-300 to-red-300 rounded-3xl p-8 text-white flex flex-col items-center text-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll">
               <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                 <Icon icon="lucide:trophy" width="40" />
               </div>
               <h3 className="text-2xl font-bold mb-2">Career Ready</h3>
               <p className="text-white/90 text-sm">
                 Includes resume reviews, mock interviews, and direct referrals to hiring partners.
               </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-purple-200 group transition-colors duration-300 animate-on-scroll">
               <Icon icon="lucide:database" className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold text-slate-900">Backend Logic</h3>
               <p className="text-sm text-slate-500 mt-2">Node.js, Express & PostgreSQL mastery.</p>
            </div>

             <div className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-pink-200 group transition-colors duration-300 animate-on-scroll">
               <Icon icon="lucide:palette" className="w-10 h-10 text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold text-slate-900">UI/UX Design</h3>
               <p className="text-sm text-slate-500 mt-2">Figma to React workflow.</p>
            </div>

          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-center animate-on-scroll">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to start your journey?</h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Join 10,000+ students already learning on College Media. Access course materials instantly.
            </p>
            <button className="px-10 py-4 bg-coral-500 text-white rounded-full font-bold text-lg hover:bg-coral-600 hover:shadow-lg hover:scale-105 transition-all">
              Enroll Now - $499
            </button>
          </div>
          
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>
    </div>
  );
};

export default CoursesLanding;
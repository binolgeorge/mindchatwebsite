import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring as useSpringPhysics, animated } from 'react-spring';
import { 
  Building2, 
  Users, 
  Brain, 
  Target, 
  ArrowRight, 
  CheckCircle,
  Star,
  BarChart3,
  MessageCircle,
  Calendar,
  Code,
  Video,
  FileText,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Award,
  Heart,
  UserPlus,
  Camera,
  Upload,
  GraduationCap,
  Share2,
  Mail,
  Settings,
  Briefcase
} from 'lucide-react';

// Custom hooks for animations
const useMagneticEffect = (ref) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  
  const handleMouseMove = React.useCallback((e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.1;
    const deltaY = (e.clientY - centerY) * 0.1;
    
    setPosition({ x: deltaX, y: deltaY });
  }, [ref]);
  
  const handleMouseLeave = React.useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);
  
  return { position, handleMouseMove, handleMouseLeave };
};

// Magnetic Button Component
const MagneticButton = React.memo(({ children, className = "", onClick, ...props }) => {
  const ref = React.useRef(null);
  const { position, handleMouseMove, handleMouseLeave } = useMagneticEffect(ref);
  
  return (
    <motion.button
      ref={ref}
      className={`magnetic bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/10 backdrop-blur-sm border border-white/20-dark transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

// Benefits Section
export const BenefitsSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const benefits = [
    {
      title: "For candidates",
      icon: Users,
      items: [
        "Show more than a resume: interactive profiles, video resumes, and AI-trained avatars that speak for you.",
        "Apply with confidence: guided screening, interview practice, and one-click applications.",
        "Less anxiety, more clarity: prepare with AI insight reports tailored to each role."
      ]
    },
    {
      title: "For recruiters & hiring teams",
      icon: Building2,
      items: [
        "Reduce bad hires: deeper AI-driven candidate analysis and agent-to-agent pre-screening.",
        "Speed up time-to-hire: automated screening, scheduling, and shared scorecards.",
        "Sell your culture: immersive career sites and company avatars that actually explain what it's like to work with you."
      ]
    },
    {
      title: "Company ROI",
      icon: TrendingUp,
      items: [
        "Better fit → lower churn.",
        "Shorter hiring cycles → lower cost per hire.",
        "Higher candidate acceptance → stronger employer brand."
      ]
    }
  ];
  
  return (
    <section ref={ref} className="py-16 sm:py-24 relative min-h-screen bg-gradient-to-b from-slate-900/40 via-slate-800/30 to-slate-900/40 z-20" id="benefits">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold gradient-text mb-4 sm:mb-6">
            Why BelloHire?
          </h2>
          <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto px-4">
            Transform your hiring process with AI-powered insights and immersive experiences
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white">{benefit.title}</h3>
              </div>
              
              <ul className="space-y-4">
                {benefit.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Features Section
export const FeaturesSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const features = [
    {
      title: "Virtual Office Spaces",
      description: "Let candidates explore your culture before an interview.",
      icon: Building2,
      color: "from-primary-500 to-primary-600"
    },
    {
      title: "AI-Driven Avatars",
      description: "24/7 conversational agents that answer profile and job questions.",
      icon: Brain,
      color: "from-neon-blue to-neon-purple"
    },
    {
      title: "Interactive Career Sites",
      description: "Video intros, department tours, and rich job pages.",
      icon: Globe,
      color: "from-neon-purple to-neon-pink"
    },
    {
      title: "Interactive Candidate Profiles",
      description: "Video resumes, portfolios, and skill widgets.",
      icon: Users,
      color: "from-neon-pink to-neon-green"
    },
    {
      title: "Built-in ATS",
      description: "Track, score, and move candidates in a visual pipeline.",
      icon: BarChart3,
      color: "from-neon-green to-primary-500"
    },
    {
      title: "Assessments & Technical Rounds",
      description: "Custom tests, coding rooms, and recorded sessions.",
      icon: Code,
      color: "from-primary-500 to-neon-blue"
    },
    {
      title: "Agent-to-Agent Pre-Screening",
      description: "Recruiter and candidate assistants exchange structured data for precise matches.",
      icon: MessageCircle,
      color: "from-neon-blue to-neon-purple"
    },
    {
      title: "Live Chat & Scheduling",
      description: "Real-time recruiter chats and one-click interview scheduling.",
      icon: Calendar,
      color: "from-neon-purple to-neon-pink"
    },
    {
      title: "Data & Insights",
      description: "Actionable analytics to reduce bias and improve fit.",
      icon: Target,
      color: "from-neon-pink to-neon-green"
    }
  ];
  
  return (
    <section ref={ref} className="py-24 relative min-h-screen bg-gradient-to-b from-slate-800/40 via-slate-700/30 to-slate-800/40 z-20" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-6">
            Features at a glance
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Everything you need to revolutionize your hiring process
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// How It Works Section
export const HowItWorksSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const candidateSteps = [
    {
      step: "1",
      title: "Sign up in <2 minutes",
      description: "Build your 3D Candidate Space",
      icon: Users
    },
    {
      step: "2", 
      title: "Create and train your AI avatar",
      description: "Photo + resume = smart avatar",
      icon: Brain
    },
    {
      step: "3",
      title: "Browse interactive career sites",
      description: "Get matched — your avatar answers questions for you",
      icon: Globe
    },
    {
      step: "4",
      title: "Apply, record interviews",
      description: "Take coding assessments inside BelloHire",
      icon: Video
    }
  ];
  
  const companySteps = [
    {
      step: "1",
      title: "Create a Company Space and avatar",
      description: "Set up your virtual presence",
      icon: Building2
    },
    {
      step: "2",
      title: "Publish a career site",
      description: "Videos, department scenes, and AI-led FAQs",
      icon: Globe
    },
    {
      step: "3", 
      title: "Post jobs or auto-generate",
      description: "Job descriptions with AI",
      icon: FileText
    },
    {
      step: "4",
      title: "Let agents pre-screen",
      description: "Review scorecards and hire",
      icon: Target
    }
  ];
  
  return (
    <section ref={ref} className="py-24 relative min-h-screen bg-gradient-to-b from-slate-900/40 via-slate-800/30 to-slate-900/40 z-20" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-6">
            How it works
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Simple, step-by-step process for both candidates and companies
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Candidate Journey */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
              <Users className="w-8 h-8 text-primary-400 mr-3" />
              For candidates
            </h3>
            
            <div className="space-y-6">
              {candidateSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="flex items-start"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-neon-blue rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                    <p className="text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Company Journey */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
              <Building2 className="w-8 h-8 text-neon-purple mr-3" />
              For companies
            </h3>
            
            <div className="space-y-6">
              {companySteps.map((step, index) => (
                <div
                  key={step.step}
                  className="flex items-start"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                    <p className="text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// Pricing Section
export const PricingSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Candidate profiles",
        "Basic job posts", 
        "One Company Space trial",
        "Basic AI avatar",
        "Email support"
      ],
      cta: "Get started free",
      popular: false,
      gradient: "from-slate-600 to-slate-700"
    },
    {
      name: "Growth",
      price: "$99",
      period: "/month",
      description: "For growing teams",
      features: [
        "Everything in Starter",
        "Full ATS functionality",
        "Assessments & technical rounds",
        "Career sites & 3D spaces",
        "Advanced analytics",
        "Priority support"
      ],
      cta: "Start free trial",
      popular: true,
      gradient: "from-primary-500 to-neon-blue"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Growth",
        "Custom integrations",
        "SSO & advanced security",
        "Dedicated onboarding",
        "Advanced analytics",
        "24/7 phone support",
        "Custom AI training"
      ],
      cta: "Contact sales",
      popular: false,
      gradient: "from-neon-purple to-neon-pink"
    }
  ];
  
  return (
    <section ref={ref} className="py-24 relative min-h-screen bg-gradient-to-b from-slate-800/40 via-slate-700/30 to-slate-800/40 z-20" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-6">
            Simple, transparent plans
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Choose the plan that fits your hiring needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`bg-white/10 backdrop-blur-sm p-8 rounded-3xl relative border border-white/20 ${
                plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
              } hover:bg-white/20 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-500 to-neon-blue text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-400">{plan.period}</span>}
                </div>
                <p className="text-slate-300">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 text-neon-green mr-3 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Trust & Social Proof Section
export const TrustSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const testimonials = [
    {
      quote: "We cut time-to-hire by 40% and our interview-to-hire rate improved.",
      author: "Talent Lead, TechCo.",
      company: "TechCo"
    },
    {
      quote: "Candidates arrive better prepared and interviews are shorter but higher-quality.",
      author: "Head of Engineering, Buildr.",
      company: "Buildr"
    }
  ];
  
  return (
    <section ref={ref} className="py-16 sm:py-24 relative min-h-screen bg-gradient-to-b from-slate-800/40 via-slate-700/30 to-slate-800/40 z-20" id="trust">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold gradient-text mb-4 sm:mb-6">
            Trusted by leading companies
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto px-4">
            Join thousands of companies transforming their hiring process
          </p>
        </div>
        
        {/* Logo Grid Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 sm:mb-16">
          {['TechCo', 'Buildr', 'InnovateCorp', 'FutureTech'].map((company, index) => (
            <div
              key={company}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-neon-blue rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <p className="text-slate-300 font-semibold">{company}</p>
            </div>
          ))}
        </div>
        
        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/20"
            >
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-primary-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-300 text-lg leading-relaxed mb-4">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <MagneticButton 
            className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/10 backdrop-blur-sm border border-white/20-dark"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See case studies
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
});

// Candidate Journey Section
export const CandidateJourneySection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const steps = [
    {
      step: "1",
      title: "Sign up",
      description: "Name, email, password. Quick email OTP verification.",
      icon: UserPlus,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      step: "2",
      title: "Avatar setup",
      description: "Upload a photo or pick a preset, choose voice + background, add a welcome line.",
      icon: Camera,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      step: "3",
      title: "Resume parse",
      description: "Upload your CV — we auto-build your profile in ~2 minutes.",
      icon: Upload,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      step: "4",
      title: "Train your avatar",
      description: "Add videos, projects, social links and teach your assistant with docs.",
      icon: GraduationCap,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      step: "5",
      title: "Publish & share",
      description: "Get a unique profile link to add to LinkedIn or your portfolio.",
      icon: Share2,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section ref={ref} className="py-20 sm:py-28 relative min-h-screen bg-gradient-to-b from-slate-900/30 via-slate-800/20 to-slate-900/30 z-20" id="candidate-journey">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-6">
              Create your Candidate Space
            </h2>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Be discoverable, instantly. Build your professional presence in minutes.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-6"></div>
          </motion.div>
          
          {/* Journey Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 mb-16">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    className="relative z-10"
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className={`${step.bgColor} backdrop-blur-sm border ${step.borderColor} p-6 sm:p-8 rounded-3xl hover:scale-105 transition-all duration-300 group h-full flex flex-col`}>
                      {/* Step Number */}
                      <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <span className="text-white font-bold text-xl">{step.step}</span>
                      </div>
                      
                      {/* Icon */}
                      <div className="text-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="text-center flex-1 flex flex-col justify-between">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                          {step.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed flex-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 p-8 sm:p-12 rounded-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Ready to build your professional presence?
            </h3>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've already created their Candidate Spaces and are getting discovered by top companies.
            </p>
            
            <MagneticButton 
              className="px-10 sm:px-16 py-5 sm:py-6 text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create my Candidate Space
              <ArrowRight className="ml-4 w-6 h-6 sm:w-8 sm:h-8" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
});

// Employer Workflow Section
export const EmployerWorkflowSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const steps = [
    {
      step: "1",
      title: "Sign up & verify",
      description: "Company name, website, email verification.",
      icon: Mail,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      step: "2",
      title: "Design your space",
      description: "Pick an avatar, voice, and office background — add a welcome video.",
      icon: Settings,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20"
    },
    {
      step: "3",
      title: "Create departments",
      description: "Add videos and role templates.",
      icon: Building2,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      step: "4",
      title: "Publish jobs",
      description: "Auto-generate job descriptions, add screening questions, and launch.",
      icon: Briefcase,
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20"
    },
    {
      step: "5",
      title: "Engage",
      description: "Open candidate spaces, run avatar-driven pre-screens, and shortlist in one click.",
      icon: Zap,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20"
    }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <section ref={ref} className="py-20 sm:py-28 relative min-h-screen bg-gradient-to-b from-slate-800/30 via-slate-700/20 to-slate-800/30 z-20" id="employer-workflow">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-6">
              Build your Company Space
            </h2>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Hire at scale, with personality. Create an immersive hiring experience.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full mt-6"></div>
          </motion.div>
          
          {/* Workflow Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/30 via-violet-500/30 to-cyan-500/30 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 mb-16">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    className="relative z-10"
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className={`${step.bgColor} backdrop-blur-sm border ${step.borderColor} p-6 sm:p-8 rounded-3xl hover:scale-105 transition-all duration-300 group h-full flex flex-col`}>
                      {/* Step Number */}
                      <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <span className="text-white font-bold text-xl">{step.step}</span>
                      </div>
                      
                      {/* Icon */}
                      <div className="text-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="text-center flex-1 flex flex-col justify-between">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                          {step.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed flex-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm border border-white/10 p-8 sm:p-12 rounded-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Ready to transform your hiring process?
            </h3>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join forward-thinking companies that are already using BelloHire to attract top talent and create memorable candidate experiences.
            </p>
            
            <MagneticButton 
              className="px-10 sm:px-16 py-5 sm:py-6 text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Company Space
              <ArrowRight className="ml-4 w-6 h-6 sm:w-8 sm:h-8" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
});

// Footer
export const Footer = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  return (
    <footer ref={ref} className="py-16 relative z-20" id="about">
      <div className="container mx-auto px-6">
        <div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mb-8">
            {/* FAQ Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8 text-center">FAQ</h2>
              <div className="mt-8 space-y-6 max-w-4xl mx-auto">
                <motion.details 
                  className="group bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <summary className="font-semibold cursor-pointer text-white text-lg mb-3 flex items-center justify-between group-open:text-neon-blue">
                    <span>Is BelloHire a job board or an ATS?</span>
                    <motion.span 
                      className="text-neon-blue transition-transform duration-300 group-open:rotate-180"
                      animate={{ rotate: 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </summary>
                  <motion.div 
                    className="mt-4 text-slate-300 leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    Both. BelloHire is a job board, an employer-facing career site tool, and a full ATS — plus interactive candidate spaces and AI avatars.
                  </motion.div>
                </motion.details>

                <motion.details 
                  className="group bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <summary className="font-semibold cursor-pointer text-white text-lg mb-3 flex items-center justify-between group-open:text-neon-green">
                    <span>How does AI affect hiring fairness?</span>
                    <motion.span 
                      className="text-neon-green transition-transform duration-300 group-open:rotate-180"
                      animate={{ rotate: 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </summary>
                  <motion.div 
                    className="mt-4 text-slate-300 leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    AI helps surface skills and structured signals, reducing biased first impressions. We recommend regular audits and transparency on how models are used.
                  </motion.div>
                </motion.details>

                <motion.details 
                  className="group bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <summary className="font-semibold cursor-pointer text-white text-lg mb-3 flex items-center justify-between group-open:text-neon-purple">
                    <span>Can candidates control their avatar?</span>
                    <motion.span 
                      className="text-neon-purple transition-transform duration-300 group-open:rotate-180"
                      animate={{ rotate: 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </summary>
                  <motion.div 
                    className="mt-4 text-slate-300 leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    Yes — candidates choose the avatar look, voice, welcome speech, and what parts of their profile are public.
                  </motion.div>
                </motion.details>

                <motion.details 
                  className="group bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <summary className="font-semibold cursor-pointer text-white text-lg mb-3 flex items-center justify-between group-open:text-neon-pink">
                    <span>Do you record interviews?</span>
                    <motion.span 
                      className="text-neon-pink transition-transform duration-300 group-open:rotate-180"
                      animate={{ rotate: 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </summary>
                  <motion.div 
                    className="mt-4 text-slate-300 leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    We record interviews only with candidate consent. Recordings are used for evaluation and can be deleted on request.
                  </motion.div>
                </motion.details>

                <motion.details 
                  className="group bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <summary className="font-semibold cursor-pointer text-white text-lg mb-3 flex items-center justify-between group-open:text-neon-cyan">
                    <span>Integrations available?</span>
                    <motion.span 
                      className="text-neon-cyan transition-transform duration-300 group-open:rotate-180"
                      animate={{ rotate: 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </summary>
                  <motion.div 
                    className="mt-4 text-slate-300 leading-relaxed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    SSO, calendar sync, email/SMS, and ATS imports. Custom integrations available on Enterprise plans.
                  </motion.div>
                </motion.details>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {['Features', 'How it works', 'Pricing', 'About', 'Contact', 'Privacy'].map((link) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                {link}
              </motion.a>
            ))}
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500">
              © 2024 BelloHire. All rights reserved. Built with ❤️ for better hiring.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

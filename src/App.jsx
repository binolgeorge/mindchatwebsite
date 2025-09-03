import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useSpring as useSpringPhysics, animated } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { useMouse } from 'react-use';
import { 
  Sparkles, 
  Zap, 
  Users, 
  Building2, 
  Brain, 
  Target, 
  ArrowRight, 
  Play,
  Star,
  CheckCircle,
  Globe,
  Shield,
  BarChart3,
  MessageCircle,
  Calendar,
  Code,
  Video,
  FileText,
  ChevronDown,
  Menu,
  X,
  Building,
  Bot,
  Wrench
} from 'lucide-react';
import { 
  BenefitsSection, 
  FeaturesSection, 
  HowItWorksSection, 
  PricingSection,
  TrustSection,
  CandidateJourneySection,
  EmployerWorkflowSection,
  Footer 
} from './components';

// Custom hooks for animations
const useParallax = (value, distance) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

const useMagneticEffect = (ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.1;
    const deltaY = (e.clientY - centerY) * 0.1;
    
    setPosition({ x: deltaX, y: deltaY });
  }, [ref]);
  
  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);
  
  return { position, handleMouseMove, handleMouseLeave };
};

// Particle System Component
const ParticleSystem = React.memo(() => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary-400"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

// Animated Gradient Background
const AnimatedBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/20 via-transparent to-neon-purple/10 animate-gradient" />
      <div className="absolute inset-0 noise-texture" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-500/5 via-transparent to-transparent rounded-full blur-3xl" />
    </div>
  );
});

// Space Background with Shooting Stars
const SpaceBackground = React.memo(() => {
  const [stars, setStars] = React.useState([]);
  const [shootingStars, setShootingStars] = React.useState([]);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    // Generate realistic star field with different star types
    const generateStars = () => {
      const newStars = [];
      const starTypes = ['star-small', 'star-medium', 'star-large', 'star-bright'];
      const starWeights = [0.6, 0.25, 0.1, 0.05]; // More small stars, fewer bright ones
      
      for (let i = 0; i < 200; i++) {
        // Weighted random selection for star types
        const random = Math.random();
        let cumulativeWeight = 0;
        let selectedType = 'star-small';
        
        for (let j = 0; j < starTypes.length; j++) {
          cumulativeWeight += starWeights[j];
          if (random <= cumulativeWeight) {
            selectedType = starTypes[j];
            break;
          }
        }
        
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: selectedType,
          delay: Math.random() * 3,
          duration: 1.5 + Math.random() * 3
        });
      }
      setStars(newStars);
    };
    
    // Generate realistic shooting stars with proper physics
    const generateShootingStars = () => {
      const animations = [
        'shooting-star-realistic',
        'shooting-star-reverse-realistic', 
        'shooting-star-vertical-realistic',
        'shooting-star-horizontal-realistic',
        'shooting-star-diagonal-2-realistic'
      ];
      
      const colors = [
        { bg: 'radial-gradient(circle, #ffffff 0%, #ffffff 30%, #3b82f6 70%, transparent 100%)', glow: '#3b82f6' },
        { bg: 'radial-gradient(circle, #ffffff 0%, #ffffff 30%, #8b5cf6 70%, transparent 100%)', glow: '#8b5cf6' },
        { bg: 'radial-gradient(circle, #ffffff 0%, #ffffff 30%, #06b6d4 70%, transparent 100%)', glow: '#06b6d4' },
        { bg: 'radial-gradient(circle, #ffffff 0%, #ffffff 30%, #10b981 70%, transparent 100%)', glow: '#10b981' },
        { bg: 'radial-gradient(circle, #ffffff 0%, #ffffff 30%, #f59e0b 70%, transparent 100%)', glow: '#f59e0b' }
      ];
      
      const newShootingStars = [];
      for (let i = 0; i < 6; i++) { // Fewer but more realistic shooting stars
        const animation = animations[Math.floor(Math.random() * animations.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        newShootingStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          animation: animation,
          delay: Math.random() * 15,
          duration: 2 + Math.random() * 4,
          size: 1.5 + Math.random() * 1.5, // Smaller, more realistic sizes
          color: color
        });
      }
      setShootingStars(newShootingStars);
    };
    
    generateStars();
    generateShootingStars();
    
    // Regenerate shooting stars every 15 seconds for continuous variety
    const interval = setInterval(() => {
      generateShootingStars();
    }, 15000);
    
    // Mouse interaction for cosmic effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className="space-bg">
      {/* Volumetric Nebula Effects */}
      <div className="nebula nebula-1"></div>
      <div className="nebula nebula-2"></div>
      <div className="nebula nebula-3"></div>
      <div className="nebula nebula-4"></div>
      
      {/* Realistic Star Field */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`twinkle-star ${star.type}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}
      
      {/* Realistic Shooting Stars with Motion Blur */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="shooting-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationName: star.animation,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color.bg,
            boxShadow: `0 0 ${star.size * 2}px #ffffff, 0 0 ${star.size * 4}px ${star.color.glow}, 0 0 ${star.size * 6}px ${star.color.glow}`
          }}
        />
      ))}
      
      {/* Realistic Planets with Orbital Physics */}
      <div className="planet planet-small" style={{ top: '30%', left: '50%' }}></div>
      <div className="planet planet-medium" style={{ top: '60%', left: '20%' }}></div>
      <div className="planet planet-large" style={{ top: '20%', right: '10%' }}></div>
      
      {/* Mouse-Interactive Cosmic Effect */}
      <div 
        className="absolute w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(20px)',
          transition: 'all 0.1s ease-out'
        }}
      />
    </div>
  );
});

// Magnetic Button Component
const MagneticButton = React.memo(({ children, className = "", onClick, ...props }) => {
  const ref = React.useRef(null);
  const { position, handleMouseMove, handleMouseLeave } = useMagneticEffect(ref);
  
  return (
    <motion.button
      ref={ref}
      className={`magnetic glass hover:glass-dark transition-all duration-300 ${className}`}
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

// Hero Section
const HeroSection = React.memo(() => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const mouseRef = React.useRef(null);
  const mouse = useMouse(mouseRef);
  
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        staggerChildren: 0.2,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden pt-20 z-20" id="hero">
      <AnimatedBackground />
      <ParticleSystem />
      
      {/* Floating Elements - Hidden on mobile */}
              <motion.div
          className="absolute top-20 left-4 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hidden sm:flex"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="w-8 h-8 sm:w-16 sm:h-16 text-blue-400" />
      </motion.div>
      
              <motion.div
          className="absolute top-32 right-4 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hidden sm:flex"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Zap className="w-6 h-6 sm:w-12 sm:h-12 text-purple-400" />
      </motion.div>
      
              <motion.div
          className="absolute bottom-20 left-4 sm:left-32 w-14 h-14 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hidden sm:flex"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Users className="w-7 h-7 sm:w-14 sm:h-14 text-green-400" />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-12 sm:mb-16 text-center">
            <motion.h1 
              className="text-5xl sm:text-7xl md:text-9xl font-display font-bold mb-6 sm:mb-8 gradient-text"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              BelloHire
            </motion.h1>
            <motion.h2 
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4 sm:mb-6 max-w-4xl mx-auto leading-tight"
              variants={itemVariants}
            >
              Get matched. Get hired. Hire better.
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              AI-powered job board with virtual office spaces for real matches, less noise
            </motion.p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16 sm:mb-20"
          >
            <MagneticButton 
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get started — it's free
              <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </MagneticButton>
            
            <MagneticButton 
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="mr-3 w-5 h-5 sm:w-6 sm:h-6" />
              See demo
            </MagneticButton>
          </motion.div>
          

        </motion.div>
      </div>
      

    </section>
  );
});

// Hero Details Section - Contains the removed content
const HeroDetailsSection = React.memo(() => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-gradient-to-b from-slate-900/20 to-slate-800/30 relative overflow-hidden z-20" id="hero-details">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-purple-500/5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-5xl mx-auto"
        >
          {/* Section Header */}
          <motion.div 
            variants={itemVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-text mb-6">
              One Clear Promise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            variants={itemVariants}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16"
          >
            {/* Left Side - Main Text */}
            <div className="space-y-8">
              <motion.div
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 sm:p-10 rounded-3xl hover:bg-white/10 transition-all duration-500"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed mb-6">
                  Imagine a hiring process where candidates feel <span className="text-blue-400 font-semibold">calm & Informed</span>, 
                  hiring teams get <span className="text-green-400 font-semibold">accurate signals</span>, 
                  and culture clicks <em className="text-purple-400 font-semibold">before</em> the interview.
                </p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 p-8 sm:p-10 rounded-3xl"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                  BelloHire is an AI-driven recruitment platform that combines 
                  <span className="text-blue-400 font-semibold"> interactive career sites</span>, 
                  <span className="text-purple-400 font-semibold"> virtual office spaces</span>, 
                  and <span className="text-green-400 font-semibold">smart avatars</span> so companies find the right people — and people 
                  find the right companies — faster and with less awkwardness.
                </p>
              </motion.div>
            </div>

            {/* Right Side - Feature Cards */}
            <div className="space-y-6">
              {[
                {
                  icon: Building,
                  title: "Interactive 3D Spaces",
                  description: "Candidate spaces and company career sites",
                  color: "text-blue-400"
                },
                {
                  icon: Bot,
                  title: "AI Avatars",
                  description: "Answer questions, run screening, and prep candidates",
                  color: "text-purple-400"
                },
                {
                  icon: Wrench,
                  title: "Built-in Tools",
                  description: "ATS, coding assessments, and video/text interviews",
                  color: "text-green-400"
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 sm:p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 group"
                    whileHover={{ scale: 1.05, x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Call to Action */}
          <motion.div 
            variants={itemVariants}
            className="text-center bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 rounded-2xl"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Ready to replace guesswork with real fit?
            </h3>
            
            <MagneticButton 
              className="px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 rounded-full shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get started — it's free
              <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

// Main App Component
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <SpaceBackground />
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass-dark backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="text-xl sm:text-2xl font-display font-bold gradient-text"
              whileHover={{ scale: 1.05 }}
            >
              BelloHire
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-6">
              {[
                { name: 'Features', id: 'features' },
                { name: 'How it works', id: 'how-it-works' },
                { name: 'Trust', id: 'trust' },
                { name: 'Pricing', id: 'pricing' },
                { name: 'About', id: 'about' }
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={`#${item.id}`}
                  className="text-slate-300 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <MagneticButton className="px-4 sm:px-6 py-2 text-sm font-semibold">
                Sign In
              </MagneticButton>
              
              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="absolute top-0 right-0 w-80 h-full glass-dark"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6 pt-20">
                {[
                  { name: 'Features', id: 'features' },
                  { name: 'How it works', id: 'how-it-works' },
                  { name: 'Trust', id: 'trust' },
                  { name: 'Pricing', id: 'pricing' },
                  { name: 'About', id: 'about' }
                ].map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={`#${item.id}`}
                    className="block py-4 text-lg text-slate-300 hover:text-white transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main id="main-content">
        <HeroSection />
        <HeroDetailsSection />
        <BenefitsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
        <CandidateJourneySection />
        <EmployerWorkflowSection />
        <PricingSection />
        <Footer />
      </main>
      
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-neon-blue z-50"
        style={{ scaleX: scrollYProgress }}
        transformOrigin="0%"
      />
    </div>
  );
};

export default App;

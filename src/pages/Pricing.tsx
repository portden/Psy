import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Star, Crown, Brain, Menu, X, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '../components/Navbar';

const plans = [
  {
    name: "Basic",
    price: "$49",
    description: "Perfect for beginners starting their psychology journey.",
    features: [
      "Access to 5 Foundation Courses",
      "Community Forum Access",
      "Digital Certificates",
      "Email Support"
    ],
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    color: "bg-indigo-50"
  },
  {
    name: "Professional",
    price: "$99",
    description: "Ideal for practitioners looking to expand their skills.",
    features: [
      "Access to All Courses",
      "Monthly Live Webinars",
      "Priority Email Support",
      "Resource Library Access",
      "Verified Certificates"
    ],
    icon: <Shield className="w-6 h-6 text-emerald-600" />,
    color: "bg-emerald-50",
    popular: true
  },
  {
    name: "Expert",
    price: "$199",
    description: "Advanced training for clinical specialists.",
    features: [
      "Everything in Professional",
      "1-on-1 Mentorship Session",
      "Case Study Review",
      "Direct Line to Instructors",
      "Career Coaching"
    ],
    icon: <Star className="w-6 h-6 text-amber-600" />,
    color: "bg-amber-50"
  },
  {
    name: "Institutional",
    price: "Custom",
    description: "Tailored solutions for clinics and universities.",
    features: [
      "Unlimited Team Members",
      "Custom Curriculum Design",
      "LMS Integration",
      "Dedicated Account Manager",
      "On-site Training Options"
    ],
    icon: <Crown className="w-6 h-6 text-rose-600" />,
    color: "bg-rose-50"
  }
];

import Footer from '../components/Footer';

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<{name: string} | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string) => {
    setToast(msg);
  };

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    setIsApplying(true);
    try {
      await addDoc(collection(db, "applications"), {
        name,
        email,
        phone,
        planName: selectedPlan.name,
        type: 'plan_subscription',
        createdAt: serverTimestamp(),
      });

      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          courseTitle: `Subscription: ${selectedPlan.name}`
        }),
      });
      
      if (response.ok) {
        showToast("Заявка успешно отправлена!");
        setSelectedPlan(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || response.statusText;
        console.error("Backend Error response:", errorData);
        showToast(`Ошибка отправки: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      showToast(`Ошибка: ${error.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handlePhoneInput = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('380')) {
      // Keep it
    } else if (value.startsWith('80')) {
      value = '3' + value;
    } else if (value.startsWith('0')) {
      value = '38' + value;
    } else if (value.length > 0) {
      value = '380' + value;
    }

    // Limit to 12 digits (380 + 9 digits)
    value = value.substring(0, 12);

    // Format: +380 (XX) XXX-XX-XX
    let formatted = '+';
    if (value.length > 0) {
      formatted += value.substring(0, 3);
      if (value.length > 3) {
        formatted += ' (' + value.substring(3, 5);
        if (value.length > 5) {
          formatted += ') ' + value.substring(5, 8);
          if (value.length > 8) {
            formatted += '-' + value.substring(8, 10);
            if (value.length > 10) {
              formatted += '-' + value.substring(10, 12);
            }
          }
        }
      }
    } else {
      formatted = '';
    }
    
    e.target.value = formatted;
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-8">
                <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h3>
                <p className="text-slate-500">You are subscribing to: <span className="text-indigo-600 font-semibold">{selectedPlan.name} Plan</span></p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                  <input 
                    name="name"
                    type="text" 
                    required 
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                  <input 
                    name="email"
                    type="email" 
                    required 
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Phone Number (Ukraine)</label>
                  <input 
                    name="phone"
                    type="tel" 
                    required 
                    onChange={handlePhoneInput}
                    placeholder="+380 (XX) XXX-XX-XX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <button 
                  disabled={isApplying}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isApplying ? "Sending..." : "Submit Application"}
                  {!isApplying && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-6"
            >
              Simple, Transparent <span className="text-indigo-600">Pricing</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Choose the plan that best fits your professional goals and learning pace.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-[2.5rem] border ${plan.popular ? 'border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-sm'} flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                
                <div className={`${plan.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                  {plan.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-slate-500">/month</span>}
                </div>
                <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedPlan({ name: plan.name })}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-slate-50 rounded-[3rem] text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Not sure which plan is right for you?</h2>
            <p className="text-slate-600 mb-8">Our advisors are here to help you map out your educational path.</p>
            <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold hover:bg-slate-100 transition-all">
              Schedule a Free Consultation
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

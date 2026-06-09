import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Brain, 
  BookOpen, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  ChevronRight,
  Heart,
  Shield,
  Zap,
  MessageCircle
} from 'lucide-react';

const courses = [
  {
    id: 1,
    title: "Cognitive Behavioral Therapy Essentials",
    category: "Clinical Psychology",
    duration: "12 Weeks",
    rating: 4.9,
    students: "2.4k",
    price: "$299",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
    description: "Master the fundamentals of CBT and learn practical techniques for treating anxiety and depression."
  },
  {
    id: 2,
    title: "Child Development & Psychology",
    category: "Developmental",
    duration: "8 Weeks",
    rating: 4.8,
    students: "1.8k",
    price: "$199",
    image: "https://images.unsplash.com/photo-1502086223501-7ea24ec83a95?auto=format&fit=crop&q=80&w=800",
    description: "Understand the psychological milestones of childhood and adolescence in this comprehensive guide."
  },
  {
    id: 3,
    title: "Neuroscience of Mindfulness",
    category: "Neuropsychology",
    duration: "6 Weeks",
    rating: 5.0,
    students: "3.1k",
    price: "$149",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    description: "Explore the brain mechanisms behind meditation and how it reshapes our neural pathways."
  }
];

const testimonials = [
  {
    name: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist",
    content: "The depth of material in the CBT course surpassed my expectations. It's an invaluable resource for both students and practitioners.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Marcus Thorne",
    role: "Social Worker",
    content: "PsycheAcademy has transformed how I approach my clients. The practical tools are immediately applicable in real-world scenarios.",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  }
];

import Footer from '../components/Footer';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<{id: number, title: string} | null>(null);
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

  const handleNewsletterSignup = async (e: FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    if (!email) return;

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        (e.target as any).reset();
      } else {
        showToast(data.error || "Something went wrong.");
      }
    } catch (error) {
      showToast("Failed to connect to the server.");
    }
  };

  const handleEnroll = async (courseId: number, courseTitle: string) => {
    setSelectedCourse({ id: courseId, title: courseTitle });
  };

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

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
        courseId: selectedCourse.id.toString(),
        courseTitle: selectedCourse.title,
        createdAt: serverTimestamp(),
      });

      let emailSuccess = false;
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          courseId: selectedCourse.id.toString(),
          courseTitle: selectedCourse.title
        }),
      }).catch(err => {
        console.warn("Backend apply API failed, trying client-side delivery...", err);
        return null;
      });
      
      if (response && response.ok) {
        emailSuccess = true;
      } else {
        console.warn("Server-side EmailJS failed or was blocked. Falling back to browser-direct EmailJS...");
        try {
          const emailJsPayload = {
            service_id: "portservice",
            template_id: "template_wl7km5e",
            user_id: "nDTYKeAEEZY5bxkRB",
            template_params: {
              name,
              course_title: selectedCourse.title,
              course: selectedCourse.title,
              email,
              phone: phone || "Не указан"
            }
          };
          const fbResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailJsPayload)
          });
          if (fbResponse.ok) {
            emailSuccess = true;
            console.log("Browser-direct EmailJS send successful as fallback!");
          } else {
            console.error("Browser-direct EmailJS also failed:", await fbResponse.text());
          }
        } catch (fbErr: any) {
          console.error("Browser-direct EmailJS fallback exception:", fbErr);
        }
      }

      if (emailSuccess) {
        showToast("Заявка успешно отправлена!");
        setSelectedCourse(null);
      } else {
        showToast("Заявка сохранена в базу данных, но возникла проблема с почтовым уведомлением.");
        setSelectedCourse(null);
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

    value = value.substring(0, 12);

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
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-8">
                <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Apply for Course</h3>
                <p className="text-slate-500">You are applying for: <span className="text-indigo-600 font-semibold">{selectedCourse.title}</span></p>
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

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-50/50 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Star className="w-4 h-4 fill-indigo-700" />
                <span>Top Rated Psychology Platform 2024</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.1] mb-8">
                Unlock the Secrets of the <span className="text-indigo-600 italic">Human Mind</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                Master the art and science of psychology with world-class instructors. From clinical foundations to cutting-edge neuroscience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                  Explore Courses <ArrowRight className="w-5 h-5" />
                </button>
                <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  View Curriculum
                </button>
              </div>
              
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-900">15,000+ Students</p>
                  <p className="text-slate-500">Joined in the last 30 days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200" 
                  alt="Students learning" 
                  className="w-full h-full object-cover aspect-[4/5] lg:aspect-square"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
              </div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Certified</p>
                    <p className="text-sm font-bold text-slate-900">APA Accredited</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Support</p>
                    <p className="text-sm font-bold text-slate-900">1-on-1 Mentoring</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Courses', value: '45+' },
              { label: 'Active Students', value: '120k' },
              { label: 'Instructors', value: '85' },
              { label: 'Satisfaction', value: '99%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">Featured Programs</h2>
              <p className="text-lg text-slate-600 max-w-xl">
                Our curriculum is designed by leading experts in the field to provide you with both theoretical knowledge and practical skills.
              </p>
            </div>
            <button className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All Courses <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                    {course.category}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{course.rating}</span>
                    </div>
                    <button 
                      onClick={() => handleEnroll(course.id, course.title)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Enroll {course.price}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-indigo-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6">Why Choose PsycheAcademy?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We combine academic rigor with modern learning technology to create an unparalleled educational experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Accredited Learning",
                description: "Our courses are recognized by major psychological associations worldwide, ensuring your certification carries weight."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Practical Application",
                description: "Go beyond theory with case studies, role-playing exercises, and real-world clinical scenarios."
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Expert Mentorship",
                description: "Get direct access to practicing psychologists and neuroscientists who guide you through your journey."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-8">What Our Graduates Say</h2>
              <div className="space-y-8">
                {testimonials.map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
                  >
                    <p className="text-lg text-slate-600 italic mb-6">"{t.content}"</p>
                    <div className="flex items-center gap-4">
                      <img src={t.avatar} className="w-12 h-12 rounded-full" alt={t.name} />
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-sm text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-indigo-600 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Happy graduate" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-2xl max-w-xs hidden md:block">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-900 font-bold mb-2">"The best investment I've made for my career."</p>
                <p className="text-sm text-slate-500">— James Wilson, MSc Psychology</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">Everything you need to know about our courses and platform.</p>
          </div>
          <div className="space-y-6">
            {[
              { q: "Are the courses accredited?", a: "Yes, all our major programs are accredited by the International Psychology Association (IPA) and recognized by major clinical boards." },
              { q: "Can I learn at my own pace?", a: "Absolutely. Once you enroll, you have lifetime access to the course material, allowing you to learn whenever it fits your schedule." },
              { q: "Is there a certificate upon completion?", a: "Yes, you will receive a digital certificate of completion that you can share on LinkedIn or add to your professional portfolio." },
              { q: "Do you offer financial aid?", a: "We offer flexible payment plans and scholarships for eligible students. Contact our support team for more details." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-xl font-bold text-slate-900 mb-3">{item.q}</h4>
                <p className="text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white blur-[120px] rounded-full" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-8">Ready to Start Your Journey?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                Join thousands of students and professionals who are already mastering the complexities of the human mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-indigo-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-indigo-50 transition-all">
                  Enroll Now
                </button>
                <button className="bg-indigo-500 text-white border border-indigo-400 px-10 py-5 rounded-full font-bold text-xl hover:bg-indigo-400 transition-all">
                  Talk to an Advisor
                </button>
              </div>
              <p className="mt-8 text-indigo-200 text-sm">
                No credit card required for trial • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

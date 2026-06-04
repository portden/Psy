import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Shield className="w-4 h-4" />
              <span>Your privacy is our priority</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-8">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Last updated: April 21, 2026
            </p>
          </motion.div>

          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Eye className="w-8 h-8 text-indigo-600" />
                1. Information We Collect
              </h2>
              <p className="mb-4">
                At PsycheAcademy, we collect information to provide better services to all our students. The types of information we collect include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you register for an account using Google or Facebook, we receive your name, email address, and profile picture.</li>
                <li><strong>Application Data:</strong> Information you provide when applying for courses, such as your name, email, and phone number.</li>
                <li><strong>Usage Data:</strong> We may collect information about how you interact with our platform to improve our curriculum and user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Lock className="w-8 h-8 text-indigo-600" />
                2. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our services, including processing course applications.</li>
                <li>To communicate with you regarding your studies, updates, and promotional offers (if you've opted in).</li>
                <li>To analyze platform usage and improve our educational content.</li>
                <li>To comply with legal obligations and protect the security of our users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                3. Data Sharing and Disclosure
              </h2>
              <p>
                We do not sell your personal information to third parties. We only share your data with trusted partners who help us operate our platform (e.g., email service providers, database management) under strict confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8 p-10 bg-indigo-50 rounded-[2rem] text-center">
                Questions? Contact us at <span className="text-indigo-600 italic">privacy@psycheacademy.com</span>
              </h2>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

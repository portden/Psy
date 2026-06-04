import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, CheckCircle2, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DataDeletion: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const reason = formData.get('reason') as string;

    try {
      await addDoc(collection(db, 'deletion_requests'), {
        email,
        reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Deletion request error:', err);
      setError('Could not submit the request. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Trash2 className="w-4 h-4" />
              <span>Right to be forgotten</span>
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-8">
              Data Deletion <span className="text-rose-600">Request</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We respect your right to privacy. Use this form to request the permanent deletion of your account and personal data from our systems.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-8 lg:p-12 shadow-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-1 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-2">Email associated with your account</label>
                        <input 
                          type="email" 
                          name="email"
                          required 
                          placeholder="john@example.com"
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-2">Reason for deletion (optional)</label>
                        <textarea 
                          name="reason"
                          rows={4}
                          placeholder="Please let us know how we can improve..."
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-medium resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-start gap-4">
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-rose-800 leading-relaxed font-medium">
                        <strong>Warning:</strong> This action is irreversible. Once processed, all your course progress, certificates, and personal information will be permanently removed.
                      </p>
                    </div>

                    {error && (
                      <p className="text-rose-600 text-sm font-bold text-center">{error}</p>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isSubmitting ? "Processing..." : "Submit Deletion Request"}
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Request Submitted</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">
                    Our team has received your request. We will verify your account and process the deletion within 72 hours. You will receive a final confirmation email.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Send another request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 pt-12 border-t border-slate-200 grid md:grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-200/50 p-3 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">GDPR Complaint</h4>
                  <p className="text-xs text-slate-500">Fully aligned with EU data laws.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-200/50 p-3 rounded-xl">
                  <Lock className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Secure Handling</h4>
                  <p className="text-xs text-slate-500">Encrypted data processing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DataDeletion;

import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter logic would go here, omitting for simplicity or connecting to /api/newsletter
    const email = (e.target as any).email.value;
    console.log('Newsletter signup:', email);
    (e.target as any).reset();
    alert("Thanks for subscribing!");
  };

  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">PsycheAcademy</span>
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Empowering the next generation of psychologists through world-class education and technology.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link to="/#courses" className="hover:text-indigo-600 transition-colors">Courses</Link></li>
              <li><button className="hover:text-indigo-600 transition-colors cursor-pointer text-left">Instructors</button></li>
              <li><button className="hover:text-indigo-600 transition-colors cursor-pointer text-left">Certifications</button></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors cursor-pointer">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link to="/#about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
              <li><button className="hover:text-indigo-600 transition-colors cursor-pointer text-left">Careers</button></li>
              <li><button className="hover:text-indigo-600 transition-colors cursor-pointer text-left">Blog</button></li>
              <li><a href="mailto:support@psycheacademy.com" className="hover:text-indigo-600 transition-colors cursor-pointer">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Newsletter</h4>
            <p className="text-slate-500 mb-4 text-sm">Get the latest psychology insights delivered to your inbox.</p>
            <form onSubmit={handleNewsletterSignup} className="flex gap-2">
              <input 
                name="email"
                type="email" 
                placeholder="Email address" 
                required
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <p>© 2024 PsycheAcademy. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-indigo-600 cursor-pointer">Privacy Policy</Link>
            <Link to="/data-deletion" className="hover:text-indigo-600 cursor-pointer">Data Deletion</Link>
            <button className="hover:text-indigo-600 cursor-pointer">Terms of Service</button>
            <button className="hover:text-indigo-600 cursor-pointer">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

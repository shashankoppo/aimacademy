import { Link } from "react-router-dom";
import { Youtube, Instagram, Facebook, Twitter, Mail, Globe } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";

const Footer = () => {
  const { websiteSettings } = useAdminData();
  const socialLinks = websiteSettings?.socialLinks || [];

  const getIconForPlatform = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-5 h-5"/>;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-5 h-5"/>;
    if (p.includes('youtube')) return <Youtube className="w-5 h-5"/>;
    if (p.includes('instagram')) return <Instagram className="w-5 h-5"/>;
    return <Globe className="w-5 h-5"/>;
  };
  return (
    <footer className="bg-white text-slate-600 pt-16 pb-4 border-t border-slate-100">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
             <Link to="/" className="flex items-center gap-2 mb-6">
               <img src="/images/logo_main.png" alt="Logo" className="w-14" />
                <div className="flex flex-col">
                  <span className="font-black text-xl leading-none text-slate-800 tracking-tighter">
                    <span className="lang-en-only">AIM ACADEMY</span>
                    <span className="lang-hi-only notranslate" translate="no">ए आई एम एकेडमी</span>
                  </span>
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em] -mt-0.5 self-end pr-1">
                    <span className="lang-en-only">Synonym of Success</span>
                    <span className="lang-hi-only notranslate" translate="no">सफलता का पर्याय</span>
                  </span>
                </div>
             </Link>
             <p className="text-sm leading-relaxed mb-6 text-slate-500">
               AIM Academy is India's most trusted offline education platform that provides affordable & comprehensive learning experience to students for various competitive exams.
             </p>
             <div className="flex gap-4">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-slate-900 transition-all">
                    {getIconForPlatform(link.platform)}
                  </a>
                ))}
             </div>
          </div>

          {/* Links 1 */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">Our Courses</Link></li>
              <li><Link to="/results" className="hover:text-primary transition-colors">Results</Link></li>
              <li><Link to="/resources" className="hover:text-primary transition-colors">Resources</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="lg:col-span-3">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8">Popular Exams</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/courses" className="hover:text-primary transition-colors">UPSC & MP PSC</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">SI & Police Constable</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">SSC & CGL Special</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">Railways & Vyapam</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">All Other Government Exams</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8">Course Related Query</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="hover:text-primary transition-colors font-semibold">Ask Your Doubts</Link></li>
              <li className="flex items-center gap-2">
                 <Mail className="w-4 h-4 text-slate-400" />
                 <a href="mailto:info@aimacademy.in" className="hover:text-primary transition-colors">info@aimacademy.in</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-medium uppercase tracking-wider">
          <div className="text-center md:text-left space-y-2">
            <p className="text-slate-900">
              © {new Date().getFullYear()}{" "}
              <span className="lang-en-only">AIM Academy</span>
              <span className="lang-hi-only notranslate" translate="no">ए आई एम एकेडमी</span>
              . All Rights Reserved.
            </p>
            <p className="text-slate-400">Technical Partner: <span className="text-slate-900 font-bold">ELSxGlobal</span> (Division of Evolucentsphere Pvt Ltd)</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

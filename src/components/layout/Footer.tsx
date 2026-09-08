import Link from "next/link";
import { ShieldCheck, Clock, Award, Headphones } from "lucide-react";
import { WorksyLogo } from "@/components/layout/WorksyLogo";

export function Footer() {
  return (
    <footer className="bg-[#0e1a39] text-slate-400 text-sm border-t border-[#1c2e5c]">
      {/* Trust Highlights Strip */}
      <div className="border-b border-[#1c2e5c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Verified</h4>
                <p className="text-xs text-slate-400">Background-checked partners</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Worksy Guarantee</h4>
                <p className="text-xs text-slate-400">Up to ₹10,000 damage cover</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">On-Time Arrival</h4>
                <p className="text-xs text-slate-400">Or ₹100 credit added</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Dedicated Support</h4>
                <p className="text-xs text-slate-400">7 AM – 11 PM every day</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <WorksyLogo variant="footer" height={46} showLink />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Worksy connects you with verified local service professionals. A simpler way to get work done.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              <p>Worksy Platform Operations Inc.</p>
              <p>Operating in Bangalore, Mumbai, and Delhi NCR.</p>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Top Categories
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/services?category=home-maintenance" className="hover:text-teal-400 transition-colors">Home Maintenance</Link></li>
              <li><Link href="/services?category=appliance-services" className="hover:text-teal-400 transition-colors">Appliance Services</Link></li>
              <li><Link href="/services?category=cleaning" className="hover:text-teal-400 transition-colors">Deep Cleaning</Link></li>
              <li><Link href="/services?category=beauty" className="hover:text-teal-400 transition-colors">Salon & Beauty</Link></li>
              <li><Link href="/services?category=health" className="hover:text-teal-400 transition-colors">Home Healthcare</Link></li>
              <li><Link href="/services?category=technology" className="hover:text-teal-400 transition-colors">Device & IT Setup</Link></li>
            </ul>
          </div>

          {/* For Professionals & Admin */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Partners & Portal
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/professional" className="hover:text-teal-400 transition-colors">Become a Partner</Link></li>
              <li><Link href="/professional/dashboard" className="hover:text-teal-400 transition-colors">Partner Dashboard</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">Customer Hub</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-teal-400 transition-colors">Enterprise Admin</Link></li>
              <li><Link href="/services" className="hover:text-teal-400 transition-colors">Catalog Directory</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Policies
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-teal-400 transition-colors">Refund & Cancellation</Link></li>
              <li><Link href="/faq" className="hover:text-teal-400 transition-colors">Help Center & FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1c2e5c] text-xs text-center text-slate-500">
          <p>© 2026 Worksy Technologies. All rights reserved. Trusted services. Made simple.</p>
        </div>
      </div>
    </footer>
  );
}

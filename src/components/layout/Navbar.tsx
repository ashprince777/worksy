"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  Shield,
  Briefcase,
  Layers,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                W
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  WORKSY
                </span>
                <span className="block text-[10px] uppercase font-semibold text-teal-600 tracking-wider -mt-1">
                  Trusted Services
                </span>
              </div>
            </Link>

            {/* City Selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Select City"
                className="bg-transparent font-medium cursor-pointer focus:outline-none"
              >
                <option value="Bangalore">Bangalore (BLR)</option>
                <option value="Mumbai">Mumbai (BOM)</option>
                <option value="Delhi">Delhi NCR (DEL)</option>
              </select>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form
              action="/services"
              method="GET"
              className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm hover:border-teal-500/50 focus-within:border-teal-500 focus-within:bg-white transition-all shadow-sm"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder='Search "AC repair", "cleaning", "electrician"...'
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </form>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/services"
              className="hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              <Layers className="w-4 h-4" />
              Services
            </Link>

            <Link
              href="/professional"
              className="hover:text-teal-600 transition-colors flex items-center gap-1 text-slate-700"
            >
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Become a Pro
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={
                    user.role === "PROFESSIONAL"
                      ? "/professional/dashboard"
                      : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
                      ? "/admin/dashboard"
                      : "/dashboard"
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm transition-all hover:shadow"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span>Customer Portal</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/services"
              className="p-2 rounded-lg bg-slate-100 text-slate-600"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              All Services
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-teal-600 hover:bg-teal-50"
            >
              Customer Dashboard
            </Link>
            <Link
              href="/professional"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Become a Professional
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-600 hover:bg-amber-50"
            >
              Enterprise Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

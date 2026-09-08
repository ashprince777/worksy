"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  User,
  Menu,
  X,
  Briefcase,
  Layers,
  LogOut,
  ChevronDown,
  CalendarCheck,
  ShieldCheck,
  Award,
  Settings,
} from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const getDashboardUrl = () => {
    if (!user) return "/dashboard";
    if (user.role === "PROFESSIONAL") return "/professional/dashboard";
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return "/admin/dashboard";
    return "/dashboard";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Admin</span>;
      case "PROFESSIONAL":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Pro</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">Member</span>;
    }
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

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
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

            {!loading && (
              <>
                {user ? (
                  /* Authenticated User Menu */
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-800"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="text-xs font-semibold max-w-[100px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      {getRoleBadge(user.role)}
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href={getDashboardUrl()}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <User className="w-4 h-4 text-teal-600" />
                            <span>My Dashboard</span>
                          </Link>

                          {user.role === "CUSTOMER" && (
                            <>
                              <Link
                                href="/dashboard/bookings"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                              >
                                <CalendarCheck className="w-4 h-4 text-teal-600" />
                                <span>My Bookings</span>
                              </Link>
                              <Link
                                href="/dashboard/rewards"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                              >
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>Worksy Rewards</span>
                              </Link>
                            </>
                          )}

                          {user.role === "PROFESSIONAL" && (
                            <Link
                              href="/professional/dashboard/calendar"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <CalendarCheck className="w-4 h-4 text-indigo-600" />
                              <span>Schedule & Jobs</span>
                            </Link>
                          )}

                          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              <span>Operations Center</span>
                            </Link>
                          )}

                          <Link
                            href="/dashboard/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>Account Settings</span>
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Guest / Unauthenticated Actions */
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition-all hover:shadow"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
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
            {user && (
              <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                {getRoleBadge(user.role)}
              </div>
            )}

            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              All Services
            </Link>

            <Link
              href="/professional"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Become a Professional
            </Link>

            {user ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-teal-600 hover:bg-teal-50"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

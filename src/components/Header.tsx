import { useState } from "react";
import tupLogo from "../assets/tup-logo.png";
import AdmissionProcessModal from "./AdmissionProcessModal";

interface HeaderProps {
  // No props needed for now, but keeping interface for future extensibility
}

export default function Header({}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);

  return (
    <header
      className="text-white px-4 md:px-8 lg:px-16 py-4"
      style={{ background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side - Logo and University Name */}
        <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
          <div className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 md:h-16 md:w-16 flex-shrink-0">
            <img
              src={tupLogo}
              alt="TUP Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-tight truncate">
            Technological University of the Philippines
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 md:gap-6">
          <a
            href="#admissions"
            onClick={(e) => {
              e.preventDefault();
              setIsAdmissionModalOpen(true);
            }}
            className="text-sm md:text-base hover:opacity-80 transition-opacity cursor-pointer"
          >
            Admissions
          </a>
          <a
            href="#programs"
            className="text-sm md:text-base hover:opacity-80 transition-opacity"
          >
            Programs
          </a>
          <a
            href="#contacts"
            onClick={(e) => {
              e.preventDefault();
              const contactsSection = document.getElementById("contacts");
              if (contactsSection) {
                contactsSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-sm md:text-base hover:opacity-80 transition-opacity"
          >
            Contacts
          </a>
          <a
            href="#admin"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "#admin";
            }}
            className="text-sm md:text-base hover:opacity-80 transition-opacity border-l pl-4 border-white/30"
          >
            Admin Login
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 hover:opacity-80 transition-opacity"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-white transition-all ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-white transition-all ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-white transition-all ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-2 flex flex-col gap-3 border-t border-white/20 pt-4">
          <a
            href="#admissions"
            onClick={(e) => {
              e.preventDefault();
              setIsAdmissionModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="text-sm hover:opacity-80 transition-opacity py-2 cursor-pointer"
          >
            Admissions
          </a>
          <a
            href="#programs"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm hover:opacity-80 transition-opacity py-2"
          >
            Programs
          </a>
          <a
            href="#contacts"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
              const contactsSection = document.getElementById("contacts");
              if (contactsSection) {
                contactsSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-sm hover:opacity-80 transition-opacity py-2"
          >
            Contacts
          </a>
          <a
            href="#admin"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "#admin";
              setIsMobileMenuOpen(false);
            }}
            className="text-sm hover:opacity-80 transition-opacity py-2 border-t border-white/20 pt-3"
          >
            Admin Login
          </a>
        </nav>
      )}

      <AdmissionProcessModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
      />
    </header>
  );
}

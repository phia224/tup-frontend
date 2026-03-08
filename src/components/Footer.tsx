import tupLogo from "../assets/tup-logo.png";

export default function Footer() {
  return (
    <footer
      id="contacts"
      className="text-white scroll-mt-20"
      style={{ background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)" }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Left Side - Logo and Mission */}
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 md:h-16 md:w-16 flex-shrink-0">
                <img
                  src={tupLogo}
                  alt="TUP Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold leading-tight">
                Technological University of the Philippines
              </h3>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
              Empowering students to achieve their dreams through quality
              education and innovation.
            </p>
          </div>

          {/* Right Side - Contact Us */}
          <div className="mt-4 md:mt-0">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif mb-2">
              Contact Us
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 mb-4 sm:mb-6">
              Have questions? Our admissions team is here to help.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">
                  📞
                </span>
                <p className="text-xs sm:text-sm md:text-base text-gray-200 break-words">
                  Telephone no. 5801.3042/loc 603
                </p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">
                  ✉️
                </span>
                <p className="text-xs sm:text-sm md:text-base text-gray-200 break-all">
                  Email admission.tup.edu.ph
                </p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">
                  📍
                </span>
                <p className="text-xs sm:text-sm md:text-base text-gray-200 break-words">
                  Location San Marcelino St, Ayala Blvd, Ermita, Manila,
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="py-4" style={{ borderTop: "1px solid #3B0003" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
          <p className="text-xs md:text-sm text-gray-300">
            © 2025 Technological University of the Philippines. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

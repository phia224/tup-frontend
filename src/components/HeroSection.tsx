import { useState, useEffect } from "react";
import rectangleBg from "../assets/rectangle_bg.png";
import EligibilityModal from "./EligibilityModal";
import AdmissionProcessModal from "./AdmissionProcessModal";
import { getSiteSettings } from "../utils/siteSettings";

interface HeroSectionProps {
  backgroundImage?: string;
  onApplyNowClick?: () => void;
  onLearnMoreClick?: () => void;
}

export default function HeroSection({
  backgroundImage,
  onApplyNowClick,
  onLearnMoreClick,
}: HeroSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);

  const [tagline, setTagline] = useState("Shape Your\nFuture at TUP");
  const [description, setDescription] = useState(
    "Join the Technological University of the Philippines where visionaries are built, ideas thrive, and success begins."
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setTagline(settings.tagline);
        setDescription(settings.description);
      } catch (error) {
        console.error("Error loading site settings:", error);
      }
    };

    // Load settings immediately on mount
    loadSettings();

    // Listen for custom event (same-tab updates)
    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        tagline: string;
        description: string;
      }>;
      if (customEvent.detail) {
        setTagline(customEvent.detail.tagline);
        setDescription(customEvent.detail.description);
      } else {
        loadSettings();
      }
    };

    window.addEventListener("siteSettingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("siteSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  return (
    <section className="relative w-full h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : `url(${rectangleBg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-10 text-left px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-4xl w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
          {tagline.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              {index < tagline.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
          <button
            onClick={() => {
              if (onApplyNowClick) {
                onApplyNowClick();
              } else {
                setIsModalOpen(true);
              }
            }}
            className="text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base transition-opacity flex items-center justify-center gap-2 hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
            }}
          >
            Apply Now
            <span>→</span>
          </button>
          <button
            onClick={() => {
              if (onLearnMoreClick) {
                onLearnMoreClick();
              } else {
                setIsAdmissionModalOpen(true);
              }
            }}
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>

      <EligibilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <AdmissionProcessModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
      />
    </section>
  );
}

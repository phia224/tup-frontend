import { useEffect, useState } from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import OurPrograms from "../components/OurPrograms";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import FloatingChatButton from "../components/FloatingChatButton";
import EligibilityModal from "../components/EligibilityModal";
import chatLogo from "../assets/chat-log.png";
import type { AnnouncementOption } from "../services/api";
import { fetchAnnouncements } from "../services/api";

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<AnnouncementOption[]>([]);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<
    number | undefined
  >();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch {
        // silently fall back to default announcements
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />

      {/* Main Content Area */}
      <main className="relative flex-1 bg-gray-50 py-6 sm:py-8 md:py-12 lg:py-16">
        {/* Centered Chat Logo in Main Content */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-15 pointer-events-none">
          <img
            src={chatLogo}
            alt="Chat logo"
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain opacity-50"
          />
        </div>

        <div className="relative z-10 max-w-[95%] sm:max-w-[90%] lg:max-w-[98%] xl:max-w-[95%] mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <OurPrograms
              onModalStateChange={setIsProgramModalOpen}
              onApplyNow={(programId) => {
                setSelectedProgramId(programId);
                setIsProgramModalOpen(false);
                setIsEligibilityModalOpen(true);
              }}
            />
            <Announcement
              announcements={
                announcements.length
                  ? announcements.map((a) => ({
                      date: new Date(a.due_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }),
                      description: `${a.title}: ${a.content}`,
                      url: a.content.match(/https?:\/\/[^\s]+/)?.[0],
                    }))
                  : undefined
              }
            />
          </div>
        </div>
      </main>

      <Footer />
      {!isProgramModalOpen && !isEligibilityModalOpen && <FloatingChatButton />}
      <EligibilityModal
        isOpen={isEligibilityModalOpen}
        onClose={() => {
          setIsEligibilityModalOpen(false);
          setSelectedProgramId(undefined);
        }}
        initialProgramId={selectedProgramId}
      />
    </div>
  );
}

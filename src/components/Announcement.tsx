import { useState, useEffect } from "react";
import sideImage from "../assets/cards_image/side_right_image.png";
import sideImage2 from "../assets/cards_image/side_right_image2.png";
import sideImage3 from "../assets/cards_image/side_right_image3.png";
import sideImage4 from "../assets/cards_image/side_right_image4.png";

interface AnnouncementItem {
  date: string;
  description: string;
  url?: string;
}

const carouselImages = [
  { src: sideImage, alt: "TUP students and mascot at university event" },
  { src: sideImage2, alt: "TUP students and mascot at university event" },
  { src: sideImage3, alt: "TUP students and mascot at university event" },
  { src: sideImage4, alt: "TUP students and mascot at university event" },
];

interface AnnouncementProps {
  announcements?: AnnouncementItem[];
}

const defaultAnnouncements: AnnouncementItem[] = [
  {
    date: "April 27, 2024",
    description:
      "Deadline for Dropping of Subjects for 2nd Semester, 2023-2024",
  },
  {
    date: "May 23, 2023",
    description: "Schedule and requirements of application for graduation",
  },
  {
    date: "April 26, 2023",
    description:
      "Processing of Onsite admission application scheduled April 26-28, 2023",
  },
  {
    date: "November 10, 2022",
    description:
      "Office of the University Registrar and Office of the Admission Announcement (TUP-Manila)",
  },
  {
    date: "April 7, 2022",
    description: "Online Application for Admissions 2022-2023",
  },
];

export default function Announcement({
  announcements,
}: AnnouncementProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [items, setItems] = useState<AnnouncementItem[]>(
    announcements ?? defaultAnnouncements
  );

  useEffect(() => {
    if (announcements) {
      setItems(announcements);
    }
  }, [announcements]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % carouselImages.length
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full lg:w-2/5 flex flex-col px-2 sm:px-3 md:px-4 lg:px-6 mt-6 lg:mt-0">
      {/* Section Header */}
      <div
        className="text-white px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 rounded-t-lg mb-0"
        style={{
          background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">📢</span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif">Announcement</h2>
        </div>
      </div>

      {/* Announcements List */}
      <div
        className="bg-white border-t-0 rounded-b-lg p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 flex-1 min-h-[200px]"
        style={{
          borderWidth: "2px",
          borderColor: "#A10008",
          borderTopWidth: "0",
        }}
      >
        {items.map((announcement, index) => (
          <div key={index} className="flex gap-2 sm:gap-3 items-start">
            <span
              className="font-bold mt-0.5 sm:mt-1 text-base sm:text-lg flex-shrink-0"
              style={{ color: "#A10008" }}
            >
              •
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm md:text-base text-gray-800 leading-relaxed break-words">
                <span className="font-semibold">{announcement.date}</span>
                {" | "}
                {announcement.url ? (
                  <a
                    href={announcement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-700 hover:underline font-medium break-all"
                  >
                    {announcement.description}
                  </a>
                ) : (
                  <span className="break-words">{announcement.description}</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Image Carousel */}
      <div className="mt-4 sm:mt-6 md:mt-8 rounded-lg overflow-hidden shadow-md relative">
        <div className="relative w-full aspect-video">
          {carouselImages.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                index === currentImageIndex
                  ? "opacity-100"
                  : "opacity-0 absolute inset-0"
              }`}
            />
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-white w-5 sm:w-6"
                  : "bg-white/50 hover:bg-white/75 w-1.5 sm:w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

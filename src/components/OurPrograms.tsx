import { useState, useEffect, useMemo } from "react";
import ProgramCard from "./ProgramCard";
import ProgramModal from "./ProgramModal";
import { fetchPrograms, type ProgramOption } from "../services/api";
import industrialTechImg from "../assets/cards_image/industrial_technology.png";
import industrialEduImg from "../assets/cards_image/industrial_education.png";
import engineeringImg from "../assets/cards_image/engineering.png";
import liberalArtsImg from "../assets/cards_image/liberal_arts.png";
import scienceTechImg from "../assets/cards_image/science&technology.png";
import archFineArtsImg from "../assets/cards_image/architecture&fine_arts.png";

interface Program {
  image: string;
  icon: string;
  title: string;
  description: string;
  degrees: string[];
  collegeId: number;
}

interface OurProgramsProps {
  onModalStateChange?: (isOpen: boolean) => void;
  onApplyNow?: (programId: number) => void;
}

const programConfigs: Program[] = [
  {
    image: industrialTechImg,
    icon: "⚙️",
    title: "Industrial Technology",
    description:
      "Hands-on training in modern industrial technologies and manufacturing processes.",
    degrees: ["BS BETM", "BS BT"],
    collegeId: 27, // College of Industrial Technology
  },
  {
    image: industrialEduImg,
    icon: "🏠",
    title: "Industrial Education",
    description:
      "Comprehensive education programs preparing future educators and trainers.",
    degrees: ["BSIE", "BSEd"],
    collegeId: 28, // College of Technology and Livelihood Education
  },
  {
    image: engineeringImg,
    icon: "%",
    title: "Engineering",
    description:
      "Cutting-edge engineering programs designed for tomorrow's innovators.",
    degrees: ["BSCE", "BSEE", "BSME"],
    collegeId: 29, // College of Engineering
  },
  {
    image: liberalArtsImg,
    icon: "📚",
    title: "Liberal Arts",
    description:
      "Diverse programs in humanities, social sciences, and communication arts.",
    degrees: ["BA", "BS"],
    collegeId: 30, // College of Management
  },
  {
    image: scienceTechImg,
    icon: "⚙️",
    title: "Science & Technology",
    description:
      "Explore computing, science, and innovation through research and tech.",
    degrees: ["BSCS", "BSIT", "BS"],
    collegeId: 31, // College of Science & Technology
  },
  {
    image: archFineArtsImg,
    icon: "📐",
    title: "Architecture and Fine Arts",
    description: "Creative programs in architecture, design, and visual arts.",
    degrees: ["BS Arch", "BFA"],
    collegeId: 32, // College of Architecture and Fine Arts
  },
];

export default function OurPrograms({
  onModalStateChange,
  onApplyNow,
}: OurProgramsProps) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allPrograms, setAllPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch programs from API
  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      try {
        setLoading(true);
        const data = await fetchPrograms();
        if (!isMounted) return;
        setAllPrograms(data);
      } catch (error) {
        console.error("Error loading programs:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate program counts for each college based on API data
  const programsWithCounts = useMemo(() => {
    return programConfigs.map((config) => {
      const count = allPrograms.filter(
        (p) => p.college_id === config.collegeId
      ).length;
      return {
        ...config,
        programCount: count,
      };
    });
  }, [allPrograms]);

  const handleViewAllPrograms = (
    program: Program & { programCount: number }
  ) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
    onModalStateChange?.(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
    onModalStateChange?.(false);
  };

  return (
    <>
      <section className="w-full lg:w-3/5 px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Section Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-start gap-2 mb-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-gray-800">
              Our Programs
            </h2>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 ml-0 sm:ml-4 md:ml-8">
            Choose over 48 undergraduate programs designed to prepare you for
            success.
          </p>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading programs...
            </div>
          ) : (
            programsWithCounts.map((program, index) => (
              <ProgramCard
                key={index}
                image={program.image}
                icon={program.icon}
                title={program.title}
                description={program.description}
                degrees={program.degrees}
                programCount={program.programCount}
                onViewAllClick={() => handleViewAllPrograms(program)}
              />
            ))
          )}
        </div>
      </section>

      {selectedProgram && (
        <ProgramModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          collegeId={selectedProgram.collegeId}
          title={selectedProgram.title}
          description={selectedProgram.description}
          icon={selectedProgram.icon}
          onApplyNow={onApplyNow}
        />
      )}
    </>
  );
}

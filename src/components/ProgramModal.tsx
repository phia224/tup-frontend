import { useEffect, useState, useMemo } from "react";
import {
  fetchPrograms,
  fetchTracks,
  type ProgramOption,
  type Track,
} from "../services/api";

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId: number;
  title: string;
  description: string;
  icon: string;
  onApplyNow?: (programId: number) => void;
}

const COLLEGE_LABELS: Record<number, string> = {
  27: "CIT (COLLEGE OF INDUSTRIAL TECHNOLOGY)",
  28: "CTLE (COLLEGE OF TECHNOLOGY AND LIVELIHOOD EDUCATION)",
  29: "COE (COLLEGE OF ENGINEERING)",
  30: "COM (COLLEGE OF MANAGEMENT)",
  31: "COS&T (COLLEGE OF SCIENCE & TECHNOLOGY)",
  32: "CAFA (COLLEGE OF ARCHITECTURE AND FINE ARTS)",
};

const PROGRAM_STRAND_MAP: Record<string, string[]> = {
  BSA: ["ABM"],
  BSHM: ["GAS", "HE"],
  BSN: ["STEM", "HE"],
  BSCS: ["STEM", "ICT"],
  BSIT: ["STEM", "ICT"],
  BSIS: ["STEM", "ICT"],
  BSES: ["STEM"],
  BSED: ["HUMSS", "GAS"],
  BASLT: ["STEM"],
  BETET: ["STEM", "ICT"],
  BETECT: ["STEM", "ICT"],
  BETETC: ["STEM", "ICT"],
  BETICT: ["STEM", "ICT"],
  BETMT: ["STEM", "IA"],
  BETMCT: ["STEM", "ICT"],
  BETMETAT: ["STEM", "IA"],
  BETMETFT: ["STEM", "IA"],
  BETMETHVAC: ["STEM", "IA"],
  BETMETPPT: ["STEM", "IA"],
  BETMETWT: ["STEM", "IA"],
  BETMETDMT: ["STEM", "IA"],
  BETCET: ["STEM", "ICT"],
  BETCT: ["STEM", "IA"],
  BETRT: ["STEM", "IA"],
  BTAF: ["HE", "GAS"],
  BTNFT: ["STEM", "HE"],
  BTPT: ["IA", "GAS"],
  BSCE: ["STEM"],
  BSEE: ["STEM"],
  BSELE: ["STEM", "ICT"],
  BSME: ["STEM", "IA"],
  BAMIM: ["ABM", "GAS"],
  BSEM: ["ABM", "GAS"],
  BTTLEICT: ["ICT", "STEM"],
  BTTLEHE: ["HE", "GAS"],
  BTTLEIA: ["IA", "STEM"],
  BTVTEA: ["ICT", "GAS"],
  BTVTEBCW: ["HE", "GAS"],
  BTVTECP: ["ICT", "STEM"],
  BTVTEE: ["STEM", "IA"],
  BTVTEEL: ["STEM", "ICT"],
  BTVTEFSM: ["HE", "GAS"],
  BTVTEFG: ["HE", "GAS"],
  BTVTEHVAC: ["STEM", "IA"],
  BTTE: ["GAS", "HE"],
  BFA: ["GAS", "HUMSS"],
  BGTAT: ["STEM", "GAS"],
  BGTID: ["GAS", "HUMSS"],
  BGTMDT: ["STEM", "IA"],
};

// Career opportunities mapping per program (matching actual program names from API)
const CAREER_OPPORTUNITIES: Record<string, string[]> = {
  "Bachelor of Applied Science in Laboratory Technology": [
    "Medical/Clinic Laboratory Scientist/Technologist",
    "Research Scientist",
    "Biological Technician",
    "Forensic Scientist",
  ],
  "Bachelor of Science in Computer Science": [
    "Data Scientist",
    "AI Specialist",
    "Developer",
    "Software Engineer",
    "Data Architect",
    "Computer Programmer",
  ],
  "Bachelor of Science in Environmental Science": [
    "Environmental Specialist",
    "Wildlife/Conservation Officer",
    "Sustainability Consultant",
    "Pollution Control Officer",
  ],
  "Bachelor of Science in Information System": [
    "Systems Analyst",
    "IT Consultant",
    "Database Administrator",
    "Business Analyst",
  ],
  "Bachelor of Science in Information Technology": [
    "Network Administrator",
    "IT Support Specialist",
    "Cloud Engineer",
    "Cybersecurity Specialist",
  ],
  "Bachelor of Science in Civil Engineering": [
    "Civil Engineer",
    "Structural Engineer",
    "Construction Manager",
    "Project Engineer",
  ],
  "Bachelor of Science in Electrical Engineering": [
    "Electrical Engineer",
    "Power Systems Engineer",
    "Control Systems Engineer",
    "Electronics Engineer",
  ],
  "Bachelor of Science in Electronics Engineering": [
    "Electronics Engineer",
    "Telecommunications Engineer",
    "Embedded Systems Engineer",
    "RF Engineer",
  ],
  "Bachelor of Science in Mechanical Engineering": [
    "Mechanical Engineer",
    "Design Engineer",
    "Manufacturing Engineer",
    "HVAC Engineer",
  ],
  "Bachelor of Engineering Technology major in Civil Technology": [
    "Civil Engineering Technologist",
    "Construction Technologist",
    "Surveying Technician",
    "Drafting Technician",
  ],
  "Bachelor of Engineering Technology major in Electrical Technology": [
    "Electrical Technologist",
    "Power Systems Technologist",
    "Maintenance Technician",
    "Installation Technician",
  ],
  "Bachelor of Engineering Technology major in Mechanical Technology": [
    "Mechanical Technologist",
    "Manufacturing Technologist",
    "Quality Control Technician",
    "Production Supervisor",
  ],
  "Bachelor of Technology and Livelihood Education": [
    "Technical Education Teacher",
    "Vocational Instructor",
    "Training Specialist",
    "Curriculum Developer",
  ],
  "Bachelor of Technical Vocational Teachers Education": [
    "TVL Teacher",
    "Vocational Instructor",
    "Skills Trainer",
    "Educational Coordinator",
  ],
  "Bachelor of Arts in Management": [
    "Management Consultant",
    "Business Analyst",
    "Operations Manager",
    "Administrative Manager",
  ],
  "Bachelor of Science in Entrepreneurship Management": [
    "Entrepreneur",
    "Business Owner",
    "Startup Founder",
    "Business Consultant",
  ],
  "Bachelor of Science in Hospitality Management": [
    "Hotel Manager",
    "Restaurant Manager",
    "Event Coordinator",
    "Tourism Manager",
  ],
  "Bachelor of Science in Architecture": [
    "Architect",
    "Architectural Designer",
    "Urban Planner",
    "Building Designer",
  ],
  "Bachelor of Fine Arts": [
    "Fine Artist",
    "Graphic Designer",
    "Art Director",
    "Creative Director",
  ],
  "Bachelor in Graphics Technology": [
    "Graphic Designer",
    "Technical Illustrator",
    "CAD Technician",
    "Drafting Specialist",
  ],
};

const formatCurrency = () => {
  return "Free";
};

export default function ProgramModal({
  isOpen,
  onClose,
  collegeId,
  title,
  description,
  icon: _icon,
  onApplyNow,
}: ProgramModalProps) {
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [programData, trackData] = await Promise.all([
          fetchPrograms(),
          fetchTracks(),
        ]);

        if (!isMounted) return;

        // Filter programs by college_id
        const collegePrograms = programData.filter(
          (p) => p.college_id === collegeId
        );
        setPrograms(collegePrograms);
        setTracks(trackData);

        // Set first program as selected by default
        if (collegePrograms.length > 0) {
          setSelectedProgramId(collegePrograms[0].program_id);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, collegeId]);

  const selectedProgram = useMemo(() => {
    return programs.find((p) => p.program_id === selectedProgramId);
  }, [programs, selectedProgramId]);

  const selectedProgramRequirement =
    selectedProgram?.program_requirements?.[0] ?? null;

  const compatibilityCodes =
    PROGRAM_STRAND_MAP[selectedProgram?.program_code ?? ""] ?? [];

  const strandOptions = useMemo(() => {
    return tracks.flatMap((track) =>
      track.strands.map((strand) => ({ ...strand, trackName: track.track }))
    );
  }, [tracks]);

  const compatibilityLabels = compatibilityCodes.map((code) => {
    const match = strandOptions.find((strand) => strand.strand_code === code);
    return match ? match.strand : code;
  });

  const careerOpportunities = useMemo(() => {
    if (selectedProgram) {
      return (
        CAREER_OPPORTUNITIES[selectedProgram.program] ??
        CAREER_OPPORTUNITIES[title] ??
        []
      );
    }
    return CAREER_OPPORTUNITIES[title] ?? [];
  }, [selectedProgram, title]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-2 sm:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded flex-shrink-0"
              style={{ color: "#A10008" }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  fill="currentColor"
                />
                <rect x="7" y="7" width="4" height="4" fill="white" />
                <rect x="13" y="7" width="4" height="4" fill="white" />
                <rect x="7" y="13" width="4" height="4" fill="white" />
                <rect x="13" y="13" width="4" height="4" fill="white" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-serif text-gray-800 mb-1 break-words">
                {title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">
                {description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-gray-600 flex-shrink-0 ml-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Admission Requirements */}
          {selectedProgramRequirement && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 sm:p-4">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3">
                Admission Requirements
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                    Compatible Strand :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {compatibilityLabels.length > 0 ? (
                      compatibilityLabels.map((label, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-xs sm:text-sm text-gray-700 font-medium"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-xs sm:text-sm text-gray-700 font-medium">
                        All Strands
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    Minimum Subject Grades :
                  </span>
                  <ul className="mt-1 space-y-1 text-xs sm:text-sm text-gray-700">
                    <li>English : {selectedProgramRequirement.english} %</li>
                    <li>Science : {selectedProgramRequirement.science} %</li>
                    <li>Mathematics : {selectedProgramRequirement.math} %</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Available Programs */}
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3">
              Available Programs ({programs.length})
            </h3>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="bg-gray-100 rounded-lg border border-gray-300 flex gap-0 relative min-w-max sm:min-w-0 sm:flex-wrap">
                {loading ? (
                  <div className="text-gray-500 py-2 px-3 sm:px-4">
                    Loading programs...
                  </div>
                ) : (
                  programs.map((program) => {
                    // Extract shorter name for display
                    const getShortName = (fullName: string) => {
                      // Remove "Bachelor of" prefix if present
                      let short = fullName.replace(
                        /^Bachelor of (Science|Arts|Technology|Engineering Technology|Applied Science|Fine Arts|Technical Vocational Teachers Education|Technology and Livelihood Education|Technical Teacher Education|Graphics Technology) in /i,
                        ""
                      );
                      short = short.replace(/^Bachelor in /i, "");
                      // If still too long, try to get the major/specialization
                      if (short.length > 40) {
                        const match = fullName.match(
                          /major in (.+?)(?: option|$)/i
                        );
                        if (match) {
                          return match[1];
                        }
                        // Get last part after "in"
                        const parts = short.split(" in ");
                        if (parts.length > 1) {
                          return parts[parts.length - 1];
                        }
                      }
                      return short;
                    };

                    const displayName = getShortName(program.program);
                    const isSelected = selectedProgramId === program.program_id;

                    return (
                      <button
                        key={program.program_id}
                        onClick={() => setSelectedProgramId(program.program_id)}
                        className={`px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                          isSelected
                            ? "bg-white text-gray-900 font-bold border-t-2 border-l-2 border-r-2 border-gray-500 rounded-t-lg -mb-px relative z-10 shadow-sm"
                            : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        title={program.program}
                      >
                        <span className="block truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                          {displayName}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Selected Program Details */}
          {selectedProgram && (
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex-1 break-words">
                  {selectedProgram.program}
                </h4>
                <span className="px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded flex-shrink-0">
                  {selectedProgram.program_code.startsWith("BAS")
                    ? "BAS"
                    : selectedProgram.program_code.startsWith("BS") &&
                      !selectedProgram.program_code.startsWith("BSC")
                    ? "BS"
                    : selectedProgram.program_code.startsWith("BT") &&
                      !selectedProgram.program_code.startsWith("BTTLE") &&
                      !selectedProgram.program_code.startsWith("BTVTE") &&
                      !selectedProgram.program_code.startsWith("BTTE")
                    ? "BT"
                    : selectedProgram.program_code.startsWith("BET")
                    ? "BET"
                    : selectedProgram.program_code.startsWith("BAM")
                    ? "BAM"
                    : selectedProgram.program_code.startsWith("BGT")
                    ? "BGT"
                    : selectedProgram.program_code.startsWith("BTTLE")
                    ? "BTTLE"
                    : selectedProgram.program_code.startsWith("BTVTE")
                    ? "BTVTE"
                    : selectedProgram.program_code.startsWith("BTTE")
                    ? "BTTE"
                    : selectedProgram.program_code.startsWith("BFA")
                    ? "BFA"
                    : selectedProgram.program_code}
                </span>
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm break-words">
                {selectedProgram.program.includes("Laboratory Technology")
                  ? "Practical field of science focused on conducting tests and procedures within a laboratory."
                  : selectedProgram.program.includes("Computer Science")
                  ? "Learn programming, algorithms, AI, and software development."
                  : selectedProgram.program.includes("Information System")
                  ? "Focus on information systems, database management, and business technology solutions."
                  : selectedProgram.program.includes("Information Technology")
                  ? "Comprehensive IT program covering networking, systems administration, and technology infrastructure."
                  : selectedProgram.program.includes("Environmental Science")
                  ? "Studies the environment, natural resources, and solutions to environmental problems."
                  : selectedProgram.program.includes("Engineering Technology")
                  ? "Hands-on engineering technology program focusing on practical applications and technical skills."
                  : selectedProgram.program.includes("Civil Engineering")
                  ? "Design and construction of infrastructure projects including buildings, bridges, and roads."
                  : selectedProgram.program.includes("Electrical Engineering")
                  ? "Design and development of electrical systems, power generation, and electronics."
                  : selectedProgram.program.includes("Mechanical Engineering")
                  ? "Design and development of mechanical systems, machinery, and manufacturing processes."
                  : selectedProgram.program.includes("Architecture")
                  ? "Design and planning of buildings and structures with focus on aesthetics and functionality."
                  : selectedProgram.program.includes("Fine Arts")
                  ? "Creative expression through various art forms including visual arts and design."
                  : selectedProgram.program.includes("Graphics Technology")
                  ? "Technical graphics, drafting, and design using modern CAD and visualization tools."
                  : selectedProgram.program.includes(
                      "Technology and Livelihood Education"
                    ) ||
                    selectedProgram.program.includes("Technical Vocational")
                  ? "Comprehensive education program preparing future technical and vocational educators."
                  : selectedProgram.program.includes("Management")
                  ? "Business management, entrepreneurship, and organizational leadership skills."
                  : selectedProgram.program.includes("Hospitality")
                  ? "Hotel, restaurant, and tourism management with focus on service excellence."
                  : `Program at ${
                      COLLEGE_LABELS[collegeId] ?? `COL${collegeId}`
                    } focusing on ${selectedProgram.program.toLowerCase()}.`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    className="sm:w-5 sm:h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "#A10008" }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 6V12L16 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-bold text-sm sm:text-base text-gray-800 break-words">
                      {Math.round(parseFloat(selectedProgram.duration))} years (
                      {selectedProgram.program_code.startsWith("BAS")
                        ? "BAS"
                        : selectedProgram.program_code.startsWith("BS") &&
                          !selectedProgram.program_code.startsWith("BSC")
                        ? "BS"
                        : selectedProgram.program_code.startsWith("BT") &&
                          !selectedProgram.program_code.startsWith("BTTLE") &&
                          !selectedProgram.program_code.startsWith("BTVTE") &&
                          !selectedProgram.program_code.startsWith("BTTE")
                        ? "BT"
                        : selectedProgram.program_code.startsWith("BET")
                        ? "BET"
                        : selectedProgram.program_code.startsWith("BAM")
                        ? "BAM"
                        : selectedProgram.program_code.startsWith("BGT")
                        ? "BGT"
                        : selectedProgram.program_code.startsWith("BTTLE")
                        ? "BTTLE"
                        : selectedProgram.program_code.startsWith("BTVTE")
                        ? "BTVTE"
                        : selectedProgram.program_code.startsWith("BTTE")
                        ? "BTTE"
                        : selectedProgram.program_code.startsWith("BFA")
                        ? "BFA"
                        : selectedProgram.program_code}
                      )
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    className="sm:w-5 sm:h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "#A10008" }}
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Credits</p>
                    <p className="font-bold text-sm sm:text-base text-gray-800">
                      {selectedProgram.credits}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg sm:text-xl font-bold flex-shrink-0"
                    style={{ color: "#A10008" }}
                  >
                    ₱
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Tuition</p>
                    <p className="font-bold text-sm sm:text-base text-gray-800">
                      {formatCurrency()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Career Opportunities */}
          {careerOpportunities.length > 0 && (
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3">
                Career Opportunities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {careerOpportunities.map((career, idx) => (
                  <button
                    key={idx}
                    className="px-3 sm:px-4 py-2 bg-gray-800 text-white rounded text-xs sm:text-sm font-medium hover:bg-gray-700 transition-colors text-left break-words"
                  >
                    {career}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Apply Now Button */}
          <button
            onClick={() => {
              if (selectedProgram && onApplyNow) {
                onApplyNow(selectedProgram.program_id);
              } else {
                onClose();
              }
            }}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-white text-sm sm:text-base font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
            }}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

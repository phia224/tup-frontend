import { useEffect, useMemo, useState } from "react";
import {
  fetchPrograms,
  fetchSchools,
  fetchTracks,
  fetchApplications,
  submitApplication,
  type ProgramOption,
  type SchoolOption,
  type Strand,
  type Track,
  type ApplicationRecord,
} from "../services/api";

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgramId?: number;
}

interface EligibilityResult {
  eligible: boolean;
  strandMatch: boolean;
  gradeMatch: boolean;
  missingRequirements?: {
    subject: string;
    required: number;
    current: number;
  }[];
  strandMismatch?: boolean;
}

const DEFAULT_MIN_GPA = 85;
const STEM_HEAVY_MIN_GPA = 90;

const STEM_HEAVY_PROGRAM_CODES = new Set([
  "BSA",
  "BASLT",
  "BSFT",
  "BSCS",
  "BSIT",
  "BSIS",
  "BSES",
  "BSCE",
  "BSEE",
  "BSELE",
  "BSME",
]);

type SubmissionStatus = {
  type: "success" | "error";
  message: string;
};

type EnrichedStrand = Strand & { trackName: string };

const PROGRAM_STRAND_MAP: Record<string, string[]> = {
  BSA: ["ABM"],
  BSHM: ["GAS", "HE"],
  BSN: ["STEM", "HE"],
  BSCS: ["STEM", "ICT"],
  BSIT: ["STEM", "ICT"],
  BSED: ["HUMSS", "GAS"],
};

export default function EligibilityModal({
  isOpen,
  onClose,
  initialProgramId,
}: EligibilityModalProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [allSchools, setAllSchools] = useState<SchoolOption[]>([]);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [strandId, setStrandId] = useState("");
  const [programId, setProgramId] = useState(
    initialProgramId ? String(initialProgramId) : ""
  );
  const [gpa, setGpa] = useState("");
  const [englishGrade, setEnglishGrade] = useState("85");
  const [scienceGrade, setScienceGrade] = useState("85");
  const [mathGrade, setMathGrade] = useState("85");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Application form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [customSchoolMode, setCustomSchoolMode] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState("");
  const [programOfInterest, setProgramOfInterest] = useState("");
  const [otherProgram, setOtherProgram] = useState("");
  const [personalStatement, setPersonalStatement] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<SubmissionStatus | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    applicantNumber: string;
  } | null>(null);
  const [programEnrollment, setProgramEnrollment] = useState<
    Record<number, number>
  >({});



  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        setOptionsError(null);
        const [trackData, programData, schoolData, applications] =
          await Promise.all([
            fetchTracks(),
            fetchPrograms(),
            fetchSchools(),
            fetchApplications(),
          ]);

        if (!isMounted) return;
        setTracks(trackData);
        setProgramOptions(programData);

        // Store all schools for the modal
        setAllSchools(schoolData);


        const enrollmentMap = (applications as ApplicationRecord[]).reduce<
          Record<number, number>
        >((acc, app) => {
          if (app.statuses?.status_name === "Approved") {
            acc[app.program_id] = (acc[app.program_id] ?? 0) + 1;
          }
          return acc;
        }, {});
        setProgramEnrollment(enrollmentMap);

        // Set initial program ID if provided
        if (initialProgramId) {
          setProgramId(String(initialProgramId));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
        setOptionsError(
          error instanceof Error
            ? error.message
            : "Failed to load options from the server."
        );
      } finally {
        if (isMounted) {
          setOptionsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialProgramId]);

  const strandOptions: EnrichedStrand[] = useMemo(() => {
    return tracks.flatMap((track) =>
      track.strands.map((strand) => ({ ...strand, trackName: track.track }))
    );
  }, [tracks]);

  const selectedStrand = strandOptions.find(
    (strand) => String(strand.strand_id) === strandId
  );

  const selectedProgram = programOptions.find(
    (program) => String(program.program_id) === programId
  );

  const selectedProgramRequirement =
    selectedProgram?.program_requirements?.[0] ?? null;

  const requiredGpa = STEM_HEAVY_PROGRAM_CODES.has(
    selectedProgram?.program_code ?? ""
  )
    ? STEM_HEAVY_MIN_GPA
    : DEFAULT_MIN_GPA;

  const compatibilityCodes =
    PROGRAM_STRAND_MAP[selectedProgram?.program_code ?? ""] ?? [];

  const compatibilityLabels = compatibilityCodes.map((code) => {
    const match = strandOptions.find((strand) => strand.strand_code === code);
    return match ? match.strand : code;
  });

  const filteredSchoolsForModal = useMemo(() => {
    if (!schoolSearch.trim()) return allSchools;
    return allSchools.filter((school) =>
      school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      school.name_code.toLowerCase().includes(schoolSearch.toLowerCase())
    );
  }, [allSchools, schoolSearch]);

  const isProgramFull = (program: ProgramOption) => {
    const limit = program.enrollment_limit;
    if (limit == null) return false;
    const current = programEnrollment[program.program_id] ?? 0;
    return current >= limit;
  };

  const handleOpenSchoolModal = () => {
    setSchoolModalOpen(true);
    setSchoolSearch("");
  };

  const handleCloseSchoolModal = () => {
    setSchoolModalOpen(false);
    setSchoolSearch("");
  };

  const handleSelectSchool = (school: SchoolOption) => {
    setPreviousSchool(String(school.school_id));
    setCustomSchoolMode(false);
    setCustomSchoolName("");
    setSchoolModalOpen(false);
    setSchoolSearch("");
  };

  const handleToggleCustomSchool = () => {
    setCustomSchoolMode(!customSchoolMode);
    if (!customSchoolMode) {
      // Switching to custom mode
      setPreviousSchool("");
      setSchoolModalOpen(false);
    } else {
      // Switching back to selection mode
      setCustomSchoolName("");
    }
  };

  const selectedSchoolName = useMemo(() => {
    if (customSchoolMode) {
      return customSchoolName || "";
    }
    const school = allSchools.find(s => String(s.school_id) === previousSchool);
    return school ? `${school.name} (${school.name_code})` : "";
  }, [allSchools, previousSchool, customSchoolMode, customSchoolName]);

  if (!isOpen) return null;

  const checkEligibility = () => {
    if (!strandId || !programId || !gpa) {
      alert("Please fill in all required fields");
      return;
    }

    if (!selectedProgram || !selectedProgramRequirement) {
      alert("Please select a valid program");
      return;
    }

    const eng = parseFloat(englishGrade);
    const sci = parseFloat(scienceGrade);
    const math = parseFloat(mathGrade);
    const gpaNum = parseFloat(gpa);

    if (Number.isNaN(gpaNum)) {
      alert("Please provide a valid GPA value.");
      return;
    }

    const englishRequirement = parseFloat(selectedProgramRequirement.english);
    const scienceRequirement = parseFloat(selectedProgramRequirement.science);
    const mathRequirement = parseFloat(selectedProgramRequirement.math);

    const gradeMatch =
      eng >= englishRequirement &&
      sci >= scienceRequirement &&
      math >= mathRequirement;

    const strandMatch = (() => {
      if (!selectedStrand) return true;
      if (!compatibilityCodes.length) return true;
      return compatibilityCodes.includes(selectedStrand.strand_code);
    })();

    const gpaMatch = gpaNum >= requiredGpa;

    const missingRequirements: {
      subject: string;
      required: number;
      current: number;
    }[] = [];

    if (eng < englishRequirement) {
      missingRequirements.push({
        subject: "English",
        required: englishRequirement,
        current: eng,
      });
    }
    if (sci < scienceRequirement) {
      missingRequirements.push({
        subject: "Science",
        required: scienceRequirement,
        current: sci,
      });
    }
    if (math < mathRequirement) {
      missingRequirements.push({
        subject: "Mathematics",
        required: mathRequirement,
        current: math,
      });
    }

    const eligible = strandMatch && gradeMatch && gpaMatch;

    setResult({
      eligible,
      strandMatch,
      gradeMatch,
      missingRequirements:
        missingRequirements.length > 0 ? missingRequirements : undefined,
      strandMismatch: !strandMatch,
    });

    setShowResults(true);
  };

  const resetForm = () => {
    setStrandId("");
    setProgramId("");
    setGpa("");
    setEnglishGrade("85");
    setScienceGrade("85");
    setMathGrade("85");
    setShowResults(false);
    setResult(null);
    setApplicationStatus(null);
    setSuccessModalData(null);
  };

  const handleGoToApplication = () => {
    setProgramOfInterest(programId);
    setShowApplicationForm(true);
    setApplicationStatus(null);
  };

  const handleBackToEligibility = () => {
    setShowApplicationForm(false);
    setApplicationStatus(null);
    setSuccessModalData(null);
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalData(null);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programOfInterest || (!previousSchool && !customSchoolName.trim())) {
      setApplicationStatus({
        type: "error",
        message: "Please select both your program of interest and school.",
      });
      return;
    }

    if (!birthdate) {
      setApplicationStatus({
        type: "error",
        message: "Birthdate is required.",
      });
      return;
    }

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birthdate,
      email: email.trim(),
      phone_number: phoneNumber.trim(),
      school_id: customSchoolMode ? undefined : Number(previousSchool),
      program_id: Number(programOfInterest),
      other_program: otherProgram.trim() || undefined,
      other_school: customSchoolMode ? customSchoolName.trim() : undefined,
      gwa: Number(gpa),
      english: Number(englishGrade),
      science: Number(scienceGrade),
      math: Number(mathGrade),
      personal_statement: personalStatement.trim(),
    };

    try {
      setSubmittingApplication(true);
      setApplicationStatus(null);
      const response = await submitApplication(payload);
      setApplicationStatus({
        type: "success",
        message: `Application submitted successfully! Applicant #: ${response.data.applicant_number}`,
      });
      setSuccessModalData({
        applicantNumber: String(response.data.applicant_number),
      });
      setFirstName("");
      setLastName("");
      setBirthdate("");
      setEmail("");
      setPhoneNumber("");
      setPreviousSchool("");
      setCustomSchoolMode(false);
      setCustomSchoolName("");
      setProgramOfInterest("");
      setOtherProgram("");
      setPersonalStatement("");
    } catch (error) {
      setApplicationStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your application. Please try again.",
      });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const requirements = selectedProgramRequirement;
  const showStrandMismatch = result && !result.strandMatch && !result.eligible;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className={`bg-white rounded-lg ${
            showApplicationForm ? "max-w-3xl" : "max-w-2xl"
          } w-full max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h2 className="text-2xl font-bold text-gray-800">
                {showApplicationForm
                  ? "Application Form"
                  : "Check Your Eligibility"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-600">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {showApplicationForm ? (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBackToEligibility}
                  className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="text-xl">←</span>
                  <span className="font-medium">
                    Back to Check Your Eligibility
                  </span>
                </button>

                <p className="text-gray-600 mb-6">
                  Please fill out all required fields. Our admissions team will
                  review your application and contact you within 5-7 business
                  days.
                </p>

                {applicationStatus && (
                  <div
                    className={`mb-6 rounded-lg border p-4 text-sm ${
                      applicationStatus.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    {applicationStatus.message}
                  </div>
                )}

                {result?.eligible && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Eligibility Confirmed! You've been pre-qualified with
                        GPA of {gpa}
                      </p>
                    </div>
                  </div>
                )}

                {/* Strand Mismatch Warnings */}
                {showStrandMismatch && (
                  <div className="space-y-3 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800 mb-1">
                          Strand Mismatch
                        </p>
                        <p className="text-sm text-yellow-700">
                          Your {selectedStrand?.strand ?? "selected"} strand is
                          not typically aligned with the program you chose.
                        </p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800 mb-1">
                          Notice
                        </p>
                        <p className="text-sm text-yellow-700">
                          Your chosen program is not typically aligned with your
                          current academic strand. You may still proceed with
                          your application, but please be informed that you will
                          be placed on the waiting list for further evaluation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Form */}
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    {/* Birthdate */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Birthdate
                      </label>
                      <input
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    {/* Previous School */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Previous School
                      </label>

                      {/* Mode Toggle */}
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="schoolMode"
                            checked={!customSchoolMode}
                            onChange={() => handleToggleCustomSchool()}
                            className="text-red-600 focus:ring-red-600"
                          />
                          <span className="text-sm text-gray-700">Select from list</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="schoolMode"
                            checked={customSchoolMode}
                            onChange={() => handleToggleCustomSchool()}
                            className="text-red-600 focus:ring-red-600"
                          />
                          <span className="text-sm text-gray-700">Enter manually</span>
                        </label>
                      </div>

                      {/* School Selection/Input */}
                      {customSchoolMode ? (
                        <input
                          type="text"
                          value={customSchoolName}
                          onChange={(e) => setCustomSchoolName(e.target.value)}
                          placeholder="Enter your school name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          disabled={optionsLoading}
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedSchoolName}
                            onClick={handleOpenSchoolModal}
                            readOnly
                            placeholder="Click to select your school"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                            disabled={optionsLoading}
                          />
                          <button
                            type="button"
                            onClick={handleOpenSchoolModal}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={optionsLoading}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Program of Interest */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Program of Interest
                      </label>
                      <select
                        value={programOfInterest}
                        onChange={(e) => setProgramOfInterest(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        disabled={optionsLoading}
                      >
                        <option value="">Select a program</option>
                        {programOptions.map((program) => {
                          const full = isProgramFull(program);
                          return (
                            <option
                              key={program.program_id}
                              value={program.program_id}
                              disabled={full}
                            >
                              {program.program} ({program.program_code}
                              {full ? " - FULL" : ""})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Other Program of Interest */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Other program of interest
                      <span className="text-xs font-normal text-gray-500 italic ml-1">
                        (if the program of first choice is not available
                        anymore)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={otherProgram}
                      onChange={(e) => setOtherProgram(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Optional alternate program"
                    />
                  </div>

                  {/* Personal Statement */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Personal Statement <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={personalStatement}
                      onChange={(e) => setPersonalStatement(e.target.value)}
                      required
                      rows={5}
                      placeholder="Tell us about yourself, your goals, and why you want to join Technological University of the Philippines"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-6 py-3 px-6 rounded-lg text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                    }}
                    disabled={submittingApplication}
                  >
                    {submittingApplication
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>
                </form>
              </>
            ) : (
              <>
                {optionsError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {optionsError}
                  </div>
                )}
                <p className="text-gray-600 mb-6">
                  Let's verify if you meet the requirements for your program of
                  interests.
                </p>

                {!showResults ? (
                  <>
                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Academic Strand */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Academic Strand{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={strandId}
                          onChange={(e) => setStrandId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          disabled={optionsLoading}
                        >
                          <option value="">Select your strand</option>
                          {strandOptions.map((strand) => (
                            <option
                              key={strand.strand_id}
                              value={strand.strand_id}
                            >
                              {strand.strand} ({strand.trackName})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Program of Interest */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Program of Interest{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={programId}
                          onChange={(e) => setProgramId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          disabled={optionsLoading}
                        >
                          <option value="">Select a program</option>
                          {programOptions.map((program) => {
                            const full = isProgramFull(program);
                            return (
                              <option
                                key={program.program_id}
                                value={program.program_id}
                                disabled={full}
                              >
                                {program.program} ({program.program_code}
                                {full ? " - FULL" : ""})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* GPA */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your General Average (GPA)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="e.g., 90.4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your General Average (GWA) in percentage
                        </p>
                      </div>

                      {/* Major Subject Grades */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Major Subject Grades in (%)
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Engl
                            </label>
                            <input
                              type="number"
                              value={englishGrade}
                              onChange={(e) => setEnglishGrade(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Scie
                            </label>
                            <input
                              type="number"
                              value={scienceGrade}
                              onChange={(e) => setScienceGrade(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Mathemat
                            </label>
                            <input
                              type="number"
                              value={mathGrade}
                              onChange={(e) => setMathGrade(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Requirements Info Boxes */}
                      {requirements && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Minimum Requirements */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <span className="text-xl">📖</span>
                              <div>
                                <h4 className="font-semibold text-red-800 mb-2">
                                  Minimum Grade Requirements
                                </h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                  <li>General Average: {requiredGpa}%</li>
                                  <li>English: {requirements.english}</li>
                                  <li>Science: {requirements.science}</li>
                                  <li>Math: {requirements.math}</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Compatible Strands */}
                          <div
                            className={`border rounded-lg p-4 ${
                              compatibilityCodes.length === 0 ||
                              compatibilityCodes.includes(
                                selectedStrand?.strand_code ?? ""
                              )
                                ? "bg-green-50 border-green-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xl">📖</span>
                              <div>
                                <h4
                                  className="font-semibold mb-2"
                                  style={{
                                    color:
                                      compatibilityCodes.length === 0 ||
                                      compatibilityCodes.includes(
                                        selectedStrand?.strand_code ?? ""
                                      )
                                        ? "#166534"
                                        : "#92400e",
                                  }}
                                >
                                  Compatible Strands
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {compatibilityLabels.length === 0
                                    ? "Open to all strands"
                                    : compatibilityLabels.map((label) => (
                                        <span
                                          key={label}
                                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            label === selectedStrand?.strand
                                              ? "bg-green-600 text-white"
                                              : "bg-green-200 text-green-800"
                                          }`}
                                        >
                                          {label}
                                        </span>
                                      ))}
                                </div>
                                <p
                                  className="text-xs mt-2"
                                  style={{
                                    color:
                                      compatibilityCodes.length === 0 ||
                                      compatibilityCodes.includes(
                                        selectedStrand?.strand_code ?? ""
                                      )
                                        ? "#166534"
                                        : "#92400e",
                                  }}
                                >
                                  Strong foundation in Math and Science is
                                  essential
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={checkEligibility}
                      className="w-full mt-6 py-3 px-6 rounded-lg text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                      }}
                      disabled={optionsLoading}
                    >
                      {optionsLoading
                        ? "Loading options..."
                        : "Check your eligibility"}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Results */}
                    <div className="text-center mb-6">
                      {result?.eligible ? (
                        <>
                          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl text-white">✓</span>
                          </div>
                          <h3 className="text-2xl font-bold text-green-600 mb-2">
                            Perfect Match!
                          </h3>
                          <p className="text-gray-700">
                            You meet all the subject requirements for this
                            course.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl text-white">!</span>
                          </div>
                          <h3 className="text-2xl font-bold text-red-600 mb-2">
                            {result?.strandMismatch && !result?.gradeMatch
                              ? "Grade and STRAND Requirements Not Met"
                              : result?.strandMismatch
                              ? "STRAND Requirements Not Met"
                              : "Grade Requirements Not Met"}
                          </h3>
                          <p className="text-gray-700">
                            You don't meet all the subject requirements for this
                            course.
                          </p>
                          {!result?.eligible && parseFloat(gpa) < requiredGpa && (
                            <p className="text-sm text-red-700 mt-2">
                              Your general average must be at least {requiredGpa}% for this program.
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Details */}
                    <div
                      className={`rounded-lg p-4 mb-4 ${
                        result?.eligible
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Your Strand:</strong>{" "}
                          {selectedStrand?.strand ?? "—"}
                        </p>
                        <p>
                          <strong>Your GPA:</strong> {gpa}
                        </p>
                        <p>
                          <strong>Required GPA:</strong> {requiredGpa}
                        </p>
                        <p>
                          <strong>Program:</strong>{" "}
                          {selectedProgram?.program ?? "—"}
                        </p>
                        <p>
                          <strong>Your Subject Grades:</strong>
                        </p>
                        <ul className="ml-4 space-y-1">
                          <li className="flex items-center gap-2">
                            <span
                              className={
                                parseFloat(englishGrade) >=
                                parseFloat(requirements?.english ?? "0")
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {parseFloat(englishGrade) >=
                              parseFloat(requirements?.english ?? "0")
                                ? "✓"
                                : "✗"}
                            </span>
                            English: {englishGrade}
                          </li>
                          <li className="flex items-center gap-2">
                            <span
                              className={
                                parseFloat(scienceGrade) >=
                                parseFloat(requirements?.science ?? "0")
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {parseFloat(scienceGrade) >=
                              parseFloat(requirements?.science ?? "0")
                                ? "✓"
                                : "✗"}
                            </span>
                            Science: {scienceGrade}
                          </li>
                          <li className="flex items-center gap-2">
                            <span
                              className={
                                parseFloat(mathGrade) >=
                                parseFloat(requirements?.math ?? "0")
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {parseFloat(mathGrade) >=
                              parseFloat(requirements?.math ?? "0")
                                ? "✓"
                                : "✗"}
                            </span>
                            Math: {mathGrade}
                          </li>
                        </ul>
                        {result?.missingRequirements &&
                          result.missingRequirements.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-300">
                              <p className="font-semibold text-red-800 mb-2">
                                Subject Requirements Not Met:
                              </p>
                              <ul className="space-y-1">
                                {result.missingRequirements.map((req, idx) => (
                                  <li
                                    key={idx}
                                    className="text-red-700 flex items-center gap-2"
                                  >
                                    <span>✗</span>
                                    {req.subject}: (need {req.required}, have{" "}
                                    {req.current})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Next Steps or Actions */}
                    {result?.eligible ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Next Steps
                        </h4>
                        <p className="text-sm text-blue-700">
                          Proceed to complete the full application form. Our
                          admissions team will review your complete profile,
                          including transcripts, recommendations, and personal
                          statement.
                        </p>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={resetForm}
                        className="flex-1 py-3 px-6 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
                        style={{
                          background:
                            "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                        }}
                      >
                        {result?.eligible
                          ? "Check Again"
                          : "Try Different Program"}
                      </button>
                      {result?.eligible ? (
                        <button
                          onClick={handleGoToApplication}
                          className="flex-1 py-3 px-6 rounded-lg text-white font-semibold transition-opacity hover:opacity-90 bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={!programId}
                        >
                          Proceed to Application
                        </button>
                      ) : (
                        <button
                          onClick={handleGoToApplication}
                          className="flex-1 py-3 px-6 rounded-lg text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            background:
                              "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                          }}
                          disabled={!programId}
                        >
                          Apply Anyway
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {successModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for completing your application. Keep your applicant
              number for reference:
            </p>
            <p className="text-3xl font-semibold text-green-700 tracking-wide mb-8">
              #{successModalData.applicantNumber}
            </p>
            <button
              onClick={handleCloseSuccessModal}
              className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* School Selection Modal */}
      {schoolModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Select Your School</h3>
              <button
                onClick={handleCloseSchoolModal}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <span className="text-gray-600">×</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b">
              <div className="relative">
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Search schools..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {filteredSchoolsForModal.length} school{filteredSchoolsForModal.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Schools List */}
            <div className="overflow-y-auto max-h-96">
              {filteredSchoolsForModal.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No schools found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredSchoolsForModal.map((school) => (
                    <button
                      key={school.school_id}
                      onClick={() => handleSelectSchool(school)}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                    >
                      <div className="font-medium text-gray-900">
                        {school.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {school.name_code}
                      </div>
                      {school.address && (
                        <div className="text-xs text-gray-400 mt-1">
                          {school.address}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

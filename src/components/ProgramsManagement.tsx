import { useMemo, useState, useEffect } from "react";
import type { ProgramOption } from "../services/api";
import { fetchPrograms, modifyProgramEnrollmentLimit } from "../services/api";

const COLLEGE_LABELS: Record<number, string> = {
  27: "CIT (COLLEGE OF INDUSTRIAL TECHNOLOGY)",
  28: "CIE (COLLEGE OF INDUSTRIAL EDUCATION)",
  29: "COE (COLLEGE OF ENGINEERING)",
  30: "CLA (COLLEGE OF LIBERAL ARTS)",
  31: "COS (COLLEGE OF SCIENCE)",
  32: "CAFA (COLLEGE OF ARCHITECTURE AND FINE ARTS)",
};

const formatCurrency = () => {
  // Display all tuitions as free/0 in the UI
  return "Free";
};

const getCollegeName = (collegeId: number) =>
  COLLEGE_LABELS[collegeId] ?? `COL${collegeId}`;

export default function ProgramsManagement() {
  const [activeTab, setActiveTab] = useState<"overview" | "enrollment">(
    "overview"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<number | null>(null);
  const [limitDraft, setLimitDraft] = useState<string>("");
  const [creditsDraft, setCreditsDraft] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPrograms();
        if (!isMounted) return;
        setPrograms(data);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load programs right now."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPrograms();
    return () => {
      isMounted = false;
    };
  }, []);

  const collegeOptions = useMemo(() => {
    const uniqueColleges = Array.from(
      new Set(programs.map((program) => getCollegeName(program.college_id)))
    ).sort();
    return ["All Colleges", ...uniqueColleges];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const collegeName = getCollegeName(program.college_id);
      const matchesSearch =
        program.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.program_code
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        collegeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollege =
        selectedCollege === "All Colleges" || collegeName === selectedCollege;

      return matchesSearch && matchesCollege;
    });
  }, [programs, searchQuery, selectedCollege]);

  const configuredCapacity = programs
    .filter((p) => p.enrollment_limit !== null)
    .reduce((sum, program) => sum + (program.enrollment_limit ?? 0), 0);

  const programsWithLimits = programs.filter(
    (program) => program.enrollment_limit !== null
  ).length;

  const startEditing = (program: ProgramOption) => {
    setEditingProgram(program.program_id);
    setLimitDraft(
      program.enrollment_limit !== null ? String(program.enrollment_limit) : ""
    );
    setCreditsDraft(program.credits || "");
  };

  const cancelEditing = () => {
    setEditingProgram(null);
    setLimitDraft("");
    setCreditsDraft("");
  };

  const saveLimit = async (program: ProgramOption) => {
    const parsedLimit =
      limitDraft.trim() === "" ? null : Number.parseInt(limitDraft, 10);

    if (limitDraft.trim() !== "" && (parsedLimit === null || parsedLimit < 0)) {
      setError("Please enter a valid enrollment limit or leave it blank.");
      return;
    }

    const parsedCredits =
      creditsDraft.trim() === "" ? null : creditsDraft.trim();

    if (creditsDraft.trim() !== "" && parsedCredits === null) {
      setError("Please enter a valid credits value or leave it blank.");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      const updated = await modifyProgramEnrollmentLimit(
        program.program_id,
        parsedLimit === null ? null : String(parsedLimit),
        parsedCredits
      );

      setPrograms((prev) =>
        prev.map((item) =>
          item.program_id === updated.program_id
            ? {
                ...item,
                enrollment_limit: updated.enrollment_limit,
                credits: updated.credits,
                updated_at: updated.updated_at,
              }
            : item
        )
      );
      cancelEditing();
    } catch (err) {
      let errorMessage =
        "Unable to update enrollment limit and credits right now.";

      if (err instanceof Error) {
        // Check if the error message contains "Invalid or missing enrollment_limit"
        if (
          err.message.includes("Invalid or missing enrollment_limit") ||
          err.message.includes("enrollment_limit")
        ) {
          errorMessage = "Please input enrollment limit first.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Programs Management
        </h2>
        <p className="text-gray-600">
          View active programs and configure enrollment limits.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === "overview"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Programs Overview
          </button>
          <button
            onClick={() => setActiveTab("enrollment")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === "enrollment"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Enrollment Configuration
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Loading programs...
        </div>
      ) : activeTab === "overview" ? (
        <>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="8" stroke="#666" strokeWidth="2" />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs or colleges..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {collegeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Program
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    College
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Tuition
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Enrollment Limit
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr key={program.program_id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      <div className="font-semibold">{program.program}</div>
                      <p className="text-xs text-gray-500">
                        Code: {program.program_code}
                      </p>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {getCollegeName(program.college_id)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {program.duration} years
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {formatCurrency()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {program.enrollment_limit ?? "Not set"}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {program.updated_at
                        ? new Date(program.updated_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
                {filteredPrograms.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No programs match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">
                Configured capacity (sum of enrollment limits)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {configuredCapacity.toLocaleString()} seats
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">
                Programs with limits set
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {programsWithLimits} / {programs.length}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="8" stroke="#666" strokeWidth="2" />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs or colleges..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {collegeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Program
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    College
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Enrollment Limit
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Credits
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr key={program.program_id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      <div className="font-semibold">{program.program}</div>
                      <p className="text-xs text-gray-500">
                        Code: {program.program_code}
                      </p>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {getCollegeName(program.college_id)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {editingProgram === program.program_id ? (
                        <input
                          type="number"
                          min={0}
                          value={limitDraft}
                          onChange={(e) => setLimitDraft(e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="No limit"
                        />
                      ) : (
                        program.enrollment_limit ?? "Not set"
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {editingProgram === program.program_id ? (
                        <input
                          type="text"
                          value={creditsDraft}
                          onChange={(e) => setCreditsDraft(e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Credits"
                        />
                      ) : (
                        program.credits || "Not set"
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {editingProgram === program.program_id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveLimit(program)}
                            disabled={updating}
                            className="px-3 py-1 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                            }}
                          >
                            {updating ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(program)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPrograms.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No programs match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

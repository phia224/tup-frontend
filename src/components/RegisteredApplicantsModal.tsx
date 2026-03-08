import { useEffect, useState } from "react";
import { fetchApplications, type ApplicationRecord } from "../services/api";
import { saveDownloadHistory } from "../utils/downloadHistory";

interface RegisteredApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatSchoolName = (applicant: ApplicationRecord) =>
  applicant.schools?.name ?? applicant.other_school ?? "";

const getGradeValue = (
  applicant: ApplicationRecord,
  field: "gwa" | "english" | "science" | "math",
) => {
  const directValue = applicant[field];
  if (directValue !== null && directValue !== undefined && directValue !== "") {
    return directValue;
  }

  const statement = applicant.personal_statement ?? "";
  const labelMap: Record<typeof field, string> = {
    gwa: "GWA",
    english: "English",
    science: "Science",
    math: "Math",
  };

  const pattern = new RegExp(`${labelMap[field]}:\\s*([0-9]+(?:\\.[0-9]+)?)`, "i");
  const match = statement.match(pattern);

  return match?.[1] ?? "N/A";
};

export default function RegisteredApplicantsModal({
  isOpen,
  onClose,
}: RegisteredApplicantsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [applicants, setApplicants] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchApplications();
        setApplicants(data);
        setCurrentPage(1);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applicants right now."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  const totalPages = Math.max(1, Math.ceil(applicants.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = applicants.slice(startIndex, startIndex + itemsPerPage);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (!applicants.length) return;

    const headers = [
      "Applicant #",
      "Name",
      "Contact Info",
      "School",
      "GWA",
      "English",
      "Science",
      "Math",
      "Program",
      "Applied Date",
    ];

    const rows = applicants.map((a) => [
      a.applicant_number,
      `${a.first_name} ${a.last_name}`.trim(),
      [a.email, a.phone_number].filter(Boolean).join("\n"),
      formatSchoolName(a) || "N/A",
      getGradeValue(a, "gwa"),
      getGradeValue(a, "english"),
      getGradeValue(a, "science"),
      getGradeValue(a, "math"),
      a.programs?.program ?? "",
      new Date(a.applied_date).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            if (/[",\n]/.test(value)) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      )
      .join("\n");

    // Save to download history
    saveDownloadHistory("Applicant List", applicants.length, csvContent);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tup_applicants_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Registered Applicants Report
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                View all applicants who have registered on the TUP-Admission
                website
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L12 15L17 10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15V3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-600">×</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Applicant #
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Contact Info
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      School
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      GWA
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      English
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Science
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Math
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Program
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Applied Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((applicant) => (
                    <tr
                      key={applicant.application_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {applicant.applicant_number}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 font-medium">
                        {applicant.first_name} {applicant.last_name}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        <div>
                          <p>{applicant.email}</p>
                          <p className="text-gray-600">
                            {applicant.phone_number}
                          </p>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        <div>
                          <p className="font-medium text-gray-800">{formatSchoolName(applicant) || "N/A"}</p>
                          <p className="text-xs text-gray-500">
                            {applicant.schools?.name_code ||
                              (applicant.other_school ? "Manual entry" : "")}
                          </p>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {getGradeValue(applicant, "gwa")}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {getGradeValue(applicant, "english")}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {getGradeValue(applicant, "science")}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {getGradeValue(applicant, "math")}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {applicant.programs?.program ?? ""}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {new Date(applicant.applied_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "text-white"
                        : "text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                    style={
                      currentPage === page
                        ? {
                            background:
                              "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                          }
                        : {}
                    }
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages - 1}
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

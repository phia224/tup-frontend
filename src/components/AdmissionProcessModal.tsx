interface AdmissionProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdmissionProcessModal({
  isOpen,
  onClose,
}: AdmissionProcessModalProps) {
  if (!isOpen) return null;

  const admissionSteps = [
    {
      number: "01",
      title: "Submit Application",
      description:
        "Complete our online application form with your personal information and academic background.",
    },
    {
      number: "02",
      title: "Required Documents",
      description:
        "Submit all the required documents in the Office of Admission.",
    },
    {
      number: "03",
      title: "College Interview",
      description: "Report to the university to have an interview.",
    },
    {
      number: "04",
      title: "Medical Requirements",
      description:
        "Report to medical/dental clinic and present the required documents.",
    },
    {
      number: "05",
      title: "Report Back",
      description:
        "Report back to the Office of the Admission for notice of admission, undertaking and student pledge.",
    },
    {
      number: "06",
      title: "Enlistment",
      description: "Report to university for enlistment.",
    },
    {
      number: "07",
      title: "Confirmation",
      description: "Confirmation of enrollment by the registrar.",
    },
  ];

  const applicationDocuments = [
    "Applicant Patient Record Form",
    "Original & Photocopy of Grade 12 SHS Card",
    "Certificate of Good Moral Character",
  ];

  const birthCertificateDocuments = [
    "PSA/NSA Birth Certificate Original & Photocopy",
  ];

  const medicalRequirements = ["Chest X-Ray (PA View)", "Drug Test"];

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
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Admission Process
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Our structured admission procedure ensures a smooth transition as
              you begin your academic journey with us.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-gray-600 flex-shrink-0 ml-4"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Admission Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {admissionSteps.map((step, index) => (
              <div
                key={step.number}
                className={`flex gap-4 ${
                  index === admissionSteps.length - 1
                    ? "md:col-span-2 md:justify-center"
                    : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl"
                    style={{
                      background:
                        "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                    }}
                  >
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Required Documents Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Application Required Documents */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-3">
                Application Required Documents:
              </h3>
              <ul className="space-y-2">
                {applicationDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#A10008" }}
                    >
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700">
                      {doc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Birth Certificate */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="space-y-2">
                {birthCertificateDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#A10008" }}
                    >
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700">
                      {doc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Medical Requirements */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-3">
                Medical Requirements: (Bring Original & Photocopy)
              </h3>
              <ul className="space-y-2">
                {medicalRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#A10008" }}
                    >
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

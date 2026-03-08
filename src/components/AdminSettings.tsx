import { useState, useEffect } from "react";
import {
  getDownloadHistory,
  downloadReport,
  deleteDownloadHistoryRecord,
  type DownloadHistoryRecord,
} from "../utils/downloadHistory";
import { getSiteSettings, saveSiteSettings } from "../utils/siteSettings";

export default function AdminSettings() {
  const [downloadHistory, setDownloadHistory] = useState<
    DownloadHistoryRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [currentEmail] = useState("admin.tup.edu.ph");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [siteTagline, setSiteTagline] = useState("Shape Your Future at TUP");
  const [siteDescription, setSiteDescription] = useState(
    "Join the Technological University of the Philippines where visionaries are built, ideas thrive, and success begins."
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const loadDownloadHistory = () => {
      try {
        setLoading(true);
        const history = getDownloadHistory();
        setDownloadHistory(history);
      } catch (error) {
        console.error("Error loading download history:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadSiteSettings = async () => {
      try {
        setLoadingSettings(true);
        const settings = await getSiteSettings();
        setSiteTagline(settings.tagline);
        setSiteDescription(settings.description);
      } catch (error) {
        console.error("Error loading site settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadDownloadHistory();
    loadSiteSettings();
  }, []);

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleReDownload = (record: DownloadHistoryRecord) => {
    downloadReport(record);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this download record?')) {
      deleteDownloadHistoryRecord(recordId);
      setDownloadHistory(prev => prev.filter(record => record.id !== recordId));
    }
  };

  const handleSaveSettings = async () => {
    if (!siteTagline.trim()) {
      setSaveError("Site tagline cannot be empty.");
      return;
    }

    if (!siteDescription.trim()) {
      setSaveError("Site description cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      await saveSiteSettings({
        tagline: siteTagline.trim(),
        description: siteDescription.trim(),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSettings = async () => {
    try {
      const settings = await getSiteSettings();
      setSiteTagline(settings.tagline);
      setSiteDescription(settings.description);
      setSaveError(null);
      setSaveSuccess(false);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Settings</h2>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Account Settings
        </h3>

        {/* Change Email */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">
            Change Email
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Email
              </label>
              <input
                type="email"
                value={currentEmail}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <button
              className="px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
              }}
            >
              Update Email
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">
            Change Password
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword.current ? (
                      <>
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M17.5 6.5L6.5 17.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword.new ? (
                      <>
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M17.5 6.5L6.5 17.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword.confirm ? (
                      <>
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M17.5 6.5L6.5 17.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <button
              className="px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
              }}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          General Settings
        </h3>
        {loadingSettings ? (
          <div className="text-center py-8 text-gray-500">
            Loading settings...
          </div>
        ) : (
          <>
            {saveError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Settings saved successfully!
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => {
                    setSiteTagline(e.target.value);
                    setSaveError(null);
                    setSaveSuccess(false);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Enter site tagline"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => {
                    setSiteDescription(e.target.value);
                    setSaveError(null);
                    setSaveSuccess(false);
                  }}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  placeholder="Enter site description"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCancelSettings}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Report Download History */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Report Download History
          </h3>
          <p className="text-sm text-gray-600">
            View and re-download the past reports
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Report Name
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Download Date
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  File Size
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-200 px-4 py-6 text-center text-sm text-gray-500"
                  >
                    Loading download history...
                  </td>
                </tr>
              ) : downloadHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-200 px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No download history available. Download a report to see it
                    here.
                  </td>
                </tr>
              ) : (
                downloadHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {report.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {report.downloadDate}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                      {report.fileSize}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleReDownload(report)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 10L12 15L17 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15V3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(report.id)}
                          className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6H5H21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11V17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 11V17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

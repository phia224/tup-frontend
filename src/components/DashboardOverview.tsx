import { useEffect, useMemo, useState } from "react";
import RegisteredApplicantsModal from "./RegisteredApplicantsModal";
import {
  fetchApplications,
  type ApplicationRecord,
  createAnnouncement,
} from "../services/api";

type ActivityStatus = "new" | "success" | "pending";

interface ActivityItem {
  id: number;
  text: string;
  time: string;
  status: ActivityStatus;
}

export default function DashboardOverview() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementDueDate, setAnnouncementDueDate] = useState("");
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchApplications();
        setApplications(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const totalApplicants = applications.filter(
    (app) => app.statuses.status_name === "Approved" || app.statuses.status_name === "Enrolled"
  ).length;

  const recentActivities: ActivityItem[] = useMemo(() => {
    const enrolledApps = applications.filter(
      (app) => app.statuses.status_name === "Approved" || app.statuses.status_name === "Enrolled"
    );
    const sorted = [...enrolledApps].sort(
      (a, b) =>
        new Date(b.applied_date).getTime() -
        new Date(a.applied_date).getTime()
    );
    return sorted.slice(0, 5).map((app) => ({
      id: app.application_id,
      text: `New enrollment ${app.applicant_number} – ${app.first_name} ${app.last_name} for ${app.programs.program}`,
      time: new Date(app.applied_date).toLocaleString(),
      status: "success",
    }));
  }, [applications]);

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case "new":
        return "bg-red-500";
      case "success":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePostAnnouncement = async () => {
    const title = announcementTitle.trim();
    const content = announcementContent.trim();

    if (!title || !content || !announcementDueDate) return;

    setPostingAnnouncement(true);
    try {
      await createAnnouncement({
        title,
        content,
        due_date: announcementDueDate,
      });

      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementDueDate("");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to post announcement right now."
      );
    } finally {
      setPostingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Welcome Back! Here's what's happening today.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Enrollments Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Enrolled Students</p>
            <p className="text-4xl font-bold text-gray-800">
              {loading ? "—" : totalApplicants.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Approved applications considered enrolled
            </p>
          </div>
          <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="#A10008" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 16L12 11L16 15L21 10" stroke="#A10008" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Download Report Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-gray-800 font-medium"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Download Applicants Report
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.length === 0 && !loading && (
              <p className="text-sm text-gray-500">
                No recent enrollments yet.
              </p>
            )}
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(
                    activity.status
                  )}`}
                ></div>
                <div className="flex-1">
                  <p className="text-gray-800">{activity.text}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcement Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Post an announcement
            </h3>
            <p className="text-xs text-gray-500">
              Appears on the admission portal Announcements
            </p>
          </div>
          <input
            type="text"
            className="w-full mb-3 px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            style={{ borderColor: "#3B0003" }}
            placeholder="Title (e.g., Enrollment Period Open)"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={announcementDueDate}
                onChange={(e) => setAnnouncementDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
              />
            </div>
          </div>
          <textarea
            className="w-full h-48 p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
            style={{ borderColor: "#3B0003" }}
            placeholder="Details about the announcement (content)..."
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-4">
            <button
              onClick={handlePostAnnouncement}
              disabled={
                postingAnnouncement ||
                !announcementTitle.trim() ||
                !announcementContent.trim() ||
                !announcementDueDate
              }
              className="px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
              }}
            >
              {postingAnnouncement ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Registered Applicants Modal */}
      <RegisteredApplicantsModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}




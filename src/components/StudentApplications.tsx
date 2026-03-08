import { useEffect, useMemo, useState } from "react";
import type {
  ApplicationRecord,
  ApplicationStatusOption,
} from "../services/api";
import {
  fetchApplications,
  fetchApplicationStatuses,
  modifyApplicationStatus,
} from "../services/api";

type StatusSelection = Record<number, number | undefined>;

type SortField = 'applicant_number' | 'status';
type SortDirection = 'asc' | 'desc';

export default function StudentApplications() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [statuses, setStatuses] = useState<ApplicationStatusOption[]>([]);
  const [statusSelections, setStatusSelections] = useState<StatusSelection>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [sortField, setSortField] = useState<SortField>('applicant_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [apps, statusOptions] = await Promise.all([
          fetchApplications(),
          fetchApplicationStatuses(),
        ]);

        if (!isMounted) return;
        setApplications(apps);
        setStatuses(statusOptions);
        setStatusSelections(
          apps.reduce<StatusSelection>((acc, app) => {
            acc[app.application_id] = app.statuses?.status_id;
            return acc;
          }, {})
        );
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const handleRefresh = () => setReloadKey((prev) => prev + 1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortField === 'applicant_number') {
        aValue = a.applicant_number;
        bValue = b.applicant_number;
      } else if (sortField === 'status') {
        aValue = a.statuses?.status_name || '';
        bValue = b.statuses?.status_name || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [applications, sortField, sortDirection]);

  const statusLookup = useMemo(() => {
    return statuses.reduce<Record<number, ApplicationStatusOption>>(
      (acc, status) => {
        acc[status.status_id] = status;
        return acc;
      },
      {}
    );
  }, [statuses]);

  const handleSelectionChange = (
    applicationId: number,
    newStatusId?: number
  ) => {
    setStatusSelections((prev) => ({
      ...prev,
      [applicationId]: newStatusId,
    }));
  };

  const handleUpdateStatus = async (applicationId: number) => {
    const statusId = statusSelections[applicationId];
    if (statusId === undefined) {
      setError("Please select a status before updating.");
      return;
    }
    const selectedStatus = statusLookup[statusId];

    if (!selectedStatus) {
      setError("Please select a valid status before updating.");
      return;
    }

    try {
      setUpdatingId(applicationId);
      setError(null);
      const updated = await modifyApplicationStatus(
        applicationId,
        selectedStatus.status_name
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === applicationId ? updated : app
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update status right now. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Student Applications
        </h2>
        <p className="text-gray-600">
          Monitor submissions and manage their admission statuses.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">
              {loading
                ? "Loading applications..."
                : `${applications.length} application${
                    applications.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-sm font-medium text-red-700 hover:text-red-900 flex items-center gap-2"
            disabled={loading}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12C3 7.02944 7.02944 3 12 3C15.3221 3 18.2314 4.69257 19.8568 7.26269"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C8.67785 21 5.76862 19.3074 4.14319 16.7373"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 3V8H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 21L21 16H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center text-gray-500">
            Loading applications...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-4 py-3 border-b">
                    <button
                      onClick={() => handleSort('applicant_number')}
                      className="flex items-center gap-1 hover:text-gray-900 font-medium"
                    >
                      Applicant #
                      {sortField === 'applicant_number' && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        >
                          <path
                            d="M7 14L12 9L17 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 border-b">Name &amp; Contact</th>
                  <th className="px-4 py-3 border-b">Program</th>
                  <th className="px-4 py-3 border-b">School</th>
                  <th className="px-4 py-3 border-b">Applied</th>
                  <th className="px-4 py-3 border-b">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-900 font-medium"
                    >
                      Current Status
                      {sortField === 'status' && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        >
                          <path
                            d="M7 14L12 9L17 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b text-sm font-semibold text-gray-900">
                      {app.applicant_number}
                    </td>
                    <td className="px-4 py-3 border-b text-sm text-gray-700">
                      <p className="font-medium">
                        {app.first_name} {app.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                      <p className="text-xs text-gray-500">
                        {app.phone_number}
                      </p>
                    </td>
                    <td className="px-4 py-3 border-b text-sm text-gray-700">
                      <p className="font-medium">
                        {app.programs?.program || 'N/A'} ({app.programs?.program_code || 'N/A'})
                      </p>
                      {app.other_program && (
                        <p className="text-xs text-gray-500">
                          Alt: {app.other_program}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b text-sm text-gray-700">
                      <p className="font-medium">
                        {app.schools?.name || app.other_school || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.schools?.name_code || (app.other_school ? 'Custom School' : '')}
                      </p>
                    </td>
                    <td className="px-4 py-3 border-b text-sm text-gray-700">
                      <p>{formatDate(app.applied_date)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(app.applied_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          app.statuses?.status_name === "Approved"
                            ? "bg-green-100 text-green-800"
                            : app.statuses?.status_name === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : app.statuses?.status_name === "Onprocess"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {app.statuses?.status_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex flex-col gap-2">
                        <select
                          value={
                            statusSelections[app.application_id] !== undefined
                              ? String(statusSelections[app.application_id])
                              : ""
                          }
                          onChange={(e) =>
                            handleSelectionChange(
                              app.application_id,
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          <option value="">Select status</option>
                          {statuses.map((status) => (
                            <option
                              key={status.status_id}
                              value={status.status_id}
                            >
                              {status.status_name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateStatus(app.application_id)}
                          disabled={
                            updatingId === app.application_id ||
                            statusSelections[app.application_id] === undefined
                          }
                          className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            background:
                              "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
                          }}
                        >
                          {updatingId === app.application_id
                            ? "Updating..."
                            : "Update Status"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {applications.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                No applications found yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

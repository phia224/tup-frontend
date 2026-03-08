export interface DownloadHistoryRecord {
  id: string;
  name: string;
  downloadDate: string;
  fileSize: string;
  applicantCount: number;
  csvContent: string; // Store CSV content for re-download
}

const STORAGE_KEY = "tup_download_history";

export function saveDownloadHistory(
  name: string,
  applicantCount: number,
  csvContent: string
): DownloadHistoryRecord {
  const history = getDownloadHistory();

  // Calculate file size (approximate)
  const fileSizeBytes = new Blob([csvContent]).size;
  const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
  const fileSize =
    fileSizeMB === "0.00"
      ? `${(fileSizeBytes / 1024).toFixed(2)} KB`
      : `${fileSizeMB} MB`;

  // Format date
  const now = new Date();
  const downloadDate = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const record: DownloadHistoryRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${name} (${applicantCount})`,
    downloadDate,
    fileSize,
    applicantCount,
    csvContent,
  };

  // Add to beginning of array (most recent first)
  const updatedHistory = [record, ...history];

  // Keep only last 50 records
  const limitedHistory = updatedHistory.slice(0, 50);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));

  return record;
}

export function getDownloadHistory(): DownloadHistoryRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as DownloadHistoryRecord[];
  } catch {
    return [];
  }
}

export function downloadReport(record: DownloadHistoryRecord): void {
  const blob = new Blob([record.csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${record.name.replace(/\s+/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function deleteDownloadHistoryRecord(recordId: string): void {
  const history = getDownloadHistory();
  const updatedHistory = history.filter(record => record.id !== recordId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
}
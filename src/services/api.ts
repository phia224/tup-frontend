const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type ApiResponse<T> = {
  message: string;
  data: T;
};

const buildUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is not defined. Please set it in your environment.",
    );
  }

  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${normalizedBase}${path}`;
};

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    let errorMessage =
      errorPayload ||
      `Request to ${path} failed with status ${response.status}`;

    // Try to parse JSON error response
    try {
      const errorJson = JSON.parse(errorPayload);
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // If not JSON, use the raw error payload
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export interface Strand {
  strand_id: number;
  strand: string;
  strand_code: string;
  track_id: number;
}

export interface Track {
  track_id: number;
  track: string;
  strands: Strand[];
}

export interface ProgramRequirement {
  requirement_id: number;
  english: string;
  science: string;
  math: string;
}

export interface ProgramOption {
  program_id: number;
  program: string;
  program_code: string;
  duration: string;
  credits: string;
  tuition_fee: string;
  enrollment_limit: number | null;
  college_id: number;
  created_at?: string;
  updated_at?: string;
  program_requirements: ProgramRequirement[];
}

export interface SchoolOption {
  school_id: number;
  name: string;
  name_code: string;
  address: string | null;
}

export interface ApplicationPayload {
  first_name: string;
  last_name: string;
  birthdate: string;
  email: string;
  phone_number: string;
  school_id?: number;
  program_id: number;
  other_program?: string;
  other_school?: string;
  gwa?: number;
  english?: number;
  science?: number;
  math?: number;
  personal_statement: string;
}

export interface ApplicationResponse {
  message: string;
  data: {
    applicant_number: string;
    status_id: number;
  };
}

export async function fetchTracks(): Promise<Track[]> {
  const response = await apiRequest<ApiResponse<Track[]>>(
    "/api/options/tracks",
  );
  return response.data;
}

export async function fetchPrograms(): Promise<ProgramOption[]> {
  const response = await apiRequest<ApiResponse<ProgramOption[]>>(
    "/api/options/programs",
  );
  return response.data;
}

export async function fetchSchools(): Promise<SchoolOption[]> {
  const response = await apiRequest<ApiResponse<SchoolOption[]>>(
    "/api/options/schools",
  );
  return response.data;
}

export interface AnnouncementOption {
  announcement_id: number;
  title: string;
  content: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_active: boolean;
}

export async function fetchAnnouncements(): Promise<AnnouncementOption[]> {
  const response = await apiRequest<ApiResponse<AnnouncementOption[]>>(
    "/api/options/announcement",
  );
  return response.data;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  due_date: string;
}

export async function createAnnouncement(
  payload: CreateAnnouncementPayload,
): Promise<AnnouncementOption> {
  const response = await apiRequest<ApiResponse<AnnouncementOption>>(
    "/api/application/post-announcement",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

export async function submitApplication(payload: ApplicationPayload) {
  return apiRequest<ApplicationResponse>(
    "/api/application/apply-for-application",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ApplicationStatusOption {
  status_id: number;
  status_name: string;
}

export interface ApplicationProgramSummary {
  program_id: number;
  program: string;
  program_code: string;
  duration: string;
  credits: string;
  tuition_fee: string;
  college_id: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRecord {
  application_id: number;
  applicant_number: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  email: string;
  phone_number: string;
  school_id: number | null;
  program_id: number;
  other_program: string | null;
  other_school: string | null;
  gwa: string | null;
  english: string | null;
  science: string | null;
  math: string | null;
  personal_statement: string;
  status_id: number;
  user_id: number | null;
  is_active: boolean;
  version: number;
  applied_date: string;
  created_at: string;
  updated_at: string;
  schools: SchoolOption | null;
  programs: ApplicationProgramSummary;
  statuses: ApplicationStatusOption;
  users: unknown;
}

export async function fetchApplicationStatuses(): Promise<
  ApplicationStatusOption[]
> {
  const response = await apiRequest<ApiResponse<ApplicationStatusOption[]>>(
    "/api/options/statuses",
  );
  return response.data;
}

export async function fetchApplications(): Promise<ApplicationRecord[]> {
  const response = await apiRequest<ApiResponse<ApplicationRecord[]>>(
    "/api/application/applications",
  );
  return response.data;
}

export async function modifyApplicationStatus(
  applicationId: number,
  status: string,
): Promise<ApplicationRecord> {
  const response = await apiRequest<ApiResponse<ApplicationRecord>>(
    `/api/application/modify-status?application_id=${applicationId}`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
  );
  return response.data;
}

export interface ProgramEnrollmentUpdateResponse {
  program_id: number;
  program: string;
  program_code: string;
  duration: string;
  credits: string;
  tuition_fee: string;
  enrollment_limit: number | null;
  college_id: number;
  created_at: string;
  updated_at: string;
}

export async function modifyProgramEnrollmentLimit(
  programId: number,
  enrollmentLimit: string | null,
  credits?: string | null,
): Promise<ProgramEnrollmentUpdateResponse> {
  const payload: { enrollment_limit?: string | null; credits?: string | null } =
    {
      enrollment_limit: enrollmentLimit,
    };

  if (credits !== undefined) {
    payload.credits = credits;
  }

  const response = await apiRequest<
    ApiResponse<ProgramEnrollmentUpdateResponse>
  >(`/api/application/modify-enrollment-limit?program_id=${programId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export interface Setting {
  setting_id: number;
  tagline: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchSettings(): Promise<Setting[]> {
  const response = await apiRequest<ApiResponse<Setting[]>>(
    "/api/application/settings",
  );
  return response.data;
}

export async function fetchSetting(settingId: number): Promise<Setting> {
  const response = await apiRequest<ApiResponse<Setting>>(
    `/api/application/setting?setting_id=${settingId}`,
  );
  return response.data;
}

export interface UpdateSettingPayload {
  tagline: string;
  description: string;
}

export async function updateSetting(
  settingId: number,
  payload: UpdateSettingPayload,
): Promise<Setting> {
  const response = await apiRequest<ApiResponse<Setting>>(
    `/api/application/modify-setting?setting_id=${settingId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

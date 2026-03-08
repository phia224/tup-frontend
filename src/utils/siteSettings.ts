import { fetchSetting, updateSetting, type Setting } from "../services/api";

export interface SiteSettings {
  tagline: string;
  description: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  tagline: "Shape Your\nFuture at TUP",
  description:
    "Join the Technological University of the Philippines where visionaries are built, ideas thrive, and success begins.",
};

// Default setting ID - assuming setting_id=1 is the main site settings
const DEFAULT_SETTING_ID = 1;

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const setting = await fetchSetting(DEFAULT_SETTING_ID);
    return {
      tagline: setting.tagline || DEFAULT_SETTINGS.tagline,
      description: setting.description || DEFAULT_SETTINGS.description,
    };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    // Return default settings if API fails
    return DEFAULT_SETTINGS;
  }
}

export async function saveSiteSettings(
  settings: SiteSettings
): Promise<Setting> {
  try {
    const updated = await updateSetting(DEFAULT_SETTING_ID, {
      tagline: settings.tagline,
      description: settings.description,
    });
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(
      new CustomEvent("siteSettingsUpdated", { detail: settings })
    );
    return updated;
  } catch (error) {
    console.error("Error saving site settings:", error);
    throw new Error("Failed to save site settings");
  }
}

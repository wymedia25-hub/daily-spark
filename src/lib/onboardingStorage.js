const STORAGE_KEY = "daily_spark_onboarding";

export function saveOnboardingData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getOnboardingData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOnboardingData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function mapPainToStruggle(pain) {
  const map = {
    "Losing motivation": "Lack of motivation",
    "Inconsistent": "Inconsistent",
    "Distracted": "Distracted",
    "Not sure where to start": "Not sure where to start",
  };
  return map[pain] || pain;
}
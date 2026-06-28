export const THEME_GRADIENTS = {
  "Calm nature": "linear-gradient(135deg, #2d6a5f 0%, #4a9b8e 50%, #1f4a42 100%)",
  "Night sky": "linear-gradient(135deg, #1a1a4e 0%, #2d2b6f 50%, #0d0d2e 100%)",
  "Cozy": "linear-gradient(135deg, #6b4423 0%, #a0653a 50%, #3e2918 100%)",
  "Minimal": "linear-gradient(135deg, #3a3a3a 0%, #5a5a5a 50%, #2a2a2a 100%)",
};

export function getThemeGradient(themeName) {
  return THEME_GRADIENTS[themeName] || THEME_GRADIENTS["Calm nature"];
}
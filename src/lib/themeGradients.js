const THEME_GRADIENTS = {
  "Calm nature": "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  "Night sky": "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "Cozy": "linear-gradient(135deg, #4b3621 0%, #b0662a 50%, #d9985f 100%)",
  "Minimal": "linear-gradient(135deg, #b8b8b8 0%, #e8e8e8 50%, #5a5a5a 100%)",
  "Ocean": "linear-gradient(135deg, #2b5876 0%, #4e9eb9 50%, #62b6cb 100%)",
  "Sunset": "linear-gradient(135deg, #ff512f 0%, #f09819 50%, #ff8a5c 100%)",
  "Forest": "linear-gradient(135deg, #0b3d2e 0%, #1b6e4a 50%, #2e8b57 100%)",
  "Mountains": "linear-gradient(135deg, #2c3e50 0%, #4a6278 50%, #8e9eab 100%)",
  "Galaxy": "linear-gradient(135deg, #1a0033 0%, #4a148c 40%, #7b1fa2 70%, #e1bee7 100%)",
  "Golden hour": "linear-gradient(135deg, #f7971e 0%, #ffd200 50%, #ff9a44 100%)",
};

export function getThemeGradient(themeName) {
  return THEME_GRADIENTS[themeName] || "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)";
}
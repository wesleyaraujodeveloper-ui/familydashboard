import { useThemeStore } from '../store/theme';
import { colors, darkColors, typography, spacing, radius, shadows } from './index';

export const useAppTheme = () => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  return {
    colors: isDarkMode ? darkColors : colors,
    typography,
    spacing,
    radius,
    shadows,
    isDarkMode,
  };
};

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: 'level1' | 'level2' | 'level3';
}

export const Card = ({ children, elevation = 'level1', style, ...props }: CardProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.card, theme.shadows[elevation], style]} {...props}>
      {children}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
});

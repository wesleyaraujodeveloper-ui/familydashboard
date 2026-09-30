import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: 'level1' | 'level2' | 'level3';
}

export const Card = ({ children, elevation = 'level1', style, ...props }: CardProps) => {
  return (
    <View style={[styles.card, theme.shadows[elevation], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
});

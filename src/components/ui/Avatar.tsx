import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

interface AvatarProps {
  src?: string;
  initials?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  url?: string;
}

export const Avatar = ({ src, initials, size = 40, name, url }: AvatarProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  let numSize = 40;
  if (typeof size === 'string') {
    if (size === 'sm') numSize = 32;
    if (size === 'md') numSize = 48;
    if (size === 'lg') numSize = 64;
    if (size === 'xl') numSize = 80;
  } else {
    numSize = size;
  }
  
  const containerStyle = { width: numSize, height: numSize, borderRadius: numSize / 2 };
  const imageSrc = src || url;
  const chars = initials || (name ? name.substring(0, 2).toUpperCase() : '?');

  return (
    <View style={[styles.container, containerStyle]}>
      {imageSrc ? (
        <Image source={{ uri: imageSrc }} style={containerStyle} />
      ) : (
        <Text style={[styles.initials, { fontSize: numSize * 0.4 }]}>{chars}</Text>
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceSubdued,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  initials: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  }
});

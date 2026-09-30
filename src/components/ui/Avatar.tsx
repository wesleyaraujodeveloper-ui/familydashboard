import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface AvatarProps {
  src?: string;
  initials?: string;
  size?: number;
}

export const Avatar = ({ src, initials, size = 40 }: AvatarProps) => {
  const containerStyle = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.container, containerStyle]}>
      {src ? (
        <Image source={{ uri: src }} style={containerStyle} />
      ) : (
        <Text style={styles.initials}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

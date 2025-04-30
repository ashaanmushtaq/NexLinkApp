import { StyleSheet } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { getUserImageSrc } from '../../service/imageService';

const Avatar = ({
  uri,
  size = 26,
  rounded = 14,
  style = {},
}) => {
  return (
    <Image
      source={getUserImageSrc(uri)}
      transition={100}
      style={[
        styles.avatar,
        { height: size, width: size, borderRadius: rounded },
        style // ✅ Correct placement
      ]}
    />
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderCurve: 'continuous',
    borderColor: '#e1e1e1',
    borderWidth: 1,
  },
});

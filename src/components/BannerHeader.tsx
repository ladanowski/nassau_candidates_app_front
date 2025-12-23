import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { images } from '../constants/images';
import { Colors } from '../constants/colors';

const BannerHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        style={{ width: '100%', aspectRatio: 240 / 73 }}
        resizeMode="contain" source={images.bannerHeader}
      />
    </View>
  );
};

export default BannerHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.light.background,
    // alignItems: 'center',
    // justifyContent: 'center',
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 2,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

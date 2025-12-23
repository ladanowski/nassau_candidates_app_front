import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { svgs } from '../constants/images';
import { Colors } from '../constants/colors';

interface BannerHeaderProps {
  title: string;
}

const AppBar: React.FC<BannerHeaderProps> = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.appBar}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
        <svgs.back width={24} height={24} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
};

export default AppBar;

const styles = StyleSheet.create({
   appBar: {
        height: 56,
        backgroundColor: Colors.light.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        color: '#fff',
        fontFamily: 'MyriadPro-Bold',
        marginHorizontal: 8,
    },
});

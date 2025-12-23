import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface SwitchOptionItemProps {
  title: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

const SwitchOptionItem: React.FC<SwitchOptionItemProps> = ({ title, value, onValueChange }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Switch
      trackColor={{ false: '#767577', true: Colors.light.secondary }}
      thumbColor={Colors.light.background}
      ios_backgroundColor={Colors.light.icon}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontFamily: 'MyriadPro-Bold',
    fontSize: 16,
    flex: 1,
  },
});

export default SwitchOptionItem;
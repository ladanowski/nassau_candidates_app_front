import {StyleSheet} from 'react-native';
import { Colors } from '../constants/colors';

export const globalStyles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },

    modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import AppBar from '../../components/AppBar';
import {globalStyles} from '../../styles/globalStyles';
import {Colors} from '../../constants/colors';
import {
  getPdfSourceForPrecinct,
  PrecinctPdfSource,
} from '../../constants/pollingLocationPdfs';

type PollingLocationsRouteParams = {
  pollingLocations: {
    title: string;
  };
};

type LocalPollingLocation = {
  precinct: string;
  locationName: string;
};

const PollingLocationsScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<PollingLocationsRouteParams, 'pollingLocations'>>();
  const {title} = route.params;

  const [selectedPdf, setSelectedPdf] = useState<{uri: string} | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  const localPollingLocations: LocalPollingLocation[] = useMemo(
    () => [
      {precinct: '11', locationName: 'MLK Rec Center'},
      {precinct: '12', locationName: 'Atlantic Rec Center'},
      {precinct: '13', locationName: 'Peck Center Auditorium'},
      {precinct: '14/31', locationName: 'James Page Governmental Complex'},
      {precinct: '21', locationName: 'American Beach Community Center'},
      {precinct: '22/23', locationName: 'Springhill Baptist Church'},
      {precinct: '32', locationName: 'Yulee Sports Complex'},
      {precinct: '33', locationName: 'River of Praise Worship Center'},
      {precinct: '34/51', locationName: 'FSCJ Nassau'},
      {precinct: '41', locationName: 'Hilliard Community Center'},
      {precinct: '42', locationName: 'River Road Baptist Church'},
      {precinct: '43', locationName: 'Bryceville Community Center'},
      {
        precinct: '44/52',
        locationName: 'Callahan Fairground Multi-Use Facility',
      },
      {precinct: '53', locationName: 'Walter Junior Boatright County Building'},
    ],
    [],
  );

  const openPrecinctPdf = (precinct: string) => {
    if (!precinct) return;

    // Get PDF asset source for this precinct (bundled locally)
    const pdfAsset: PrecinctPdfSource | null =
      getPdfSourceForPrecinct(precinct);

    if (pdfAsset) {
      // Resolve bundled asset into a real URI for react-native-pdf.
      const resolved = Image.resolveAssetSource(pdfAsset);
      const uri = resolved?.uri;
      if (!uri) {
        Alert.alert(
          'Error',
          'PDF asset could not be resolved. Please rebuild the app.',
          [{text: 'OK'}],
        );
        return;
      }

      setSelectedPdf({uri});
      setPdfLoading(true);
    } else {
      // No local PDF available for this precinct
      Alert.alert(
        `Precinct ${precinct}`,
        'PDF map is not available for this precinct at this time.',
        [{text: 'OK'}],
      );
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Polling Locations</Text>
        <Text style={styles.subTitle}>
          Tap a precinct to open its polling location PDF (stored locally in the
          app).
        </Text>

        {localPollingLocations.map(item => (
          <TouchableOpacity
            key={item.precinct}
            style={styles.localRow}
            activeOpacity={0.7}
            onPress={() => openPrecinctPdf(item.precinct)}>
            <View style={styles.localRowLeft}>
              <Text style={styles.localPrecinct}>Precinct {item.precinct}</Text>
              <Text style={styles.localLocationName}>{item.locationName}</Text>
            </View>
            <Text style={styles.localChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PDF Modal */}
      <Modal
        visible={selectedPdf !== null}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setSelectedPdf(null)}>
        <SafeAreaView style={styles.pdfModalContainer}>
          <View style={styles.pdfModalHeader}>
            <Text style={styles.pdfModalTitle}>Polling Location Map</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedPdf(null);
                setPdfLoading(false);
              }}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {pdfLoading && (
            <View style={styles.pdfLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.pdfLoadingText}>Loading PDF...</Text>
            </View>
          )}
          {selectedPdf && (
            <Pdf
              source={selectedPdf}
              style={styles.pdf}
              onLoadComplete={() => setPdfLoading(false)}
              onError={err => {
                console.error('PDF render error:', err);
                setPdfLoading(false);
                Alert.alert(
                  'Error',
                  'Failed to load PDF. The file may not be available in the app bundle.',
                  [
                    {
                      text: 'OK',
                      onPress: () => setSelectedPdf(null),
                    },
                  ],
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  localRowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  localPrecinct: {
    fontSize: 14,
    color: Colors.light.primary,
    fontFamily: 'MyriadPro-Bold',
    marginBottom: 2,
  },
  localLocationName: {
    fontSize: 13,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
  },
  localChevron: {
    fontSize: 26,
    color: Colors.light.primary,
    fontFamily: 'MyriadPro-Bold',
    marginLeft: 8,
    lineHeight: 26,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pdfModalTitle: {
    fontSize: 18,
    fontFamily: 'MyriadPro-Bold',
    color: '#fff',
  },
  pdfLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  pdfLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default PollingLocationsScreen;

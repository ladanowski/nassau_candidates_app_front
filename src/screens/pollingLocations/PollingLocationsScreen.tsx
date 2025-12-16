import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, Dimensions, TouchableOpacity, Alert, Modal } from "react-native";
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import { getPollingLocations, PollingLocationData, PollingLocationSection, TableSection, ListSection, TextSection } from '../../services/api_services/PollingLocationsService';
import { getPdfUrlForPrecinct } from '../../constants/pollingLocationPdfs';

type PollingLocationsRouteParams = {
    pollingLocations: {
        title: string;
    };
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const PollingLocationsScreen: React.FC = () => {
    const route = useRoute<RouteProp<PollingLocationsRouteParams, 'pollingLocations'>>();
    const navigation = useNavigation();
    const { title } = route.params;

    const [data, setData] = useState<PollingLocationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getPollingLocations();
                if (result) {
                    setData(result);
                } else {
                    setError('No data available');
                }
            } catch (e: any) {
                console.error('Failed to fetch polling locations:', e);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRowPress = (row: Record<string, string>) => {
        if (!data) return;
        
        // Get precinct information
        const precinct = row['Precinct'] || row['precinct'] || '';
        
        // Get PDF URL for this precinct using our mapping (only local PDFs)
        const pdfUrl = getPdfUrlForPrecinct(precinct);
        
        if (pdfUrl) {
            // Display PDF in modal using WebView
            setSelectedPdf(pdfUrl);
            setPdfLoading(true);
        } else {
            // No local PDF available for this precinct
            Alert.alert(
                precinct || 'Polling Location',
                'PDF map is not available for this precinct at this time.',
                [{ text: 'OK' }]
            );
        }
    };

    const renderTable = (section: TableSection, index: number) => {
        if (!section.headers || section.headers.length === 0 || !section.data || section.data.length === 0) {
            return null;
        }

        const columnWidth = Math.max(120, (SCREEN_WIDTH - 40) / section.headers.length);

        return (
            <View key={`table-${index}`} style={styles.section}>
                {section.heading && (
                    <Text style={styles.sectionHeading}>{section.heading}</Text>
                )}
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            {section.headers.map((header, i) => (
                                <Text 
                                    key={i}
                                    style={[styles.headerText, { width: columnWidth }]}
                                    numberOfLines={2}
                                >
                                    {header}
                                </Text>
                            ))}
                        </View>
                        
                        {/* Table Rows */}
                        {section.data.map((row, rowIndex) => (
                            <TouchableOpacity
                                key={rowIndex}
                                style={[
                                    styles.tableRow,
                                    rowIndex % 2 === 0 ? styles.rowEven : styles.rowOdd
                                ]}
                                onPress={() => handleRowPress(row)}
                                activeOpacity={0.7}
                            >
                                {section.headers.map((header, colIndex) => (
                                    <Text
                                        key={colIndex}
                                        style={[styles.cellText, { width: columnWidth }]}
                                        numberOfLines={3}
                                    >
                                        {row[header] || ''}
                                    </Text>
                                ))}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderList = (section: ListSection, index: number) => {
        if (!section.data || section.data.length === 0) {
            return null;
        }

        return (
            <View key={`list-${index}`} style={styles.section}>
                {section.heading && (
                    <Text style={styles.sectionHeading}>{section.heading}</Text>
                )}
                <View style={styles.listContainer}>
                    {section.data.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.listItem}>
                            <Text style={styles.listBullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderText = (section: TextSection, index: number) => {
        if (!section.data || (Array.isArray(section.data) && section.data.length === 0)) {
            return null;
        }

        return (
            <View key={`text-${index}`} style={styles.section}>
                {section.heading && (
                    <Text style={styles.sectionHeading}>{section.heading}</Text>
                )}
                <View style={styles.textContainer}>
                    {Array.isArray(section.data) && section.data.map((item, itemIndex) => {
                        // Check if item is an object with heading and paragraphs
                        if (typeof item === 'object' && 'heading' in item && 'paragraphs' in item) {
                            return (
                                <View key={itemIndex} style={styles.textSubsection}>
                                    <Text style={styles.textSubheading}>{item.heading}</Text>
                                    {item.paragraphs.map((para, paraIndex) => (
                                        <Text key={paraIndex} style={styles.textParagraph}>
                                            {para}
                                        </Text>
                                    ))}
                                </View>
                            );
                        } else {
                            // Simple string item
                            return (
                                <Text key={itemIndex} style={styles.textParagraph}>
                                    {String(item)}
                                </Text>
                            );
                        }
                    })}
                </View>
            </View>
        );
    };

    const renderSection = (section: PollingLocationSection, index: number) => {
        switch (section.type) {
            case 'table':
                return renderTable(section as TableSection, index);
            case 'list':
                return renderList(section as ListSection, index);
            case 'text':
                return renderText(section as TextSection, index);
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={title} />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={styles.loadingText}>Loading content...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : data ? (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {data.title && (
                        <Text style={styles.pageTitle}>{data.title}</Text>
                    )}
                    {data.requiresWebView && data.originalUrl && (
                        <View style={styles.webViewFallback}>
                            <Text style={styles.fallbackText}>
                                The website is blocking automated access. Would you like to view it in a web browser?
                            </Text>
                            <TouchableOpacity
                                style={styles.webViewButton}
                                onPress={() => {
                                    if (data.originalUrl) {
                                        (navigation as any).navigate('webView', {
                                            title: data.title,
                                            link: data.originalUrl
                                        });
                                    }
                                }}
                            >
                                <Text style={styles.webViewButtonText}>Open in Web View</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {data.sections.map((section, index) => renderSection(section, index))}
                </ScrollView>
            ) : (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No content available</Text>
                </View>
            )}
            
            {/* PDF Modal */}
            <Modal
                visible={selectedPdf !== null}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setSelectedPdf(null)}
            >
                <SafeAreaView style={styles.pdfModalContainer}>
                    <View style={styles.pdfModalHeader}>
                        <Text style={styles.pdfModalTitle}>Polling Location Map</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setSelectedPdf(null);
                                setPdfLoading(false);
                            }}
                        >
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
                        <WebView
                            source={{ uri: selectedPdf }}
                            style={styles.webView}
                            onLoadStart={() => setPdfLoading(true)}
                            onLoadEnd={() => setPdfLoading(false)}
                            onError={(syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.error('WebView error: ', nativeEvent);
                                setPdfLoading(false);
                                Alert.alert(
                                    'Error',
                                    'Failed to load PDF. The file may not be available locally.',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => setSelectedPdf(null)
                                        }
                                    ]
                                );
                            }}
                            onHttpError={(syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.error('WebView HTTP error: ', nativeEvent);
                                setPdfLoading(false);
                                if (nativeEvent.statusCode === 404 || nativeEvent.statusCode === 403) {
                                    Alert.alert(
                                        'PDF Not Available',
                                        'This PDF is not available locally. Please contact support.',
                                        [
                                            {
                                                text: 'OK',
                                                onPress: () => setSelectedPdf(null)
                                            }
                                        ]
                                    );
                                }
                            }}
                            scalesPageToFit={true}
                            startInLoadingState={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    errorText: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        textAlign: 'center',
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
    section: {
        marginBottom: 24,
    },
    sectionHeading: {
        fontSize: 18,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
        marginBottom: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginHorizontal: 10,
    },
    headerText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        fontFamily: 'MyriadPro-Bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginVertical: 2,
        marginHorizontal: 10,
        alignItems: 'center',
        minHeight: 40,
    },
    cellText: {
        textAlign: 'center',
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        fontSize: 12,
    },
    rowEven: {
        backgroundColor: `${Colors.light.primary}14`,
    },
    rowOdd: {
        backgroundColor: Colors.light.background,
    },
    listContainer: {
        paddingLeft: 8,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingRight: 12,
    },
    listBullet: {
        fontSize: 16,
        color: Colors.light.primary,
        marginRight: 8,
        fontFamily: 'MyriadPro-Bold',
    },
    listText: {
        flex: 1,
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 20,
    },
    textContainer: {
        paddingHorizontal: 4,
    },
    textSubsection: {
        marginBottom: 16,
    },
    textSubheading: {
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
        marginBottom: 8,
    },
    textParagraph: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 22,
        marginBottom: 12,
    },
    webViewFallback: {
        backgroundColor: `${Colors.light.primary}20`,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    fallbackText: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        textAlign: 'center',
        marginBottom: 12,
    },
    webViewButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    webViewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
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
    webView: {
        flex: 1,
    },
});

export default PollingLocationsScreen;


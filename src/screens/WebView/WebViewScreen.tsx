import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert } from "react-native";
import { Colors } from "../../constants/colors";
import { RouteProp, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';

type WebViewRouteParams = {
    webView: {
        link: string;
        title: string;
    };
};

const WebViewScreen: React.FC = () => {
    const route = useRoute<RouteProp<WebViewRouteParams, 'webView'>>();
    const { link, title } = route.params;

    const [loading, setLoading] = useState(true);
    const [currentUrl, setCurrentUrl] = useState(link);

    const handleCopyUrl = async () => {
        try {
            // Dynamic import to avoid loading issues if native module isn't linked
            const Clipboard = await import('@react-native-clipboard/clipboard');
            Clipboard.default.setString(currentUrl);
            Alert.alert('Copied!', 'URL has been copied to clipboard');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback: show the URL in an alert so user can manually copy
            Alert.alert('Copy URL', currentUrl, [
                { text: 'OK' }
            ]);
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.appBarWrapper}>
                    <AppBar title={title} />
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleCopyUrl}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.copyButtonText}>Copy URL</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <WebView
                source={{ uri: link }}
                style={{ flex: 1 }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onNavigationStateChange={(navState) => {
                    setCurrentUrl(navState.url);
                }}
            />

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            )}
        </SafeAreaView>
    );
};

export default WebViewScreen;

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Colors.light.primary,
    },
    appBarWrapper: {
        position: 'relative',
    },
    copyButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: Colors.light.secondary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        zIndex: 10,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'MyriadPro-Bold',
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/colors";
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
    const navigation = useNavigation();
    const { link, title } = route.params;

    const [loading, setLoading] = useState(true);

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={title} />

            <WebView
                source={{ uri: link }}
                style={{ flex: 1 }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
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
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

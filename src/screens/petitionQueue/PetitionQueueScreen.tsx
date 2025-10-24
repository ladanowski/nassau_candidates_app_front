import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';


type PetitionQueueRouteParams = {
    petitionQueue: {
        title: string;
    };
};

const PetitionQueueScreen: React.FC = () => {
    const route = useRoute<RouteProp<PetitionQueueRouteParams, 'petitionQueue'>>();
    const { title } = route.params;

    const data: any[] = [
        { candidate: 'John Doe', batch: 'Batch A', count: 12, status: 'Pending' },
        { candidate: 'Jane Smith', batch: 'Batch B', count: 8, status: 'Approved' },
        { candidate: 'Ali Khan', batch: 'Batch C', count: 15, status: 'Rejected' },
        { candidate: 'Sara Lee', batch: 'Batch D', count: 10, status: 'Pending' },
        { candidate: 'John Doe', batch: 'Batch A', count: 12, status: 'Pending' },
        { candidate: 'Jane Smith', batch: 'Batch B', count: 8, status: 'Approved' },
        { candidate: 'Ali Khan', batch: 'Batch C', count: 15, status: 'Rejected' },
        { candidate: 'Sara Lee', batch: 'Batch D', count: 10, status: 'Pending' },
        { candidate: 'John Doe', batch: 'Batch A', count: 12, status: 'Pending' },
        { candidate: 'Jane Smith', batch: 'Batch B', count: 8, status: 'Approved' },
        { candidate: 'Ali Khan', batch: 'Batch C', count: 15, status: 'Rejected' },
        { candidate: 'Sara Lee', batch: 'Batch D', count: 10, status: 'Pending' },
        { candidate: 'John Doe', batch: 'Batch A', count: 12, status: 'Pending' },
        { candidate: 'Jane Smith', batch: 'Batch B', count: 8, status: 'Approved' },
        { candidate: 'Ali Khan', batch: 'Batch C', count: 15, status: 'Rejected' },
        { candidate: 'Sara Lee', batch: 'Batch D', count: 10, status: 'Pending' },
    ];

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={title} />

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerText, { flex: 2 }]}>Candidate</Text>
                <Text style={[styles.headerText, { flex: 1 }]}>Batch</Text>
                <Text style={[styles.headerText, { flex: 1 }]}>Count</Text>
                <Text style={[styles.headerText, { flex: 1 }]}>Status</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                {/* Table Body */}
                {data.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No records found</Text>
                    </View>
                ) : (
                    data.map((item, index) => (
                        <View
                            key={index}
                            style={[
                                styles.tableRow,
                                index % 2 === 0 ? styles.rowEven : styles.rowOdd
                            ]}
                        >
                            <Text style={[styles.cellText, { flex: 2 }]}>{item.candidate}</Text>
                            <Text style={[styles.cellText, { flex: 1 }]}>{item.batch}</Text>
                            <Text style={[styles.cellText, { flex: 1 }]}>{item.count}</Text>
                            <Text style={[styles.cellText, { flex: 1 }]}>{item.status}</Text>
                        </View>
                    ))
                )}

            </ScrollView>

        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        paddingHorizontal: 10,
    },
    scrollContent: {
        paddingVertical: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginHorizontal: 10,
        marginTop: 8,
    },
    headerText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'MyriadPro-Bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginVertical: 4,
    },
    cellText: {
        textAlign: 'center',
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        fontSize: 14,
    },
    rowEven: {
        backgroundColor: `${Colors.light.primary}14`,
    },
    rowOdd: {
        backgroundColor: Colors.light.background,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
    },
});

export default PetitionQueueScreen;
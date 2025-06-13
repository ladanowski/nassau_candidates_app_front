import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import AppBar from '../../components/AppBar';
import SwitchOptionItem from '../../components/SwitchOptionItem';


const CandidateFinanceReport: React.FC = () => {
    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={"Candidate Finance Report"} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                <SwitchOptionItem title="2 Days Before" value={false} onValueChange={(val) => {/* handle toggle */ }} />
                <SwitchOptionItem title="1 Day Before" value={true} onValueChange={(val) => {/* handle toggle */ }} />
                <SwitchOptionItem title="Deadline" value={false} onValueChange={(val) => {/* handle toggle */ }} />
                <SwitchOptionItem title="Past Due" value={true} onValueChange={(val) => {/* handle toggle */ }} />

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingVertical: 16,
    },
});

export default CandidateFinanceReport;  

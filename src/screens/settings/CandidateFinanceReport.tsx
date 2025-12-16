import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import AppBar from '../../components/AppBar';
import SwitchOptionItem from '../../components/SwitchOptionItem';


const CandidateFinanceReport: React.FC = () => {
    const [isTwoDayBefore, setIsTwoDayBefore] = useState(false);
    const [isOneDayBefore, setIsOneDayBefore] = useState(false);
    const [isDeadline, setIsDeadline] = useState(false);
    const [isPastDue, setIsPastDue] = useState(false);

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={"Candidate Finance Report"} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                <SwitchOptionItem title="2 Days Before" value={isTwoDayBefore} onValueChange={(val) => setIsTwoDayBefore(val)} />
                <SwitchOptionItem title="1 Day Before" value={isOneDayBefore} onValueChange={(val) => setIsOneDayBefore(val)} />
                <SwitchOptionItem title="Deadline" value={isDeadline} onValueChange={(val) => setIsDeadline(val)} />
                <SwitchOptionItem title="Past Due" value={isPastDue} onValueChange={(val) => setIsPastDue(val)} />

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

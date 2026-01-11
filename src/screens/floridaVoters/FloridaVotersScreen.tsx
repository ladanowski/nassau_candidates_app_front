import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, FlatList, Dimensions, Share, Alert, TextInput } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import { getCities, getCountyCommissionDistricts, getSchoolBoardDistricts, getFilteredVoters } from '../../services/api_services/FloridaVotersService';
import { svgs } from '../../constants/images';

type FloridaVotersRouteParams = {
    floridaVoters: {
        title: string;
    };
};

type VoterItem = {
    // Known fields used in the UI
    VoterId?: string;
    NameLast?: string;
    NameFirst?: string;
    NameMiddle?: string;
    ResidenceCity?: string;
    ResidenceAddressLine1?: string;
    ResidenceZipcode?: string;
    PartyAffiliation?: string;
    VoterStatus?: string;
    CountyCommissionDistrict?: string;
    SchoolBoardDistrict?: string;
    BirthDate?: string;
    RegistrationDate?: string;
    DaytimeAreaCode?: string;
    DaytimePhoneNumber?: string;
    DaytimePhoneExtension?: string;
    EmailAddress?: string;

    // Allow dynamic columns like election dates: "11/05/2024", etc.
    [key: string]: any;
};

type ColumnDef = {
    key: string;
    label: string;
    width: number;
    visible: boolean;
};

type PartyFilter = 'DEM' | 'REP' | 'OTHER';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FloridaVotersScreen: React.FC = () => {
    const route = useRoute<RouteProp<FloridaVotersRouteParams, 'floridaVoters'>>();
    const { title } = route.params;

    // Column definitions
    const [columns, setColumns] = useState<ColumnDef[]>([
        { key: 'VoterId', label: 'Voter ID', width: 100, visible: true },
        { key: 'NameLast', label: 'Last Name', width: 120, visible: true },
        { key: 'NameFirst', label: 'First Name', width: 120, visible: true },
        { key: 'NameMiddle', label: 'Middle Name', width: 100, visible: false },
        { key: 'ResidenceCity', label: 'City', width: 120, visible: true },
        { key: 'ResidenceAddressLine1', label: 'Address', width: 180, visible: false },
        { key: 'ResidenceZipcode', label: 'Zip Code', width: 100, visible: false },
        { key: 'PartyAffiliation', label: 'Party', width: 100, visible: true },
        { key: 'VoterStatus', label: 'Status', width: 100, visible: true },
        { key: 'Gender', label: 'Gender', width: 80, visible: false },
        { key: 'Race', label: 'Race', width: 100, visible: false },
        { key: 'BirthDate', label: 'Birth Date', width: 120, visible: false },
        { key: 'RegistrationDate', label: 'Reg Date', width: 120, visible: false },
        { key: 'Precinct', label: 'Precinct', width: 100, visible: false },
        { key: 'CountyCommissionDistrict', label: 'County Dist', width: 100, visible: true },
        { key: 'SchoolBoardDistrict', label: 'School Dist', width: 100, visible: true },
        { key: 'EmailAddress', label: 'Email', width: 200, visible: false },
        { key: 'DaytimePhoneNumber', label: 'Phone', width: 120, visible: false },
    ]);

    const [cities, setCities] = useState<string[]>([]);
    const [countyDistricts, setCountyDistricts] = useState<string[]>([]);
    const [schoolDistricts, setSchoolDistricts] = useState<string[]>([]);
    const partyOptions: PartyFilter[] = ['DEM', 'REP', 'OTHER'];
    
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedCountyDistrict, setSelectedCountyDistrict] = useState<string>('');
    const [selectedSchoolDistrict, setSelectedSchoolDistrict] = useState<string>('');
    const [selectedParty, setSelectedParty] = useState<PartyFilter | ''>('');
    const [streetQuery, setStreetQuery] = useState<string>('');
    const [debouncedStreetQuery, setDebouncedStreetQuery] = useState<string>('');

    // Debounce street search so typing (including spaces) stays responsive even with large results.
    useEffect(() => {
        const id = setTimeout(() => setDebouncedStreetQuery(streetQuery), 400);
        return () => clearTimeout(id);
    }, [streetQuery]);
    
    const [voters, setVoters] = useState<VoterItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
    const [_error, setError] = useState<string | null>(null);
    
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showCountyDropdown, setShowCountyDropdown] = useState(false);
    const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
    const [showPartyDropdown, setShowPartyDropdown] = useState(false);
    const [showColumnModal, setShowColumnModal] = useState(false);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            setLoadingFilters(true);
            try {
                const [citiesData, countyData, schoolData] = await Promise.all([
                    getCities(),
                    getCountyCommissionDistricts(),
                    getSchoolBoardDistricts()
                ]);

                const cityList = citiesData
                    .map((item: any) => item.ResidenceCity)
                    .filter((city: string) => city && city.trim() !== '' && city !== '<select>')
                    .sort();
                
                const countyList = countyData
                    .map((item: any) => item.CountyCommissionDistrict || item.District || Object.values(item)[0])
                    .filter((district: any) => district !== null && district !== undefined && district.toString().trim() !== '' && district.toString() !== '<select>')
                    .map((d: any) => d.toString())
                    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
                    .sort();
                
                const schoolList = schoolData
                    .map((item: any) => item.SchoolBoardDistrict || item.District || Object.values(item)[0])
                    .filter((district: any) => district !== null && district !== undefined && district.toString().trim() !== '' && district.toString() !== '<select>')
                    .map((d: any) => d.toString())
                    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
                    .sort();

                setCities(cityList);
                setCountyDistricts(countyList);
                setSchoolDistricts(schoolList);
            } catch (e: any) {
                console.error('Failed to fetch filter options:', e);
                setError('Failed to load filter options');
            } finally {
                setLoadingFilters(false);
            }
        };

        fetchFilterOptions();
    }, []);

    // Handler functions that clear other filters when one is selected
    const handleCitySelect = (city: string) => {
        setSelectedCity(city);
        setSelectedCountyDistrict('');
        setSelectedSchoolDistrict('');
    };

    const handleCountyDistrictSelect = (district: string) => {
        setSelectedCountyDistrict(district);
        setSelectedCity('');
        setSelectedSchoolDistrict('');
    };

    const handleSchoolDistrictSelect = (district: string) => {
        setSelectedSchoolDistrict(district);
        setSelectedCity('');
        setSelectedCountyDistrict('');
    };

    const handlePartySelect = (party: string) => {
        setSelectedParty((party as PartyFilter) || '');
    };

    useEffect(() => {
        const fetchVoters = async () => {
            // Only fetch if one filter is selected
            const streetTrimmed = debouncedStreetQuery.trim();
            const hasStreetFilter = streetTrimmed.length >= 2;
            const hasFilter = selectedCity || selectedCountyDistrict || selectedSchoolDistrict || selectedParty || hasStreetFilter;
            if (!hasFilter) {
                setVoters([]);
                setError(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const filteredVoters = await getFilteredVoters({
                    city: selectedCity || undefined,
                    countyCommissionDistrict: selectedCountyDistrict || undefined,
                    schoolBoardDistrict: selectedSchoolDistrict || undefined,
                    partyAffiliation: selectedParty || undefined,
                    street: hasStreetFilter ? streetTrimmed : undefined,
                });
                setVoters(filteredVoters);

                // Merge any extra keys (including election-date columns like "11/05/2024")
                // into the selectable columns list (hidden by default).
                if (Array.isArray(filteredVoters) && filteredVoters.length > 0) {
                    const firstRow = filteredVoters[0] as any;
                    const rowKeys = Object.keys(firstRow || {});
                    setColumns(prev => {
                        const existing = new Set(prev.map(c => c.key));
                        const extras = rowKeys
                            .filter(k => !existing.has(k))
                            .map((k): ColumnDef => ({
                                key: k,
                                label: k,
                                width: 110,
                                visible: false,
                            }));
                        return extras.length ? [...prev, ...extras] : prev;
                    });
                }

                // Clear error if we got results (even if empty array)
                if (Array.isArray(filteredVoters)) {
                    setError(null);
                }
            } catch (e: any) {
                console.error('Failed to fetch voters:', e);
                setError('Failed to load voters');
                setVoters([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVoters();
    }, [selectedCity, selectedCountyDistrict, selectedSchoolDistrict, selectedParty, debouncedStreetQuery]);

    const toggleColumnVisibility = (columnKey: string) => {
        setColumns(prev => prev.map(col => 
            col.key === columnKey ? { ...col, visible: !col.visible } : col
        ));
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        } catch {
            return dateString;
        }
    };

    const formatPhone = (areaCode?: string, phone?: string, extension?: string) => {
        if (!phone) return '';
        const area = areaCode ? `(${areaCode}) ` : '';
        const ext = extension ? ` ext ${extension}` : '';
        return `${area}${phone}${ext}`;
    };

    const getCellValue = (voter: VoterItem, columnKey: string): string => {
        const value = voter[columnKey];
        if (value === null || value === undefined) return '';
        
        if (columnKey === 'BirthDate' || columnKey === 'RegistrationDate') {
            return formatDate(value as string);
        }
        
        if (columnKey === 'DaytimePhoneNumber') {
            return formatPhone(voter.DaytimeAreaCode, voter.DaytimePhoneNumber, voter.DaytimePhoneExtension);
        }
        
        return String(value);
    };

    const escapeCSVValue = (value: string): string => {
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    const exportToCSV = async () => {
        if (voters.length === 0) {
            Alert.alert('No Data', 'There are no voters to export.');
            return;
        }

        try {
            // Create CSV header with only visible columns
            const headers = visibleColumns.map(col => escapeCSVValue(col.label));
            const csvRows = [headers.join(',')];

            // Add data rows with only visible columns
            voters.forEach(voter => {
                const row = visibleColumns.map(column => {
                    const value = getCellValue(voter, column.key);
                    return escapeCSVValue(value);
                });
                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join('\n');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filterName =
                [
                    selectedCity && `city_${selectedCity}`,
                    selectedCountyDistrict && `county_${selectedCountyDistrict}`,
                    selectedSchoolDistrict && `school_${selectedSchoolDistrict}`,
                    selectedParty && `party_${selectedParty}`,
                ]
                    .filter(Boolean)
                    .join('_') || 'all';
            const filename = `florida_voters_${filterName}_${timestamp}.csv`;

            // Share the CSV content
            const result = await Share.share({
                message: csvContent,
                title: filename,
            });

            if (result.action === Share.sharedAction) {
                Alert.alert('Success', 'CSV file exported successfully!');
            }
        } catch (error: any) {
            console.error('Error exporting CSV:', error);
            Alert.alert('Error', 'Failed to export CSV file. Please try again.');
        }
    };

    const visibleColumns = columns.filter(col => col.visible);
    const totalTableWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

    const renderDropdown = (
        visible: boolean,
        onClose: () => void,
        options: string[],
        onSelect: (value: string) => void,
        selectedValue: string,
        placeholder: string
    ) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.dropdownModal}>
                    <Text style={styles.dropdownTitle}>{placeholder}</Text>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            onSelect('');
                            onClose();
                        }}
                    >
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={options}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.dropdownItem,
                                    selectedValue === item && styles.dropdownItemSelected
                                ]}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.dropdownItemText,
                                    selectedValue === item && styles.dropdownItemTextSelected
                                ]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderColumnSelectionModal = () => (
        <Modal
            visible={showColumnModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowColumnModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowColumnModal(false)}
            >
                <View style={styles.columnModal}>
                    <Text style={styles.dropdownTitle}>Select Columns</Text>
                    <ScrollView style={styles.columnList}>
                        {columns.map((column) => (
                            <TouchableOpacity
                                key={column.key}
                                style={styles.columnItem}
                                onPress={() => toggleColumnVisibility(column.key)}
                            >
                                <View style={styles.checkboxContainer}>
                                    <View style={[
                                        styles.checkbox,
                                        column.visible && styles.checkboxChecked
                                    ]}>
                                        {column.visible && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.columnItemText}>{column.label}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowColumnModal(false)}
                    >
                        <Text style={styles.modalCloseButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderVoterRow = ({ item: voter, index }: { item: VoterItem; index: number }) => (
        <View
            style={[
                styles.tableRow,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd
            ]}
        >
            {visibleColumns.map((column) => (
                <Text 
                    key={column.key} 
                    style={[styles.cellText, { width: column.width }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {getCellValue(voter, column.key)}
                </Text>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={title} />

            {/* Filter Section */}
            <View style={styles.filterContainer}>
                <View style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>Filters</Text>
                    {voters.length > 0 && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.columnButton}
                                onPress={() => setShowColumnModal(true)}
                            >
                                <Text style={styles.columnButtonText}>Select Columns</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.exportButton}
                                onPress={exportToCSV}
                            >
                                <Text style={styles.exportButtonText}>Export CSV</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                
                {/* City Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCityDropdown(true)}
                    disabled={loadingFilters}
                >
                    <Text style={[styles.dropdownButtonText, !selectedCity && styles.placeholderText]}>
                        {selectedCity || 'Select City'}
                    </Text>
                    <svgs.chevronRight width={20} height={20} />
                </TouchableOpacity>

                {/* Party Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowPartyDropdown(true)}
                    disabled={loadingFilters}
                >
                    <Text style={[styles.dropdownButtonText, !selectedParty && styles.placeholderText]}>
                        {selectedParty || 'Select Party'}
                    </Text>
                    <svgs.chevronRight width={20} height={20} />
                </TouchableOpacity>

                {/* County Commission District Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCountyDropdown(true)}
                    disabled={loadingFilters}
                >
                    <Text style={[styles.dropdownButtonText, !selectedCountyDistrict && styles.placeholderText]}>
                        {selectedCountyDistrict || 'Select County Commission District'}
                    </Text>
                    <svgs.chevronRight width={20} height={20} />
                </TouchableOpacity>

                {/* School Board District Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowSchoolDropdown(true)}
                    disabled={loadingFilters}
                >
                    <Text style={[styles.dropdownButtonText, !selectedSchoolDistrict && styles.placeholderText]}>
                        {selectedSchoolDistrict || 'Select School Board District'}
                    </Text>
                    <svgs.chevronRight width={20} height={20} />
                </TouchableOpacity>

                {/* Party Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowPartyDropdown(true)}
                    disabled={loadingFilters}
                >
                    <Text style={[styles.dropdownButtonText, !selectedParty && styles.placeholderText]}>
                        {selectedParty || 'Select Party'}
                    </Text>
                    <svgs.chevronRight width={20} height={20} />
                </TouchableOpacity>

                {/* Street Search */}
                <TextInput
                    style={styles.textInput}
                    placeholder="Search street (address line 1 or 2)"
                    placeholderTextColor="#999"
                    value={streetQuery}
                    onChangeText={setStreetQuery}
                    editable={!loadingFilters}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
            </View>

            {/* Dropdown Modals */}
            {renderDropdown(showCityDropdown, () => setShowCityDropdown(false), cities, handleCitySelect, selectedCity, 'Select City')}
            {renderDropdown(showPartyDropdown, () => setShowPartyDropdown(false), partyOptions, handlePartySelect, selectedParty, 'Select Party')}
            {renderDropdown(showCountyDropdown, () => setShowCountyDropdown(false), countyDistricts, handleCountyDistrictSelect, selectedCountyDistrict, 'Select County Commission District')}
            {renderDropdown(showSchoolDropdown, () => setShowSchoolDropdown(false), schoolDistricts, handleSchoolDistrictSelect, selectedSchoolDistrict, 'Select School Board District')}
            {renderDropdown(showPartyDropdown, () => setShowPartyDropdown(false), partyOptions, handlePartySelect, selectedParty, 'Select Party')}
            {renderColumnSelectionModal()}

            {/* Loading State */}
            {loadingFilters && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={styles.loadingText}>Loading filters...</Text>
                </View>
            )}

            {/* Voters Table */}
            {!loadingFilters && (
                <View style={styles.tableContainer}>
                    {loading && voters.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.light.primary} />
                            <Text style={styles.loadingText}>Loading voters...</Text>
                        </View>
                    ) : (
                        <>
                            {voters.length > 0 ? (
                                <>
                                    <Text style={styles.resultCount}>Found {voters.length} voter(s)</Text>
                                    <View style={styles.tableWrapper}>
                                        <ScrollView 
                                            horizontal={true}
                                            showsHorizontalScrollIndicator={true}
                                            style={styles.horizontalScroll}
                                            nestedScrollEnabled={true}
                                        >
                                            <View style={{ width: Math.max(totalTableWidth + 20, SCREEN_WIDTH) }}>
                                                {/* Table Header */}
                                                <View style={styles.tableHeader}>
                                                    {visibleColumns.map((column) => (
                                                        <Text 
                                                            key={column.key}
                                                            style={[styles.headerText, { width: column.width, minWidth: column.width }]}
                                                            numberOfLines={2}
                                                            ellipsizeMode="tail"
                                                        >
                                                            {column.label}
                                                        </Text>
                                                    ))}
                                                </View>
                                                
                                                {/* Table Rows - Using FlatList for vertical scrolling */}
                                                <FlatList
                                                    data={voters}
                                                    renderItem={renderVoterRow}
                                                    keyExtractor={(item, index) => `${item.VoterId || index}-${index}`}
                                                    style={styles.tableRows}
                                                    scrollEnabled={true}
                                                    nestedScrollEnabled={true}
                                                />
                                            </View>
                                        </ScrollView>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        {selectedCity || selectedCountyDistrict || selectedSchoolDistrict
                                            ? 'No voters found matching the selected filters'
                                            : 'Select filters to view voters'}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        padding: 12,
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: `${Colors.light.primary}20`,
    },
    textInput: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: `${Colors.light.primary}40`,
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        color: Colors.light.text,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    filterTitle: {
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    columnButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    columnButtonText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'MyriadPro-Bold',
    },
    exportButton: {
        backgroundColor: Colors.light.secondary || '#28a745',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    exportButtonText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'MyriadPro-Bold',
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: `${Colors.light.primary}40`,
    },
    dropdownButtonText: {
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        color: Colors.light.text,
        flex: 1,
    },
    placeholderText: {
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '80%',
        maxHeight: '70%',
        padding: 16,
    },
    columnModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '85%',
        maxHeight: '80%',
        padding: 16,
    },
    dropdownTitle: {
        fontSize: 18,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
        marginBottom: 12,
    },
    clearButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    clearButtonText: {
        color: Colors.light.primary,
        fontFamily: 'MyriadPro-Bold',
        fontSize: 14,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemSelected: {
        backgroundColor: `${Colors.light.primary}20`,
    },
    dropdownItemText: {
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        color: Colors.light.text,
    },
    dropdownItemTextSelected: {
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
    },
    columnList: {
        maxHeight: 400,
    },
    columnItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: Colors.light.primary,
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'MyriadPro-Bold',
    },
    columnItemText: {
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        color: Colors.light.text,
    },
    modalCloseButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
    },
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
    resultCount: {
        padding: 12,
        fontSize: 14,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
        backgroundColor: Colors.light.background,
    },
    tableContainer: {
        flex: 1,
    },
    tableWrapper: {
        flex: 1,
    },
    horizontalScroll: {
        flex: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginHorizontal: 10,
        marginTop: 8,
        flexWrap: 'nowrap',
    },
    headerText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 11,
        fontFamily: 'MyriadPro-Bold',
        textAlign: 'center',
        flexShrink: 0,
    },
    tableRows: {
        flex: 1,
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
        fontSize: 11,
    },
    rowEven: {
        backgroundColor: `${Colors.light.primary}14`,
    },
    rowOdd: {
        backgroundColor: Colors.light.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        textAlign: 'center',
    },
});

export default FloridaVotersScreen;
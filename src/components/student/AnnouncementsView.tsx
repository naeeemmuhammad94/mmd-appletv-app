import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface Announcement {
    id: string;
    title: string;
    date: string;
    description: string;
}

const ANNOUNCEMENTS_DATA: Announcement[] = [
    {
        id: '1',
        title: 'New Training Videos Available',
        date: 'May 3',
        description: 'New karate and sparring videos have been added to the curriculum.',
    },
    {
        id: '2',
        title: 'Summer Training Camp',
        date: 'June 1',
        description: 'Registration is now open for our intensive summer training camp.',
    },
];

interface AnnouncementsViewProps {
    ListHeaderComponent?: React.ReactElement;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ ListHeaderComponent }) => {
    const { theme } = useTheme();

    const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);

    const handleBackPress = () => {
        setSelectedAnnouncement(null);
    };

    const renderDetailView = () => {
        if (!selectedAnnouncement) return null;

        return (
            <View style={styles.detailContainer}>
                {ListHeaderComponent}

                <Text style={styles.header}>Announcements</Text>

                <View style={styles.detailContent}>
                    {/* Title Section */}
                    <Text style={styles.label}>Announcement Title</Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{selectedAnnouncement.title}</Text>
                    </View>

                    {/* Message Section */}
                    <Text style={styles.label}>Message</Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{selectedAnnouncement.description}</Text>
                    </View>

                    {/* Date Section */}
                    <Text style={styles.label}>Date</Text>
                    <View style={[styles.valueContainer, styles.dateContainer]}>
                        <Text style={styles.valueText}>{selectedAnnouncement.date}</Text>
                    </View>
                </View>

                {/* Back Hint or Button could go here, but remote 'Menu' usually handles it or just navigating away */}
                {/* Adding a visual close/back button is good UX for TV if standard back isn't wired */}
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Announcement }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedAnnouncement(item)}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </TouchableOpacity>
        );
    };

    if (selectedAnnouncement) {
        return renderDetailView();
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={ANNOUNCEMENTS_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        {ListHeaderComponent}
                        <Text style={styles.header}>Announcements</Text>
                    </>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    detailContainer: {
        flex: 1,
    },
    detailContent: {
        paddingHorizontal: rs(60),
    },
    header: {
        color: 'white',
        fontSize: rs(32),
        marginBottom: rs(40),
        fontWeight: '600',
        textAlign: 'center',
        marginTop: rs(20),
    },
    listContent: {
        paddingBottom: rs(40),
    },
    card: {
        backgroundColor: 'rgba(20, 20, 20, 0.6)', // Dark glass
        borderRadius: rs(12),
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)', // Blue-ish border
        padding: rs(30),
        marginBottom: rs(20),
        marginHorizontal: rs(60),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rs(10),
    },
    title: {
        color: 'white',
        fontSize: rs(24),
        fontWeight: 'bold',
    },
    date: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: rs(18),
    },
    description: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: rs(20),
    },
    // Detail View Styles
    label: {
        color: 'white',
        fontSize: rs(28),
        marginBottom: rs(16),
        fontWeight: '500',
    },
    valueContainer: {
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        borderRadius: rs(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: rs(20),
        marginBottom: rs(40),
        width: '100%',
    },
    dateContainer: {
        width: rs(300), // Smaller width for date as per usual design patterns
    },
    valueText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: rs(22),
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
        marginLeft: rs(60),
        paddingVertical: rs(10),
        paddingHorizontal: rs(30),
        borderRadius: rs(8),
        marginTop: rs(20),
    },
    backButtonText: {
        color: 'white',
        fontSize: rs(20),
    },
});

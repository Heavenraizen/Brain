import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { authUser } = useAuth();

  // Local state for displayName & photoURL
  const [displayName, setDisplayName] = useState(
    authUser?.displayName || 'Guest'
  );
  const [photoURL, setPhotoURL] = useState(authUser?.photoURL || '');

  // Sync from context every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      setDisplayName(authUser?.displayName || 'Guest');
      setPhotoURL(authUser?.photoURL || '');
    }, [authUser])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={
              photoURL ? { uri: photoURL } : require('@/assets/images/profile.webp')
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.username}>{displayName}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Task Highlight */}
      <View style={styles.highlightCard}>
        <Text style={styles.highlightText}>
          Your today’s task is almost done!
        </Text>
        <TouchableOpacity style={styles.viewTaskButton}>
          <Text style={styles.viewTaskText}>View Task</Text>
        </TouchableOpacity>
      </View>

      {/* In Progress */}
      <Text style={styles.sectionTitle}>
        In <Text style={styles.bold}>Progress</Text>{' '}
        <Text style={styles.count}>4</Text>
      </Text>
      <View style={styles.projectRow}>
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>Office Project</Text>
          <View style={styles.progressBar} />
        </View>
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>Personal Project</Text>
          <View style={styles.progressBar} />
        </View>
      </View>

      {/* Task Groups */}
      <Text style={styles.sectionTitle}>
        Task Groups <Text style={styles.count}>6</Text>
      </Text>
      <View style={styles.group}>
        <FontAwesome5 name="briefcase" size={24} color="#6A5ACD" />
        <View style={styles.groupInfo}>
          <Text style={styles.groupTitle}>Office Project</Text>
          <Text style={styles.groupSub}>23 assigned task</Text>
        </View>
      </View>
      <View style={styles.group}>
        <MaterialCommunityIcons name="notebook" size={24} color="#6A5ACD" />
        <View style={styles.groupInfo}>
          <Text style={styles.groupTitle}>Personal Project</Text>
          <Text style={styles.groupSub}>30 assigned task</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C0F',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  greeting: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: '#FFF',
    fontSize: 14,
  },
  username: {
    fontFamily: 'PlusJakartaSans_Bold',
    color: '#FFF',
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  highlightCard: {
    backgroundColor: '#6A5ACD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  highlightText: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  viewTaskButton: {
    backgroundColor: '#EDEDED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewTaskText: {
    fontFamily: 'PlusJakartaSans_Bold',
    color: '#000',
    fontWeight: '600',
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
  },
  bold: {
    fontFamily: 'PlusJakartaSans_Bold',
  },
  count: {
    color: '#6A5ACD',
    fontFamily: 'PlusJakartaSans_Bold',
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '48%',
    padding: 16,
    justifyContent: 'space-between',
  },
  projectTitle: {
    fontFamily: 'PlusJakartaSans_Bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'red',
    borderRadius: 2,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  groupInfo: {
    marginLeft: 12,
  },
  groupTitle: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans_Bold',
  },
  groupSub: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: '#999',
    fontSize: 12,
  },
});

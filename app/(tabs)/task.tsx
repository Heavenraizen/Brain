import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const assignments = [
  { id: '1', title: 'Mobile Computing Assignment 1.1' },
  { id: '2', title: 'Advance Database System Laboratory 3.1' },
  { id: '3', title: 'Computer Programming 1 Project Proposal' },
  { id: '4', title: 'Application Development Activity 1.1' },
  { id: '5', title: 'Mobile Computing Final Project' },
  { id: '6', title: 'System and Design Chapter 1' },
];

const AssignmentsScreen = () => {
  const renderItem = ({ item }: { item: typeof assignments[0] }) => (
    <View style={styles.card}>
      <Icon name="notifications-outline" size={20} color="white" style={styles.iconLeft} />
      <Text style={styles.title}>{item.title}</Text>
      <TouchableOpacity style={styles.iconRight}>
        <Icon name="ellipsis-vertical" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconShare}>
        <Icon name="share-social-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.createButton}>
          <Icon name="add" size={20} color="blue" />
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 30,
  },
  createText: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: 'white',
    fontSize: 16,
    marginLeft: 6,
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#6A5ACD',
    borderRadius: 10,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    padding: 30,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: 'white',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  iconShare: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});

export default AssignmentsScreen;

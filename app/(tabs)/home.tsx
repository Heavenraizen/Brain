import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

type Assignment = {
  id: string;
  title: string;
  reminderDate?: { seconds: number; nanoseconds: number };
};

export default function HomeScreen() {
  const { authUser } = useAuth();

  // Local state for user data
  const [displayName, setDisplayName] = useState(authUser?.displayName || 'Guest');
  const [photoURL, setPhotoURL] = useState(authUser?.photoURL || '');

  // State for notifications and calendar
  const [dueTasks, setDueTasks] = useState<Assignment[]>([]);
  const [todayTasks, setTodayTasks] = useState<Assignment[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTodayTasksModalVisible, setIsTodayTasksModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({});
  const [selectedDateTasks, setSelectedDateTasks] = useState<Assignment[]>([]);
  const [selectedDateDetailsModal, setSelectedDateDetailsModal] = useState(false);
  const [groupedTasks, setGroupedTasks] = useState<{ [date: string]: Assignment[] }>({});
  const [notificationSeen, setNotificationSeen] = useState(false);
  const todayString = new Date().toISOString().split('T')[0];

  // Fetch assignments with reminders from Firestore
  useEffect(() => {
    if (!authUser) return;

    const assignmentsRef = collection(FIRESTORE_DB, 'assignments');
    const q = query(assignmentsRef, where('collaborators', 'array-contains', authUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksWithReminder = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          title: docData.title || 'Untitled Task',
          reminderDate: docData.reminderDate?.seconds
            ? { 
                seconds: docData.reminderDate.seconds, 
                nanoseconds: docData.reminderDate.nanoseconds 
              } 
            : undefined,
        };
      }) as Assignment[];

      // Filter tasks with reminders
      const filteredTasks = tasksWithReminder.filter((task) => task.reminderDate);
      setDueTasks(filteredTasks);
      if (filteredTasks.length > 0) setNotificationSeen(false);

      // Find tasks due today
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const tasksDueToday = filteredTasks.filter((task) => {
        if (!task.reminderDate) return false;
        const taskDate = new Date(task.reminderDate.seconds * 1000);
        return taskDate >= todayStart && taskDate <= todayEnd;
      });
      setTodayTasks(tasksDueToday);

      // Group tasks by date (fix timezone bug)
      const grouped = filteredTasks.reduce((acc, task) => {
        if (task.reminderDate) {
          const date = new Date(task.reminderDate.seconds * 1000);
          const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          if (!acc[dateString]) acc[dateString] = [];
          acc[dateString].push(task);
        }
        return acc;
      }, {} as { [date: string]: Assignment[] });

      setGroupedTasks(grouped);

      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const markedDatesObj = Object.entries(grouped).reduce((acc, [dateString, tasks]) => {
        const dateObj = new Date(dateString);
        let selectedColor = '#6A5ACD'; // Default: purple for upcoming

        if (dateString === todayString) {
          selectedColor = '#FFD600'; // Yellow for today
        } else if (dateObj < today) {
          selectedColor = '#B71C1C'; // Red for overdue
        }

        acc[dateString] = {
          marked: true,
          dots: tasks.map(task => ({
            key: task.id,
            color: selectedColor,
          })),
          selected: true,
          selectedColor,
        };
        return acc;
      }, {} as {[date: string]: any});

      setMarkedDates(markedDatesObj);
    });

    return unsubscribe;
  }, [authUser]);

  // Day press handler for calendar
  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString; // Already in 'YYYY-MM-DD' format

    // Find tasks for the selected date
    const tasksOnDate = groupedTasks[dateString] || [];
    setSelectedDateTasks(tasksOnDate);
    setSelectedDateDetailsModal(true);

    // No need to change markedDates, keep all outlined
  };

  // Sync context data when screen gains focus
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
        {/* Notification Button */}
        <TouchableOpacity onPress={() => {
          setIsModalVisible(true);
          setNotificationSeen(true); // Mark as seen when opening modal
        }}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          {dueTasks.length > 0 && !notificationSeen && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      {/* Task Highlight */}
      <View style={styles.highlightCard}>
        <Text style={styles.highlightText}>
          {todayTasks.length > 0 
            ? `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today!` 
            : 'No tasks due today'}
        </Text>
        {todayTasks.length > 0 && (
          <TouchableOpacity 
            style={styles.viewTaskButton}
            onPress={() => setIsTodayTasksModalVisible(true)}
          >
            <Text style={styles.viewTaskText}>View Task</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Interactive Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            backgroundColor: '#0D0C0F',
            calendarBackground: '#0D0C0F',
            textSectionTitleColor: '#FFF',
            textSectionTitleDisabledColor: '#666',
            selectedDayBackgroundColor: '#6A5ACD',
            selectedDayTextColor: '#FFF',
            todayTextColor: 'red',
            dayTextColor: '#FFF',
            textDisabledColor: '#444',
            dotColor: '#6A5ACD',
            selectedDotColor: '#FFF',
            arrowColor: '#6A5ACD',
          }}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          markingType={'multi-dot'}
          dayComponent={({
            date,
            state,
          }: {
            date: { dateString: string; day: number };
            state: string;
          }) => {
            const dateString = date.dateString;
            const taskCount = groupedTasks[dateString]?.length || 0;
            const bgColor = markedDates[dateString]?.selectedColor || 'transparent';

            return (
              <TouchableOpacity
                onPress={() => handleDayPress({ dateString } as DateData)}
                disabled={state === 'disabled'}
                style={{ alignItems: 'center' }}
              >
                <Text style={{
                  color: state === 'disabled' ? '#444' : '#FFF',
                  fontWeight: dateString === todayString ? 'bold' : 'normal',
                  backgroundColor: bgColor,
                  borderRadius: 16,
                  padding: 4,
                  minWidth: 32,
                  textAlign: 'center'
                }}>
                  {date.day}
                </Text>
                {taskCount > 0 && (
                  <View style={{
                    backgroundColor: bgColor,
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    marginTop: 2,
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 10 }}>{taskCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Tasks Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Upcoming Tasks</Text>

          {dueTasks.length > 0 ? (
            <FlatList
              data={dueTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDate}>
                    Due: {new Date(item.reminderDate!.seconds * 1000).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noTasks}>No upcoming tasks</Text>
          )}

          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Today's Tasks Modal */}
      <Modal 
        visible={isTodayTasksModalVisible} 
        transparent 
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Today's Tasks</Text>

          {todayTasks.length > 0 ? (
            <FlatList
              data={todayTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDate}>
                    Due: {new Date(item.reminderDate!.seconds * 1000).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noTasks}>No tasks due today</Text>
          )}

          <TouchableOpacity 
            onPress={() => setIsTodayTasksModalVisible(false)} 
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Selected Date Tasks Modal */}
      <Modal 
        visible={selectedDateDetailsModal} 
        transparent 
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Tasks on Selected Date</Text>

          {selectedDateTasks.length > 0 ? (
            <FlatList
              data={selectedDateTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDate}>
                    Due: {new Date(item.reminderDate!.seconds * 1000).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noTasks}>No tasks on this date</Text>
          )}

          <TouchableOpacity 
            onPress={() => {
              setSelectedDateDetailsModal(false);
              // Reset marked dates to original state
              const resetMarkedDates = { ...markedDates };
              Object.keys(resetMarkedDates).forEach(key => {
                const isTaskDue = new Date(key) <= new Date();
                resetMarkedDates[key] = { 
                  ...resetMarkedDates[key], 
                  selected: false,
                  dotColor: isTaskDue ? 'red' : '#6A5ACD',
                  textColor: isTaskDue ? 'red' : undefined
                };
              });
              setMarkedDates(resetMarkedDates);
            }} 
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  calendarContainer: {
    backgroundColor: '#0D0C0F',
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContainer: {
    backgroundColor: '#1A1A1F',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: '80%',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_Bold',
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  taskTitle: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'PlusJakartaSans_Bold',
  },
  taskDate: {
    color: '#EDEDED',
    fontSize: 14,
  },
  noTasks: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#EDEDED',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
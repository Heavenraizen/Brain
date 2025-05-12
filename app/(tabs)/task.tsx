// task.tsx (Firebase-integrated version)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Share,
  Dimensions,
  Platform,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

type Assignment = {
  id: string;
  title: string;
  content: string;
  textAlign?: 'left' | 'center' | 'right';
  textFormat?: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  reminderDate?: Date | null;
};

const AssignmentsScreen = () => {
  const { authUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [counter, setCounter] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [detailViewVisible, setDetailViewVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [assignmentContent, setAssignmentContent] = useState('');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [reminderDate, setReminderDate] = useState(new Date());
  
  // Temporary input states for date/time entries
  const [monthInput, setMonthInput] = useState('');
  const [dayInput, setDayInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [hourInput, setHourInput] = useState('');
  const [minuteInput, setMinuteInput] = useState('');
  
  // Actual date values
  const [month, setMonth] = useState(reminderDate.getMonth() + 1);
  const [day, setDay] = useState(reminderDate.getDate());
  const [year, setYear] = useState(reminderDate.getFullYear());
  const [hour, setHour] = useState(reminderDate.getHours());
  const [minute, setMinute] = useState(reminderDate.getMinutes());
  
  // Get screen dimensions
  const windowWidth = Dimensions.get('window').width;

  const people = [
    {
      id: '1',
      name: 'Rhovic Delas Armas',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: '2',
      name: 'Stephen De Vera',
      avatarUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
      id: '3',
      name: 'Marcelo Miguel',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      id: '4',
      name: 'Add People',
      avatarUrl: 'https://img.icons8.com/ios-filled/50/add-user-group-man-man.png',
    },
  ];

  // Initialize input fields when modal opens
   useEffect(() => {
    if (!authUser) return;
    const userAssignmentsRef = collection(FIRESTORE_DB, 'users', authUser.uid, 'assignments');
    const unsubscribe = onSnapshot(userAssignmentsRef, (snapshot) => {
      const data: Assignment[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Assignment[];
      setAssignments(data);
    });
    return unsubscribe;
  }, [authUser]);

  const handleCreate = async () => {
    if (!authUser) return;
    const id = Date.now().toString();
    const newAssignment: Assignment = {
      id,
      title: `New Assignment ${counter}`,
      content: '',
      textAlign: 'left',
      textFormat: { bold: false, italic: false, underline: false },
      reminderDate: null,
    };
    await setDoc(doc(FIRESTORE_DB, 'users', authUser.uid, 'assignments', id), newAssignment);
    setCounter(counter + 1);
  };

  const handleDelete = async () => {
    if (authUser && selectedAssignment) {
      await deleteDoc(doc(FIRESTORE_DB, 'users', authUser.uid, 'assignments', selectedAssignment.id));
      setSelectedAssignment(null);
      setModalVisible(false);
    }
  };

  const handleEdit = () => {
    if (selectedAssignment) {
      setEditedTitle(selectedAssignment.title);
      setModalVisible(false);
      setEditModalVisible(true);
    }
  };

  const handleSetReminder = () => {
    if (selectedAssignment) {
      const currentDate = selectedAssignment.reminderDate || new Date();
      setReminderDate(currentDate);
      
      // Set actual date values
      setMonth(currentDate.getMonth() + 1);
      setDay(currentDate.getDate());
      setYear(currentDate.getFullYear());
      setHour(currentDate.getHours());
      setMinute(currentDate.getMinutes());
      
      // Set input field values
      setMonthInput((currentDate.getMonth() + 1).toString());
      setDayInput(currentDate.getDate().toString());
      setYearInput(currentDate.getFullYear().toString());
      setHourInput(currentDate.getHours().toString().padStart(2, '0'));
      setMinuteInput(currentDate.getMinutes().toString().padStart(2, '0'));
      
      setModalVisible(false);
      setReminderModalVisible(true);
    }
  };

  const saveEditedTitle = async () => {
    if (authUser && selectedAssignment) {
      await updateDoc(doc(FIRESTORE_DB, 'users', authUser.uid, 'assignments', selectedAssignment.id), {
        title: editedTitle,
      });
      setEditModalVisible(false);
      setSelectedAssignment(null);
    }
  };

  const openDetailView = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setAssignmentContent(assignment.content || '');
    setTextAlignment(assignment.textAlign || 'left');
    setTextFormat(assignment.textFormat || { bold: false, italic: false, underline: false });
    setDetailViewVisible(true);
  };

 const saveDetailContent = async () => {
    if (authUser && currentAssignment) {
      await updateDoc(doc(FIRESTORE_DB, 'users', authUser.uid, 'assignments', currentAssignment.id), {
        content: assignmentContent,
        textAlign: textAlignment,
        textFormat: textFormat,
      });
    }
  };
  
  const handleShareAssignment = async () => {
    if (currentAssignment) {
      try {
        const result = await Share.share({
          title: currentAssignment.title,
          message: `${currentAssignment.title}\n\n${assignmentContent}`,
        });
        
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log(`Shared with activity type: ${result.activityType}`);
          } else {
            console.log('Shared successfully');
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    setTextFormat(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  // Updates the date state from input fields
  const updateReminderDate = () => {
    // Process month
    let newMonth = parseInt(monthInput);
    if (isNaN(newMonth) || newMonth < 1) newMonth = 1;
    if (newMonth > 12) newMonth = 12;
    
    // Process day
    let newDay = parseInt(dayInput);
    if (isNaN(newDay) || newDay < 1) newDay = 1;
    if (newDay > 31) newDay = 31;
    
    // Process year
    let newYear = parseInt(yearInput);
    const currentYear = new Date().getFullYear();
    if (isNaN(newYear) || newYear < currentYear) newYear = currentYear;
    
    // Process hour
    let newHour = parseInt(hourInput);
    if (isNaN(newHour) || newHour < 0) newHour = 0;
    if (newHour > 23) newHour = 23;
    
    // Process minute
    let newMinute = parseInt(minuteInput);
    if (isNaN(newMinute) || newMinute < 0) newMinute = 0;
    if (newMinute > 59) newMinute = 59;
    
    // Update the actual state values
    setMonth(newMonth);
    setDay(newDay);
    setYear(newYear);
    setHour(newHour);
    setMinute(newMinute);
    
    // Update input fields with sanitized values
    setMonthInput(newMonth.toString());
    setDayInput(newDay.toString());
    setYearInput(newYear.toString());
    setHourInput(newHour.toString().padStart(2, '0'));
    setMinuteInput(newMinute.toString().padStart(2, '0'));
    
    // Create and set new date
    const newDate = new Date(newYear, newMonth - 1, newDay, newHour, newMinute);
    setReminderDate(newDate);
  };

 const saveReminder = async () => {
    updateReminderDate();
    if (authUser && selectedAssignment) {
      await updateDoc(doc(FIRESTORE_DB, 'users', authUser.uid, 'assignments', selectedAssignment.id), {
        reminderDate: reminderDate,
      });
      setReminderModalVisible(false);
      setSelectedAssignment(null);
    }
  };

 const clearReminder = async () => {
    if (authUser && selectedAssignment) {
      await updateDoc(doc(FIRESTORE_DB, 'users', authUser.uid, 'assignments', selectedAssignment.id), {
        reminderDate: null,
      });
      setReminderModalVisible(false);
      setSelectedAssignment(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => openDetailView(item)}
    >
      <Icon name="notifications-outline" size={20} color="white" style={styles.iconLeft} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        {item.reminderDate && (
          <View style={styles.reminderTag}>
            <Icon name="alarm-outline" size={12} color="#6A5ACD" />
            <Text style={styles.reminderText}>
              {formatDate(item.reminderDate)}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.iconRight}
        onPress={(e) => {
          e.stopPropagation();
          setSelectedAssignment(item);
          setModalVisible(true);
        }}
      >
        <Icon name="ellipsis-vertical" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconShare}
        onPress={(e) => {
          e.stopPropagation();
          setSelectedAssignment(item);
          setShareModalVisible(true);
        }}
      >
        <Icon name="share-social-outline" size={20} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDetailView = () => {
    if (!currentAssignment) return null;

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              saveDetailContent();
              setDetailViewVisible(false);
            }}
          >
            <Icon name="arrow-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              setSelectedAssignment(currentAssignment);
              setModalVisible(true);
            }}
          >
            <Icon name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          <Text style={styles.detailTitle}>{currentAssignment.title}</Text>
          
          {currentAssignment.reminderDate && (
            <View style={styles.reminderBanner}>
              <Icon name="alarm-outline" size={18} color="#6A5ACD" />
              <Text style={styles.reminderBannerText}>
                Reminder set for {formatDate(currentAssignment.reminderDate)}
              </Text>
            </View>
          )}
          
          {/* Text Format Toolbar - MODIFIED: Added Bold, Italic, Underline */}
          <View style={styles.textFormatToolbar}>
            {/* Text Alignment Options */}
            <View style={styles.formatSection}>
              <TouchableOpacity 
                style={[
                  styles.formatButton, 
                  textAlignment === 'left' && styles.activeFormatButton
                ]}
                onPress={() => setTextAlignment('left')}
              >
                <Icon name="reorder-three-outline" size={18} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.formatButton, 
                  textAlignment === 'center' && styles.activeFormatButton
                ]}
                onPress={() => setTextAlignment('center')}
              >
                <Icon name="reorder-three-outline" size={18} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.formatButton, 
                  textAlignment === 'right' && styles.activeFormatButton
                ]}
                onPress={() => setTextAlignment('right')}
              >
                <Icon name="reorder-three-outline" size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Text Formatting Options */}
            <View style={styles.formatSection}>
              <TouchableOpacity 
                style={[
                  styles.formatButton, 
                  textFormat.bold && styles.activeFormatButton
                ]}
                onPress={() => toggleTextFormat('bold')}
              >
                <Text style={styles.formatButtonText}>B</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.formatButton, 
                  textFormat.italic && styles.activeFormatButton
                ]}
                onPress={() => toggleTextFormat('italic')}
              >
                <Text style={styles.formatButtonTextItalic}>I</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.formatButton, 
                  textFormat.underline && styles.activeFormatButton
                ]}
                onPress={() => toggleTextFormat('underline')}
              >
                <Text style={styles.formatButtonTextUnderline}>U</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Content edit section - Now with textAlign and formatting applied */}
          <View style={styles.contentEditSection}>
            <TextInput
              style={[
                styles.contentInput, 
                { 
                  textAlign: textAlignment,
                  fontWeight: textFormat.bold ? 'bold' : 'normal',
                  fontStyle: textFormat.italic ? 'italic' : 'normal',
                  textDecorationLine: textFormat.underline ? 'underline' : 'none',
                }
              ]}
              value={assignmentContent}
              onChangeText={setAssignmentContent}
              placeholder="Enter assignment content here..."
              placeholderTextColor="#aaa"
              multiline={true}
              numberOfLines={10}
            />
            
            {/* Floating Share Button */}
            <TouchableOpacity 
              style={styles.floatingShareButton}
              onPress={handleShareAssignment}
            >
              <Icon name="share-social-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {!detailViewVisible ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Icon name="add" size={20} color="blue" />
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={assignments}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>
                No assignments yet. Tap "Create" to add one.
              </Text>
            }
          />
        </>
      ) : (
        renderDetailView()
      )}

      {/* Modal with Options */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
              <Text style={styles.modalText}>Edit Title</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleSetReminder}>
              <Text style={styles.modalText}>
                {selectedAssignment?.reminderDate ? 'Change Reminder' : 'Set Date Reminder'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
              <Text style={[styles.modalText, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Modal */}
      <Modal
        transparent={true}
        visible={editModalVisible}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalBackground} onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Edit assignment title"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.modalOption} onPress={saveEditedTitle}>
              <Text style={styles.modalText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        transparent={true}
        visible={reminderModalVisible}
        animationType="fade"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <Pressable style={styles.modalBackground} onPress={() => setReminderModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.reminderTitle}>Set Date Reminder</Text>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputLabel}>Date:</Text>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputField}>
                  <Text style={styles.dateInputFieldLabel}>Month</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={monthInput}
                    onChangeText={setMonthInput}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <Text style={styles.dateInputSeparator}>/</Text>
                <View style={styles.dateInputField}>
                  <Text style={styles.dateInputFieldLabel}>Day</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={dayInput}
                    onChangeText={setDayInput}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <Text style={styles.dateInputSeparator}>/</Text>
                <View style={styles.dateInputField}>
                  <Text style={styles.dateInputFieldLabel}>Year</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={yearInput}
                    onChangeText={setYearInput}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputLabel}>Time:</Text>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputField}>
                  <Text style={styles.dateInputFieldLabel}>Hour</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={hourInput}
                    onChangeText={setHourInput}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <Text style={styles.dateInputSeparator}>:</Text>
                <View style={styles.dateInputField}>
                  <Text style={styles.dateInputFieldLabel}>Minute</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={minuteInput}
                    onChangeText={setMinuteInput}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.updateDateButton}
              onPress={updateReminderDate}
            >
              <Text style={styles.updateDateButtonText}>Update Date & Time</Text>
            </TouchableOpacity>
            
            <View style={styles.currentDateContainer}>
              <Icon name="calendar-outline" size={20} color="white" style={styles.dateIcon} />
              <Text style={styles.dateText}>
                {formatDate(reminderDate)}
              </Text>
            </View>

            <View style={styles.reminderButtonRow}>
              <TouchableOpacity 
                style={[styles.reminderButton, styles.saveButton]} 
                onPress={saveReminder}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              
              {selectedAssignment?.reminderDate && (
                <TouchableOpacity 
                  style={[styles.reminderButton, styles.clearButton]} 
                  onPress={clearReminder}
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Share Modal */}
      <Modal
        transparent={true}
        visible={shareModalVisible}
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <Pressable style={styles.modalBackground} onPress={() => setShareModalVisible(false)}>
          <View style={styles.shareCard}>
            <Text style={styles.shareTitle}>Share Assignment</Text>

            {people.map((person) => (
              <View key={person.id} style={styles.personRow}>
                <Image source={{ uri: person.avatarUrl }} style={styles.avatar} />
                <Text style={styles.personName}>{person.name}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.copyButton}>
              <Icon name="copy-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 16,
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
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 16,
  },
  cardContent: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    color: 'white',
    fontSize: 14,
  },
  reminderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  reminderText: {
    fontSize: 10,
    color: '#333',
    marginLeft: 2,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
    width: 280,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  reminderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  dateInputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputField: {
    alignItems: 'center',
  },
  dateInputFieldLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
  },
  dateInputSeparator: {
    color: 'white',
    fontSize: 18,
    marginHorizontal: 5,
  },
  updateDateButton: {
    backgroundColor: '#6A5ACD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  updateDateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  currentDateContainer: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    color: 'white',
    fontSize: 14,
  },
  reminderButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    margin: 4,
  },
  saveButton: {
    backgroundColor: '#6A5ACD',
  },
  clearButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  shareCard: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
    width: 280,
    minHeight: 200,
    position: 'relative',
  },
  shareTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  personName: {
    color: 'white',
    fontSize: 16,
  },
  copyButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 30,
  },
  
  // Detail view styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  moreButton: {
    padding: 8,
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  detailTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 90, 205, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6A5ACD',
    justifyContent: 'center',
  },
  reminderBannerText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  textFormatToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
  },
  formatSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    width: 36,
    height: 36,
  },
  activeFormatButton: {
    backgroundColor: '#555',
  },
  formatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formatButtonTextItalic: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: 16,
  },
  formatButtonTextUnderline: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  contentEditSection: {
    marginBottom: 20,
    flex: 1,
    position: 'relative',
    minHeight: 600,
  },
  contentInput: {
    backgroundColor: '#222',
    color: 'white',
    borderRadius: 8,
    padding: 16,
    minHeight: 550,
    textAlignVertical: 'top',
    flex: 1,
  },
  floatingShareButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6A5ACD',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export default AssignmentsScreen;
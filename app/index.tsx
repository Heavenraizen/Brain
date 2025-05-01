import { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // import your AuthContext

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    title: 'Welcome to \nBrainstorming',
    description: "Organize, track, and collaborate on tasks with ease. Brainstorming helps you stay on top of your projects, whether you're working solo or with a team.",
    image: require('@/assets/images/brainstorming.png'),
  },
  {
    title: 'Collaborate in Real-time',
    description: 'Your tasks update instantly across all your devices. Work on your phone, tablet, or computer without missing a beat.',
    image: require('@/assets/images/real-time.png'),
  },
  {
    title: 'Boost Your Productivity',
    description: 'Share tasks, assign responsibilities, and track progress together. Get things done faster with seamless team collaboration.',
    image: require('@/assets/images/teamwork.png'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { authUser, authLoading } = useAuth(); 

  useEffect(() => {
    if (!authUser) {
      console.log('User is NOT logged in');
    } else {
      console.log('User IS logged in:', authUser);
    }
  }, [authUser]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    // If user is authenticated, skip the onboarding screen
    if (authUser) {
      router.replace('/home'); // Redirect to home if logged in
    }
  }, [authUser]); // Trigger on user login state change

  // Show loading spinner while checking the auth state
  if (authLoading) {
    return <View><Text>Loading...</Text></View>; // Or show a spinner/loading animation
  }

  return (
    <View style={styles.body}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.container}>
            <Text style={styles.title}>{item.title}</Text>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.description}>{item.description}</Text>

            {/* Show button only on the last slide */}
            {index === onboardingData.length - 1 && !authUser && (
              <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
                <Text style={styles.buttonText}>Login →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    height: 200,
    width: 250,
    resizeMode: 'contain',
    marginBottom: 60,
    marginTop: 40,
  },
  title: {
    fontFamily: 'PlusJakartaSans_Bold',
    textAlign: 'center',
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontFamily: 'PlusJakartaSans_Regular',
    color: '#B3B3B3',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 16, 
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  inactiveDot: {
    backgroundColor: 'gray',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIRESTORE_DB} from '@/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';

export default function AuthScreen() {
  {/* States */}
  const [activeTab, setActiveTab] = useState('login');
  const [secureText, setSecureText] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  {/* Navigation */}
  const navigation = useNavigation();
  const otit = useRouter();

  {/* Firebase */}
  const auth = FIREBASE_AUTH;

  {/* Sign In and Sign up */}
  const signIn = async () => {
    setLoading(true);
    try{
      const response = await signInWithEmailAndPassword(auth,email,password);
      console.log(response);
      otit.replace('/(tabs)/home');
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed:' + error.message)
      setEmail('');
      setPassword('');
      setName('');
    } finally{
      setLoading(false);
    }
  }

  const signUp = async () => {
    setLoading(true);
    try{
      const response = await createUserWithEmailAndPassword(auth,email,password);
      const user = response.user;
      await updateProfile(user, {
        displayName: name,
      });

      //set name in database
      await setDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        displayName: name,
        email: email,
        createdAt: new Date(),
      });

      console.log('User signed up successfully:', user.displayName);

      await auth.signOut();
      
      setActiveTab('login');
      
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      console.log(error);
      alert('Sign up failed:' + error.message)  
    } finally{
      setLoading(false);
    }
  }
  const renderLoginForm = () => (
    <>
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="myemail@gmail.com"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        {email.includes('@') && (
          <Ionicons name="checkmark-circle" size={20} color="#1DCD9F" />
        )}
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="********"
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Ionicons
            name={secureText ? 'eye-off' : 'eye'}
            size={20}
            color="#609AFF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton}onPress={signIn} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.loginText}>Log in</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>or</Text>

      <TouchableOpacity style={styles.googleButton}>
        <FontAwesome name="google" size={20} color="#FFF" />
        <Text style={styles.googleText}>Sign in with Google</Text>
      </TouchableOpacity>
    </>
  );

  const renderSignupForm = () => (
    <>
      <Text style={styles.label}>Name</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type something longer here..."
          placeholderTextColor="#999"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="myemail@gmail.com"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="********"
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Ionicons
            name={secureText ? 'eye-off' : 'eye'}
            size={20}
            color="#609AFF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={signUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.loginText}>Sign up</Text>
        )}
      </TouchableOpacity>

    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button stays at top */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#FFF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Centered card section */}
      <View style={styles.centerWrapper}>
        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'login' && styles.activeTabLeft,
              ]}
              onPress={() => setActiveTab('login')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'login' && styles.activeTabText,
                ]}>
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'signup' && styles.activeTabRight,
              ]}
              onPress={() => setActiveTab('signup')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'signup' && styles.activeTabText,
                ]}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ opacity: loading ? 0.5 : 1 }}>
            {activeTab === 'login' ? renderLoginForm() : renderSignupForm()}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 40,
  },
  backText: {
    color: '#FFF',
    marginLeft: 6,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#888',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTabLeft: {
    backgroundColor: '#609AFF',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 0,
  },
  activeTabRight: {
    backgroundColor: '#609AFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 7,
  },
  tabText: {
    color: '#FFF',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  label: {
    color: '#FFF',
    marginTop: 10,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#555',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFF',
  },
  forgot: {
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
    color: '#888',
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: '#609AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
  or: {
    textAlign: 'center',
    color: '#FFF',
    marginVertical: 12,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  googleText: {
    color: '#FFF',
  },
});

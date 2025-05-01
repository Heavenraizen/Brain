import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  updateEmail,
  updatePassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { useAuth } from '@/context/AuthContext';

// Cloudinary credentials
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dyzu6gj9o/upload';
const CLOUDINARY_UPLOAD_PRESET = 'profile_pics';

export default function ProfileScreen() {
  const { authUser, setAuthUser } = useAuth();
  const user = FIREBASE_AUTH.currentUser!;

  const [name, setName] = useState(authUser?.displayName || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<any>(null);

  // Sync form when context changes
  useEffect(() => {
    setName(authUser?.displayName || '');
    setEmail(authUser?.email || '');
  }, [authUser]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleUpload = async (img: any) => {
    const uri = img.uri;
    const type = 'image/jpeg';
    const name = uri.split('/').pop();
    const formData = new FormData();
    formData.append('file', { uri, type, name } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleUpdateProfile = async () => {
    try {
      // 1) Update Auth email/password
      if (email !== user.email) await updateEmail(user, email);
      if (password) await updatePassword(user, password);

      // 2) Upload new photo if picked
      let photoURL = user.photoURL || '';
      if (image?.uri && !image.uri.startsWith('https://')) {
        photoURL = await handleUpload(image);
      }

      // 3) Update Auth profile (displayName + photoURL)
      await updateProfile(user, { displayName: name, photoURL });

      // 4) Sync to Firestore
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: name,
        email,
        photoURL,
        updatedAt: new Date(),
      });

      // 5) Reload & update context with real User object
      await user.reload();
      const updated = FIREBASE_AUTH.currentUser!;
      setAuthUser(updated);

      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      console.error('Profile update error:', err);
      Alert.alert('Error', err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (err: any) {
      Alert.alert('Logout Failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={
            image
              ? { uri: image.uri }
              : authUser?.photoURL
              ? { uri: authUser.photoURL }
              : require('@/assets/images/profile.webp')
          }
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="New Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Update Profile" onPress={handleUpdateProfile} />

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C0F',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontFamily: 'PlusJakartaSans_Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  changePhoto: {
    color: '#6A5ACD',
    textAlign: 'center',
    marginVertical: 8,
    fontFamily: 'PlusJakartaSans_Regular',
  },
  input: {
    backgroundColor: '#1A1A1F',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    color: '#FFF',
    fontFamily: 'PlusJakartaSans_Regular',
  },
});

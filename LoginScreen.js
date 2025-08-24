import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AppContext); // hole sign in aus appcontext
  const [username, setUsername] = useState(''); // lokaler state für eingegebenen username
  const [password, setPassword] = useState(''); // lokaler state für passwort
  const [showPassword, setShowPassword] = useState(false);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/*überschrift*/}
      <Text style={styles.title}>Sign In / Sign Up</Text>
      {/*eingabe für username*/}
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#888"
      />
          {/*passwort eingabe versteckt*/}
    <View>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setShowPassword(!showPassword)}
              >
        <Ionicons
          name={showPassword ? 'eye-off' : 'eye'}
          size={24}
          color="#888"
          />
        </TouchableOpacity>
    </View>
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        const trimmedUsername = username.trim();

        if (trimmedUsername.length < 3) {
          alert('Username must be at least 3 characters long.');
          return;
        }

        if (password.length < 8) {
          alert('Password must be at least 8 characters long.');
          return;
        }

        signIn(trimmedUsername, password, navigation);
      }}
    >
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>


    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', padding: 32, backgroundColor: '#FFF9BE'
  },
  title: {
    fontSize: 30, fontWeight: 'bold', color: '#000', marginBottom: 28, textAlign: 'center'
  },
  input: {
    borderWidth: 1, borderColor: '#aaa', backgroundColor: '#fff',
    padding: 14, borderRadius: 14, marginBottom: 20, fontSize: 17
  },
  eyeIcon: { position: 'absolute', right: 10, top: 10 },
  button: {
    backgroundColor: '#b6e3cc', borderRadius: 14, paddingVertical: 14, alignItems: 'center'
  },
  buttonText: {
    color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1
  },
});
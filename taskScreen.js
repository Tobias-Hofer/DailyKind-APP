// src/screens/TaskScreen.js
import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  View,
  StyleSheet
} from 'react-native';
import { useDailyTasks } from '../hooks/useDailyTasks'; // Hook to fetch today's tasks from API
import { addDone, listDone } from '../utils/doneStorage';  // AsyncStorage helpers for marking tasks done
import { AppContext } from '../context/AppContext'; // Context to access current user

export default function TaskScreen() {
  const { currentUser } = useContext(AppContext); // Get logged-in user from context
  const { tasks, loading, error } = useDailyTasks(); // Fetch tasks, loading and error states
  const [done, setDone] = useState([]); // Local state for tasks marked done today

  const username = currentUser?.username; // Extract username 

  // On component mount or when username changes, load today's done tasks
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD UTC
    if (username) {
      listDone(today, username).then(setDone); // Populate 'done' state array
    }
  }, [username]); // Dependency: re-run when username updates

  // Handler for when a task is pressed
  const handlePress = async (sentence) => {
    if (done.includes(sentence)) return; // Skip if already marked done
    await addDone(sentence, username);   // Persist in AsyncStorage
    setDone(prev => [...prev, sentence]); // Update UI immediately
  };
  
  if (loading) {
    // Show spinner while tasks are loading
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    // Show error message if fetch failed
    return (
      <View style={styles.center}>
        <Text>Couldn’t load deeds, pull to refresh.</Text>
      </View>
    );
  }

  // Main UI: title bar + list of tasks
  return (
    <View style={styles.screen}>
      <View style={styles.titleBox}>{/* Title container with background */}
        <Text style={styles.header}>Today’s Deeds</Text>{/* Screen header */}
      </View>
      <View style={styles.container}>{/* List container with padding */}
        <FlatList
          data={tasks}           // Array of 10 tasks
          extraData={done}       // Re-render list when 'done' changes
          keyExtractor={(t) => t} // Unique key per task string
          contentContainerStyle={{ paddingBottom: 200 }} // Extra bottom padding
          renderItem={({ item }) => {
            const completed = done.includes(item); // Determine if task is done
            return (
              <Pressable
                onPress={() => handlePress(item)} // Mark task as done on press
                style={[styles.row, completed && styles.doneRow]}
              >
                <Text style={styles.checkbox}>{completed ? '✅' : '⬜'}</Text>{/* Checkbox emoji */}
                <Text style={styles.text}>{item}</Text>{/* Task text */}
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff', // Overall screen background
  },
  titleBox: {
    backgroundColor: '#b6e3cc', // Header background matching card style
    marginBottom: 10,            // Space below header
  },
  header: {
    marginTop: 50,            // Top spacing
    fontSize: 25,             // Large font for header
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',  // Left align header text
    marginLeft: 25,           // Horizontal padding
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,               // Inner padding around list
  },
  row: {
    flexDirection: 'row',      // Horizontal layout for checkbox + text
    alignItems: 'center',      // Vertically center content
    backgroundColor: '#FFF7AA',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,

    shadowColor: '#000',       // shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,              // Android shadow
  },
  doneRow: {
    opacity: 0.4,             // Fade completed tasks
  },
  checkbox: {
    marginRight: 12,
    fontSize: 18,             // Size for checkbox emoji
  },
  text: {
    flex: 1,
    fontSize: 16,             // Task text size
    flexWrap: 'wrap',         // Allow multiline
  },
  center: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
  }
});

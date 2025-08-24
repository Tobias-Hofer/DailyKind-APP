import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { listDone } from '../utils/doneStorage';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

export default function CalendarScreen() {
  // Get todays date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // React state for selected date, tasks completed on that date
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasksForDate, setTasksForDate] = useState([]);

  // Get current user from global context
  const { currentUser } = useContext(AppContext);
  const username = currentUser?.username;

  // Called when user taps a date on the calendar
  const handleDayPress = async (day) => {
    const selectedDateString = day.dateString;
    setSelectedDate(selectedDateString);     // update selected day
    loadTasks(selectedDateString);           // fetch tasks for selected day
  };

  // Load completed tasks for a specific date
  const loadTasks = async (date) => {
    if (!username) return;
    const taskArray = await listDone(date, username);
    const tasks = taskArray.map((text, index) => ({
      id: index + 1,
      text,
    }));
    setTasksForDate(tasks);
  };

  // Load tasks when screen is focused (and whenever selectedDate changes)
  useFocusEffect(
    useCallback(() => {
      loadTasks(selectedDate);
    }, [selectedDate])
  );

  return (
    <View style={styles.screen}>
      {/* Top bar with header */}
      <View style={styles.titleBox}>
        <Text style={styles.header}>Calendar</Text>
      </View>

      {/* Calendar view */}
      <View style={styles.container}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
               selectedColor: '#FFAD77',
            },
          }}
        />
      </View>

      {/* Task summary view */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>
            {selectedDate === today ? `Today's Deeds` : `${selectedDate}`}
          </Text>

          {/* If no tasks were completed on selected date */}
          {tasksForDate.length === 0 && selectedDate && (
            <Text style={styles.noTasksText}>No deeds completed.</Text>
          )}

          {/* List all tasks for selected date */}
          {tasksForDate.map((item) => (
            <Text key={item.id} style={styles.boxSubText}>• {item.text}</Text>
          ))}

          {/* Show progress if tasks exist */}
          {tasksForDate.length > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text>{'\n'}{tasksForDate.length} / 10</Text>
              <Text style={{ fontStyle: 'italic' }}>
                {tasksForDate.length === 10 && '🎉 Well done on a perfect day!'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
    title:  {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    screen: {
        flex: 1,
        backgroundColor: '#fff',
      },
    titleBox:
    {
        backgroundColor: '#b6e3cc',
        marginBottom: 10,
    },
    container: {
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    header: {
        marginTop: 50,
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom:10,
        alignSelf: 'left',
        marginLeft: 25,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        textAlign: 'center',
    },
    noTasksText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginVertical: 8,
        color: '#999',
    },
    taskText: {
        fontSize: 10,
        color: '#333',
    },
    box: {
        backgroundColor: '#FFF7AA',
        borderRadius: 16,
        padding: 16,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    boxSubText: {
        marginTop: 5,
        fontSize: 14,
        alignSelf: 'left',
        paddingHorizontal: 10,
        marginVertical:4,
    },
});




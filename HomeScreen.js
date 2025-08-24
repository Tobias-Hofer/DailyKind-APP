
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRandomDailyTask } from '../hooks/useRandomDailyTask';
import { AppContext } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  // Fetch a random suggested task from custom hook
  const { randomTask, loading, error } = useRandomDailyTask();

  // Access current user and all challenges from global context
  const { currentUser, challenges } = useContext(AppContext);

  // Filter to only show challenges directed at the current user
  const myChallenges = challenges
    ? challenges.filter(c => c.to === currentUser?.username)
    : [];

  return (
  <View style={styles.screen}>
        <View style={styles.titleBox}>
          <Text style={styles.header}>Home</Text>
        </View>
    <ScrollView style={styles.container}>
      {/* Title Bar */}

      <View>
        {/* Welcome text */}
        <Text style={styles.welcomeHeader}> Welcome back! </Text>
        <Text style={styles.subtitle}>Ready to spread some kindness today?</Text>

        {/* Display hero image */}
        <Image
          source={require('../../assets/images/homepicture.png')}
          style={styles.heroImage}
        />

        {/* Suggestion section */}
        <Text style={styles.or}>Deed of the Day:  </Text>
        <View style={styles.taskBox}>
          {loading && <Text style={styles.taskText}>Loading...</Text>}
          {error && <Text style={[styles.taskText, { color: 'red' }]}>Something went wrong!</Text>}
          {!loading && !error && (
            <Text style={styles.taskText}>“{randomTask}”</Text>
          )}
        </View>

        {/* Link to full task list (Deeds screen) */}
        <TouchableOpacity onPress={() => navigation.navigate('Deeds')}>
          <Text style={styles.linkText}>
            Not Applicable? Check out these other{'\n'}
            <Text style={{ fontWeight: 'bold', color:'#53FF44' }}>daily suggestions! →</Text>
          </Text>
        </TouchableOpacity>

        {/* Show incoming challenges if any */}
        {myChallenges.length > 0 && (
          <View style={styles.challengeBox}>
            <Text style={styles.challengeHeader}>Incoming Challenges:</Text>
            <FlatList
              data={myChallenges}
              keyExtractor={(_, idx) => idx.toString()} // use index as fallback key
              renderItem={({ item }) => (
                <View style={styles.challengeCard}>
                  <Text style={styles.challengeText}>
                    <Text style={{ fontWeight: 'bold' }}>{item.from}</Text>
                    {": "}
                    {item.task}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        paddingHorizontal: 25,
        backgroundColor: '#fff',
    },
    titleBox:
    {
        backgroundColor: '#b6e3cc',
        marginBottom: 10,
    },
    header: {
        marginTop: 50,
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom:10,
        alignSelf: 'left',
        marginLeft: 25,
    },
    welcomeHeader: {
        marginTop: 50,
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom:10,
        alignSelf: 'center',
    },
    heroImage: {
      width: '100%',
      height: 200,
      resizeMode: 'contain',
      marginBottom: 20,
      borderRadius: 12,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: 18,
      color: '#555',
      alignSelf: 'center',
    },
    taskBox: {
      backgroundColor: '#FFF7AA',
      borderRadius: 16,
      padding: 20,
      width: '100%',
      alignItems: 'center',

      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    taskText: {
      fontSize: 17,
      textAlign: 'center',
      color: '#000',
      fontStyle: 'italic',
    },
    linkText: {
      marginTop: 10,
      fontSize: 12,
      color: '#555',
      textAlign: 'center',
      marginBottom: 40,
    },
    or:{
      alignSelf: 'center',
      padding: 10,
      fontSize: 16,
    },
    challengeHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginTop: 25,
    marginBottom: 8
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#b4e2cd',
  },
  challengeText: {
    fontSize: 15,
    color: '#333',
  },
  task: {
    fontSize: 18,
    marginTop: 12,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },

});

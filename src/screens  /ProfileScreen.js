import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
  CommonActions
} from 'react-native';
import { readMap } from '../utils/doneStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { parseISO, getISOWeek, getISOWeekYear } from 'date-fns';

// Berechne Anzahl der Wochen, in denen >=10 Aufgaben erledigt wurden
function countBadgesByWeek(doneTasksMap) {
  const weeklyCounts = {};

  // Zähle, wie viele Aufgaben in jeder Woche abgeschlossen wurden
  Object.entries(doneTasksMap).forEach(([dateStr, tasks]) => {
    const date = parseISO(dateStr);
    const week = getISOWeek(date);
    const year = getISOWeekYear(date);
    const key = `${year}-W${week}`;
    weeklyCounts[key] = (weeklyCounts[key] || 0) + tasks.length;
  });

  // Jede Woche mit mindestens 10 Aufgaben ergibt einen Badge
  let badgeCount = 0;
  Object.values(weeklyCounts).forEach((count) => {
    if (count >= 10) badgeCount++;
  });

  return badgeCount;
}

// Alle erledigten Aufgaben aller Tage für einen Nutzer aus Map
async function getAllDoneTasks(username) {
  const map = await readMap(username);
  return Object.values(map).flat();
}

export default function ProfileScreen({ navigation, route }) {
  const { currentUser, logout } = useContext(AppContext);
  const username = currentUser?.username;

  // Wenn wir via FriendsNavigator kommen, haben wir route.params.name
  const viewedName = route?.params?.name || currentUser.username;

  // Lade erledigte Tasks
  const [doneTasks, setDoneTasks] = useState([]);
  // Anzahl der Badges
  const [badgeCount, setBadgeCount] = useState(0);
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (route?.params?.name) {
        navigation.setParams({ name: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route]);

  // Lade erledigte Aufgaben beim Betreten des Screens
    useFocusEffect(
      useCallback(() => {
        if (username) {
          readMap(username).then((map) => {
            const allTasks = Object.values(map).flat();
            setDoneTasks(allTasks);
            setBadgeCount(countBadgesByWeek(map)); // Berechne Badge-Anzahl
          });
        }
      }, [username])
    );

  // XP + Level
  const xpPerTask       = 250;
  const xpPerLevel      = 2500;
  const totalXP         = doneTasks.length * xpPerTask;
  const level           = Math.floor(totalXP / xpPerLevel) + 1;
  const xpInCurrent     = totalXP % xpPerLevel;
  const progressPercent = xpInCurrent / xpPerLevel;

  // Modals
  const [badgeModalVisible, setBadgeModalVisible]       = useState(false);
  const [showLeaderboard,    setShowLeaderboard]        = useState(false);

  // Leaderboard-Dummy-Daten und der User selbst
  const users = [
    { name: 'EmmaB03', Deeds: 31 },
    { name: 'Antonino69',   Deeds:  63 },
    { name: 'Alexx01',  Deeds:  7 },
    { name: 'You',     Deeds: doneTasks.length },
  ];
  // Sortierung der User im Leaderboard
  const sortedUsers = users.sort((a, b) => b.Deeds - a.Deeds);

  // Passendes Icon je nach Badge-Stufe
    const getCollectableImage = (index) => {
      switch (index) {
        case 0:
          return require('../../assets/images/collectable_1.png'); // Bronze
        case 1:
          return require('../../assets/images/collectable_2.png'); // Silber
        case 2:
          return require('../../assets/images/collectable_3.png'); // Gold
        case 3:
          return require('../../assets/images/collectable_4.png'); // Platin
        default:
          return null;
      }
    };

   // Badges Namen nach Badge-Stufe
    const getNextBadgeName = (badgeCount) => {
      switch (true) {
        case badgeCount < 1:
          return 'Next: Bronze Deed';
        case badgeCount < 2:
          return 'Next: Silver Deed';
        case badgeCount < 3:
          return 'Next: Gold Deed';
        case badgeCount < 4:
          return 'Next: Platin Deed';
        default:
          return 'Max Level!';
      }
    };

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      {/* Header */}
      <View style={styles.titleBox}>
        <Text style={styles.header}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profilbild */}
                {route?.params?.name && (
            <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
              <Text style={{color:'#00664f', fontWeight:'bold'}}>{"< Back"}</Text>
            </TouchableOpacity>
        )}

        <Image
          source={require('../../assets/images/profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{viewedName}</Text>

        <View style={styles.levelRow}>
          <Text style={styles.level}>Level {level}</Text>
          {/* Anzeige gesammelter Sterne */}
          <View style={styles.collectableContainer}>
             {Array.from({ length: badgeCount }).map((_, i) => (
               <Image
                 key={i}
                 source={getCollectableImage(i)}
                 style={styles.collectable}
               />
             ))}
           </View>
        </View>

        {/* XP-Balken nur im eigenen Profil */}
        {viewedName === currentUser.username && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {xpInCurrent} / {xpPerLevel} XP
            </Text>
          </View>
        )}

              {/* Badges nur im eigenen Profil */}
                   {viewedName === currentUser.username && (
                     <>
                       <TouchableOpacity
                         onPress={() => setBadgeModalVisible(true)}
                         style={styles.box}
                       >
                         <Image
                           source={require('../../assets/images/badge.png')}
                           style={styles.boxIcon}
                         />
                         <View style={styles.boxTextContainer}>
                           <Text style={styles.boxTitle}>Almost There!</Text>
                           <Text style={styles.boxSubText}>
                             Complete {Math.max(0, 10 - doneTasks.length)} more Deeds this
                             Week! {doneTasks.length}/10
                           </Text>
                           <Text style={styles.boxLabel}>{getNextBadgeName(badgeCount)}</Text>
                         </View>
                       </TouchableOpacity>

            {/* Overlay für Badges */}
            <Modal
              visible={badgeModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setBadgeModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>🏅 Badges explained</Text>
                  <Text style={styles.modalText}>
                    You'll earn badges by completing all weekly Deeds.{"\n\n"}
                    • Complete 10 Deeds per week for a Badge.{"\n\n"}
                    • You get different Badges every 10 Deeds!{"\n\n"}
                    • Stay consistent and be rewarded for your effort!!{"\n\n"}
                    • Badges don't affect Leaderboard ranking.
                  </Text>
                  <Button
                    title="Close"
                    onPress={() => setBadgeModalVisible(false)}
                  />
                </View>
              </View>
            </Modal>
          </>
        )}

        {/* Overlay für Leaderboard */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => setShowLeaderboard(true)}
        >
          <Image
            source={require('../../assets/images/crown.png')}
            style={styles.boxIcon}
          />
          <View style={styles.boxTextContainer}>
            <Text style={styles.boxTitle}>Leaderboard</Text>
            <Text style={styles.boxSubText}>Share your good Deeds</Text>
          </View>
        </TouchableOpacity>
        <Modal
          visible={showLeaderboard}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLeaderboard(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>🏆 Leaderboard</Text>
              {sortedUsers.map((u, i) => (
                <Text key={i} style={styles.modalItem}>
                  {i + 1}. {u.name} – {u.Deeds} Deeds{" "}
                  {i === 0 ? "👑" : ""}
                </Text>
              ))}
              <Button
                title="Close"
                onPress={() => setShowLeaderboard(false)}
              />
            </View>
          </View>
        </Modal>

        {/* Gesamtzahl Deeds */}
        <Text style={styles.totalDeeds}>
          Your total collected Deeds! - {doneTasks.length}
        </Text>
        <Image
          source={require("../../assets/images/deed.png")}
          style={styles.emoji}
        />

        {/* Logout am Ende */}
        {(!route?.params?.name || route.params.name === currentUser.username) && (
          <TouchableOpacity
            style={[styles.box, { backgroundColor: "#ffcccc" }]}
            onPress={() => logout(navigation)}
          >
            <Text style={{ color: "#a00", fontWeight: "bold" }}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

//Styles
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  titleBox: {
    backgroundColor: "#E7FAF2",
    marginBottom: 10,
  },
  header: {
    marginTop: 50,
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  level: {
    fontSize: 18,
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "80%",
    marginVertical: 10,
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 20,
    backgroundColor: "#DFF9F3",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00E091",
    borderRadius: 10,
  },
  xpText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 4,
    color: "#444",
  },
  box: {
    flexDirection: "row",
    backgroundColor: "#E7FAF2",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
  },
  boxIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  boxTextContainer: {
    flex: 1,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  boxSubText: {
    fontSize: 14,
  },
  boxLabel: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalDeeds: {
    marginTop: 40,
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "bold",
  },
  emoji: {
    width: 74,
    height: 48,
    marginTop: 8,
    marginBottom: 30,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  collectableContainer: {
    flexDirection: 'row',
  },
  collectable: {
    width: 20,
    height: 20,
    marginRight: 4,
    marginBottom: 8,
  },
});

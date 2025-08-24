import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet
} from 'react-native';
import { AppContext } from '../context/AppContext';

export default function FriendsScreen({ navigation }) {
  // holt kontextwerte, funktionen aus appcontext
  const {
    currentUser, users,
    challenges, addFriend,
    challengeFriend
  } = useContext(AppContext);
  
  //lokaler state für suchtext
  const [searchText, setSearchText] = useState('');
  //lokaler state für challenge
  const [challengeTexts, setChallengeTexts] = useState({});
  //liste der freunde des aktuellen users
  const friendList = currentUser?.friends || [];
  // liste verfügbarer nutzern, die noch keine freunde sind 
  const available = users
    .map(u => u.username)
    .filter(name =>
      name !== currentUser.username && // nicht der aktuelle user
      !friendList.includes(name) && //noch kein freund
      name.toLowerCase().includes(searchText.toLowerCase()) //suchfilter
    );
  // renderfunktion für einen freund in der freundesliste
  const renderFriend = ({ item }) => {
    // prüft ob bereits ein challenge an diesen freund geschickt wurde
    const sent = challenges.find(c => c.to === item);
    return (
      <View style={styles.card}>
        <Text style={styles.friendName}>{item}</Text>
        {/* button um profil des freundes zu öffnen */}
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => navigation.navigate('Profile', { name: item })}
        >
          <Text style={styles.viewBtnText}>View Profile</Text>
        </TouchableOpacity>
        {/* textfeld für challenge text */}
        <TextInput
          style={styles.challengeInput}
          placeholder="Write a challenge…"
          value={challengeTexts[item] || ''}
          onChangeText={t => setChallengeTexts(prev => ({ ...prev, [item]: t }))}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.challengeBtn}
          onPress={() => {
            challengeFriend(item, challengeTexts[item]); //funktion aus context
            setChallengeTexts(prev => ({ ...prev, [item]: '' })); // feld leeren
          }}
        >
          <Text style={styles.challengeBtnText}>Send Challenge</Text>
        </TouchableOpacity>
        {/* falls challenge gesendet, text anzeigen */}
        {sent && <Text style={styles.sentText}>Sent: {sent.task}</Text>}
      </View>
    );
  };
  //render für einen vefügbaren user(noch kein freund)
  const renderAvailable = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.friendName}>{item}</Text>
    {/*button zum freund hinzufügen*/}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => addFriend(item)}
      >
        <Text style={styles.addBtnText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Grüner Balken oben */}
      <View style={styles.titleBox}>
        <Text style={styles.header}>Friends</Text>
      </View>

      <View style={styles.container}>

        <TextInput
          style={styles.search}
          placeholder="Search users to add"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#888"
        />

        <Text style={styles.sectionTitle}>Your Friends</Text>
        <FlatList
          data={friendList}
          keyExtractor={i => i}
          renderItem={renderFriend}
          ListEmptyComponent={<Text style={styles.empty}>No friends yet.</Text>}
        />

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Search & Add Users</Text>
        <FlatList
          data={available}
          keyExtractor={i => i}
          renderItem={renderAvailable}
          ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#fff' },
  titleBox:     { backgroundColor: '#b6e3cc', marginBottom: 10 },
  header:       { marginTop: 50, fontSize: 25, fontWeight: 'bold', marginBottom: 10, alignSelf: 'left', marginLeft: 25 },
  container:    { flex: 1, padding: 20, backgroundColor: '#fff' },
  search:       { borderWidth: 1, borderColor: '#000', backgroundColor:'#fff', borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 18, marginBottom: 8, color: '#000' },
  separator:    { height: 1, backgroundColor: '#000', marginVertical: 20 },
  card:         { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, elevation:2, shadowColor:'#ccc', shadowOpacity:0.1, shadowRadius:4 },
  friendName:   { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#000' },
  viewBtn:      { backgroundColor: '#FFF7AA', borderRadius: 8, padding: 8, alignItems:'center', marginBottom:6,       shadowColor: '#000',
                                                                                                                      shadowOffset: { width: 0, height: 4 },
                                                                                                                      shadowOpacity: 0.1,
                                                                                                                      shadowRadius: 6,
                                                                                                                      elevation: 5, },
  viewBtnText:  { color: '#000' },
  challengeInput:{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, marginVertical: 8, fontSize:15 },
  challengeBtn: { backgroundColor:'#97C46E', borderRadius:8, padding:10, alignItems:'center', marginBottom:6,       shadowColor: '#000',
                                                                                                                    shadowOffset: { width: 0, height: 4 },
                                                                                                                    shadowOpacity: 0.1,
                                                                                                                    shadowRadius: 6,
                                                                                                                    elevation: 5, },
  challengeBtnText: { color:'#fff', fontWeight:'bold' },
  sentText:     { color:'#666', fontStyle:'italic', marginTop:2 },
  addBtn:       { backgroundColor:'#97C46E', borderRadius:8, padding:10, alignItems:'center', marginTop:8,         shadowColor: '#000',
                                                                                                                   shadowOffset: { width: 0, height: 4 },
                                                                                                                   shadowOpacity: 0.1,
                                                                                                                   shadowRadius: 6,
                                                                                                                   elevation: 5, },
  addBtnText:   { color:'#fff', fontWeight:'bold' },
  empty:        { color:'#888', fontStyle:'italic', marginVertical:8, textAlign:'center' }
});

import React, { createContext, useState, useCallback, useMemo } from 'react';
import User from '../context/User';
// Context, für globale nutzung
export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Liste aller User im System
  const [users, setUsers]             = useState([]);
  // Aktuell eingellogter User
  const [currentUser, setCurrentUser] = useState(null);
  // Liste aller Challenges zwischen Usern
  const [challenges, setChallenges]   = useState([]); // { from, to, task }

  // Anmeldefunktion Loggt user ein oder erstellt einen neuen User, falls noch nicht vorhanden
  const signIn = useCallback((username, password, navigation) => {
    // Suche nach User
    let user = users.find(u => u.username === username);
    // wenn nicht gefunden, erstelle neuen User
    if (!user) {
      user = new User(username, password);
      setUsers(prev => [...prev, user]);
    // wenn passwort falsch, Fehlermeldung anzeigen
    } else if (user.password !== password) {
      alert('Incorrect password');
      return;
    }
    // setze den aktuellen User und navigiere zu main 
    setCurrentUser(user);
    navigation.replace('Main');
  }, [users]);
  // alte version, loggt user aus und navigiert zurück zum login
  const logout = useCallback(navigation => {
    setCurrentUser(null);
    navigation.replace('Login');
  }, []);
  // fügt dem aktuellen user einen Freund hinzu
  const addFriend = useCallback(friendName => {
    if (!currentUser) return; // wenn niemand eingeloggt abbrechen
    currentUser.addFriend(friendName); // methode der userklasse
    // aktuallisiere userliste
    setUsers(prev => prev.map(u => u.username === currentUser.username ? currentUser : u));
  }, [currentUser]);
  // freund challengen: challenge senden 
  const challengeFriend = useCallback((friendName, task) => {
    if (!task?.trim()) return; // keine leere aufgabe zulassen
    setChallenges(prev => [
      ...prev,
      { from: currentUser.username, to: friendName, task: task.trim() }
    ]);
  }, [currentUser]);
  // memorisiert value für context 
  const value = useMemo(() => ({
    users,
    currentUser,
    challenges,
    signIn,
    logout,
    addFriend,
    challengeFriend,
  }), [users, currentUser, challenges, signIn, logout, addFriend, challengeFriend]);
  // Context provider umschließt die kinder komponenten und stellt alle werte/funktionen bereit
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

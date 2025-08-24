export default class User {
  constructor(username, password) {
    this.username       = username;
    this.password       = password;
    this.xp             = 0;
    this.level          = 1;
    this.tasksCompleted = [];
    this.friends        = [];
  }
// methode um freund hinzufügen, falls nocht nicht geschehen
  addFriend(friendName) {
    if (!this.friends.includes(friendName)) {
      this.friends.push(friendName);
    }
  }
// aufgabe als erledigt markieren usw.
  completeTask(task) {
    this.tasksCompleted.push(task);
    this.xp += 250;
    if (this.xp >= this.level * 2500) {
      this.level += 1;
    }
  }
  //getter für nutzernamen
  get getUserName(){
    return this.username;
  }
// gibt user als js-objekt zurück/speicherung oder anzeige
  toJSON() {
    return {
      username: this.username,
      password: this.password,
      xp: this.xp,
      level: this.level,
      tasksCompleted: this.tasksCompleted,
      friends: this.friends,
    };
  }


}

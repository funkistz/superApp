import {Injectable} from '@angular/core';
import firebase from 'firebase';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthProvider {

  userList : FirebaseListObservable<any>;
  user_key : any;
  public accountInfo;

  constructor(
    public aDB: AngularFireDatabase,
    private afs: AngularFirestore
  )
  {
    this.userList = this.afs.collection('users');
  }

  setUserData(value)
  {
    this.accountInfo = value;
  }

  getUserData() {
    return this.accountInfo;
  }

  loginUser(email: string, password: string): Promise<any> {

    let user = firebase.auth().signInWithEmailAndPassword(email, password);
    this.setUserData(user);

    return user;
  }

  signupUser(email: string, password: string, firstName: string, lastName: string, phone: string): Promise<any> {

    var register =  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then( newUser => {
      firebase
      .database()
      .ref('/userProfile')
      .child(newUser.uid)
      .set({ email: email });
    });

    this.userList.add({

      email: email,
      first_name: firstName,
      last_name: lastName,
      phone: phone,

    });

    return register;
  }

  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return firebase.auth().signOut();
  }

}

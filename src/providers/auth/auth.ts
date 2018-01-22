import {Injectable} from '@angular/core';
import firebase from 'firebase';
import {AngularFireDatabase} from 'angularfire2/database';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthProvider {

  userList : AngularFirestoreCollection<any>;
  user_key : any;
  users: Observable<any[]>;
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

    this.userList = this.afs.collection('users', ref => ref.where('email', '==', email).limit(1) );

    this.users = this.userList.snapshotChanges().map( v => {
        return v.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
        });
    });

    this.users.subscribe(docs => {
      this.setUserData(docs[0]);
    })

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
    this.setUserData(null);
    return firebase.auth().signOut();
  }

}

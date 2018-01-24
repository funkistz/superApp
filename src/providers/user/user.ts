import {Injectable} from '@angular/core';
import firebase from 'firebase';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../auth/auth';

@Injectable()
export class UserProvider {

  userList : AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  userArray:any = {};

  userRef: AngularFirestoreDocument<any>;
  userReal: Observable<any>;

  public helpBroadcast:any = {};

  constructor(
    private afs: AngularFirestore,
    public authData: AuthProvider,
  )
  {

  }

  setUser(){
    this.userRef = this.afs.doc('users/' + this.authData.getUserData().id);
    this.userReal = this.userRef.valueChanges();
  }

  getUserRef(){
      return this.userRef;
  }

  getUser(){
      return this.userReal;
  }

  refresh(){

      this.userList = this.afs.collection('users', ref => ref.where('email', '==', this.authData.getUserData().email).limit(1) );

      this.users = this.userList.snapshotChanges().map( v => {
          return v.map(a => {
              const data = a.payload.doc.data();
              const id = a.payload.doc.id;
              return { id, ...data };
          });
      });

      this.users.subscribe(docs => {
        this.authData.setUserData(docs[0]);
      })
  }

  update(data){

    this.afs.doc('users/' + this.authData.getUserData().id)
    .update(
      data
    )
    .then(() => {
    })
    .catch((error) => {

        this.afs.doc('users/' + this.authData.getUserData().id)
        .set(
          data
        );

    });

  }

  updateOther(id, data){

    this.afs.doc('users/' + id)
    .update(
      data
    )
    .then(() => {
    })
    .catch((error) => {

        this.afs.doc('users/' + id)
        .set(
          data
        );

    });

  }


}

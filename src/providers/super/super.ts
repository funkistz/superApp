import {Injectable} from '@angular/core';
import firebase from 'firebase';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../auth/auth';

@Injectable()
export class SuperProvider {

  userList : FirebaseListObservable<any>;
  users: Observable<any[]>;
  userArray:any[] = [];

  public accountInfo;

  constructor(
    public aDB: AngularFireDatabase,
    private afs: AngularFirestore,
    public authData: AuthProvider,
  )
  {
    this.userList = this.afs.collection('users');
    this.users = this.userList.snapshotChanges().map( v => {
        return v.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
        });
    });
  }

  getUsers(){

    this.users = this.userList.snapshotChanges().map( v => {
        return v.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
        });
    });

    this.users.subscribe(docs => {

      docs.forEach(doc => {
        this.userArray[doc.id] = doc;
        this.userArray[doc.id]['lon'] = doc.lng;
      })

    })

    var sphereKnn = require("sphere-knn"),
    lookup    = sphereKnn(this.userArray);

    var points = lookup(this.authData.getUserData().lat, this.authData.getUserData().lng, 1, 200);

    console.log(points);
    console.log(lookup);
    console.log(this.userArray);
    return this.userList.valueChanges();
  }

  closestLocation(targetLocation, locationData) {
    function vectorDistance(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    }

    function locationDistance(location1, location2) {
        var dx = location1.latitude - location2.latitude,
            dy = location1.longitude - location2.longitude;

        return vectorDistance(dx, dy);
    }

    return locationData.reduce(function(prev, curr) {
        var prevDistance = locationDistance(targetLocation , prev),
            currDistance = locationDistance(targetLocation , curr);
        return (prevDistance < currDistance) ? prev : curr;
    });
}

}

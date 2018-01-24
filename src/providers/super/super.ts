import {Injectable} from '@angular/core';
import firebase from 'firebase';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../auth/auth';
import geolib from 'geolib';

@Injectable()
export class SuperProvider {

  userList : AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  userArray:any = {};

  public helpBroadcast:any = {};

  constructor(
    private afs: AngularFirestore,
    public authData: AuthProvider,
  )
  {



  }

  setHelpBroadcast(){

    this.userList = this.afs.collection('users', ref => ref.where('status', '==', 'broadcasting'));
    this.users = this.userList.snapshotChanges().map( v => {
        return v.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
        });
    });

    this.users.subscribe(docs => {

      docs.forEach(doc => {

        if(doc.id != this.authData.getUserData().id){

          this.userArray[doc.id] = {};
          this.userArray[doc.id]['latitude'] = doc.lat;
          this.userArray[doc.id]['longitude'] = doc.lng;
        }

      });

      this.helpBroadcast = this.userArray;
    })

  }

  getHelpBroadcast(){


      if(this.helpBroadcast != null){

        var spot = {latitude:this.authData.getUserData().lat, longitude:this.authData.getUserData().lng};
        var points = geolib.findNearest(spot, this.helpBroadcast);

        if(points != null){

          this.helpBroadcast[points['key']]['id'] = points['key'];

          return this.helpBroadcast[points['key']];
        }else{

          return null;
        }
      }else{
        return null;
      }
  }


}

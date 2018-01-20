import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserProvider } from '../../providers/user/user';

import { DirectionPage } from '../direction/direction';

@IonicPage()
@Component({
  selector: 'page-rescue',
  templateUrl: 'rescue.html',
})
export class RescuePage {

  userRef : AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  user_id:any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public userData: UserProvider,
  )
  {
      this.userRef = navParams.get("user");
      this.users = this.userRef.snapshotChanges().map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RescuePage');
  }

  getDirection(victim){

    this.userData.updateOther(
    victim.id,
    {
      status: 'assisted',
    });

    this.navCtrl.push(DirectionPage, {
        user: victim
    });
  }

}

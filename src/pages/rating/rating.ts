import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../../providers/auth/auth';

import { Ionic2RatingModule } from "ionic2-rating";

@IonicPage()
@Component({
  selector: 'page-rating',
  templateUrl: 'rating.html',
})
export class RatingPage {

  user:any;
  user_id:any;
  userRef: AngularFirestoreDocument<any>;
  userReal: Observable<any>;

  ratingRef: AngularFirestoreCollection<any>;
  ratings: Observable<any[]>;

  ratingTotal: number = <number><any>0;
  ratingCalc: number = <number><any>0;
  ratingStar: number = <number><any>0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public authData: AuthProvider,
    public toastCtrl: ToastController
  )
  {

    this.user = this.authData.getUserData();
    this.user_id = navParams.get("user_id");
    this.userRef = this.afs.doc('users/' + this.user_id);
    this.userReal = this.userRef.valueChanges();

    this.ratingRef = this.afs.collection('users/' + this.user_id + '/ratings');
    this.ratings = this.ratingRef.valueChanges();

    this.ratings.subscribe(docs => {

        var length = 0;
        length = <number><any>docs.length;
        this.ratingTotal = <number><any>0;
        docs.forEach(doc => {
          this.ratingTotal += <number><any>doc.rating;
        });

        this.ratingCalc = <number><any>Number(this.ratingTotal / length).toFixed(1);

    });
  }

  rate(){

    this.afs.doc('users/' + this.user_id + '/ratings/' + this.user.id)
    .update({
      rating: this.ratingStar
    })
    .then(() => {
    })
    .catch((error) => {

        this.afs.doc('users/' + this.user_id + '/ratings/' + this.user.id)
        .set({
          rating: this.ratingStar
        });

    });

    let toast = this.toastCtrl.create({
      message: 'Rating Submitted',
      duration: 2000
    });
    toast.present();

  }

  back(){
    this.navCtrl.pop();
  }

}

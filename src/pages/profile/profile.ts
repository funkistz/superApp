import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import {
   AngularFirestore,
   AngularFirestoreDocument ,
   AngularFirestoreCollection
 } from 'angularfire2/firestore';
 import { Observable } from 'rxjs/Observable';
 import { UserProvider } from '../../providers/user/user';
 import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  first_name: any;
  last_name: any;
  phone: any;
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
    public userData: UserProvider,
    private afs: AngularFirestore,
    public authData: AuthProvider,
    public toastCtrl: ToastController
  )
  {

    this.userData.setUser();
    this.userRef = this.userData.getUserRef();
    this.userReal = this.userRef.valueChanges();

    this.userReal.subscribe(doc => {

        this.first_name = doc.first_name;
        this.last_name = doc.last_name;
        this.phone = doc.phone;

    });

    this.ratingRef = this.afs.collection('users/' + this.authData.getUserData().id + '/ratings');
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

  update(){
    this.userRef.update({
      first_name: this.first_name,
      last_name: this.last_name,
      phone: this.phone
    }).then(() => {

      this.toastCtrl.create({
        message: 'Profile Updated',
        duration: 3000
      }).present();

    });

  }

}

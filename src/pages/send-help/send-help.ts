import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, ToastController, Platform  } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { Geolocation } from '@ionic-native/geolocation';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-send-help',
  templateUrl: 'send-help.html'
})
export class SendHelpPage {

  lat: any;
  lng: any;
  problemCollection: AngularFirestoreCollection<any>;
  problem$: Observable<any[]>;
  helpBroadcastRef: AngularFirestoreDocument<any>;
  helpBroadcast$: Observable<any>;
  loading: any;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public authData: AuthProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private geolocation: Geolocation,
    private afs: AngularFirestore
  )
  {
      this.problemCollection = this.afs.collection('problemType');
      this.problem$ = this.problemCollection.valueChanges();

      platform.ready().then(() => {
        this.getCurrentLocation()
      });
  }

  sendHelp(problem){

      this.loading = this.loadingCtrl.create({
        content: 'Sending Help...'
      });

      this.loading.present();

      let data = {
        problem: problem.name,
        status: 'broadcasting',
        lat: this.lat,
        lng: this.lng
      };

      this.afs.doc('users/' + this.authData.getUserData().id)
      .update(
        data
      )
      .then(() => {
        this.helpSended();
      })
      .catch((error) => {

          this.afs.doc('users/' + this.authData.getUserData().id)
          .set(
            data
          );

          this.helpSended();
      });

    }

    helpSended():void{
      let toast = this.toastCtrl.create({
        message: 'Help was send successfully',
        duration: 3000
      });
      toast.present();

      this.loading.dismiss();
      this.navCtrl.pop();
    }

    getCurrentLocation():void{
      this.geolocation.getCurrentPosition().then((resp) => {

        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
      }).catch((error) => {
          console.log('Error getting location', error);
      });
    }

}

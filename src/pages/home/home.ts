import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, ToastController, LoadingController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { SuperProvider } from '../../providers/super/super';
import { Geolocation } from '@ionic-native/geolocation';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { SendHelpPage } from '../send-help/send-help';
import { RescuePage } from '../rescue/rescue';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild('map') mapElement: ElementRef;
    google : any;
    lat: any;
    lng: any;
    private map: any;
    user:any;
    loading: any;

    helpBroadcastRef: AngularFirestoreDocument<any>;
    helpBroadcast: Observable<any>;

    constructor(
      public platform: Platform,
      public navCtrl: NavController,
      public authData: AuthProvider,
      public superData: SuperProvider,
      private geolocation: Geolocation,
      public toastCtrl: ToastController,
      public loadingCtrl: LoadingController,
      private afs: AngularFirestore
    )
    {

      this.user = this.authData.getUserData();

      this.helpBroadcastRef = this.afs.doc('users/' + this.user.id);
      this.helpBroadcast = this.helpBroadcastRef.valueChanges();

      platform.ready().then(() => {
          this.getCurrentLocation()
           console.log("Start Loding MAP....")
       });

    }

    getCurrentLocation():void{
      this.geolocation.getCurrentPosition().then((resp) => {

        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
      }).catch((error) => {
          console.log('Error getting location', error);
      });
    }

    getHelp() {
      this.navCtrl.push(SendHelpPage).then(response => {
          console.log(response);
      }).catch(e => {
          console.log(e);
      });
    }

    rescue() {

      this.loading = this.loadingCtrl.create({
        content: 'Searching...'
      });

      this.loading.present();

      let data = {
        status: 'searching',
        lat: this.lat,
        lng: this.lng
      };

      this.afs.doc('users/' + this.user.id)
      .update(
        data
      )
      .then(() => {
      })
      .catch((error) => {

          this.afs.doc('users/' + this.user.id)
          .set(
            data
          );

      });

      this.loading.dismiss();

      //test
      let userx = this.superData.getUsers();

    }

    help(marker):void{
      let toast = this.toastCtrl.create({
        message: 'lol',
        duration: 3000
      });
      toast.present();
    }

    cancelBroadcasting():void{

      this.helpBroadcastRef.update({
        status: 'idle',
      })
      .then(() => {

        let toast = this.toastCtrl.create({
          message: 'Help canceled',
          duration: 3000
        });
        toast.present();

      })
      .catch((error) => {


      });

    }

    cancelRescuing():void{

      this.helpBroadcastRef.update({
        status: 'idle',
      })
      .then(() => {

        let toast = this.toastCtrl.create({
          message: 'Search canceled',
          duration: 3000
        });
        toast.present();

      })
      .catch((error) => {


      });

    }

}

import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, ToastController, LoadingController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { SuperProvider } from '../../providers/super/super';
import { UserProvider } from '../../providers/user/user';
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
    label = {text: 'You'};
    private map: any;
    loading: any;
    user: any;

    userRef: AngularFirestoreDocument<any>;
    userReal: Observable<any>;

    victimsRef:  AngularFirestoreCollection<any>;
    victims:  Observable<any[]>;

    victimOffline:any;

    constructor(
      public platform: Platform,
      public navCtrl: NavController,
      public authData: AuthProvider,
      public superData: SuperProvider,
      public userData: UserProvider,
      private geolocation: Geolocation,
      public toastCtrl: ToastController,
      public loadingCtrl: LoadingController,
      private afs: AngularFirestore
    )
    {

      this.user = this.authData.getUserData();

      this.userRef = this.afs.doc('users/' + this.user.id);
      this.userReal = this.userRef.valueChanges();

      this.victimsRef = this.afs.collection('users', ref => ref.where('hero', '==', this.user.id));
      this.victims = this.victimsRef.valueChanges();

      this.victimsRef.snapshotChanges().map( v => {
          return v.map(a => {
              const data = a.payload.doc.data();
              const id = a.payload.doc.id;
              return { id, ...data };
          });
      }).subscribe(docs => {

        docs.forEach(doc => {
          this.victimOffline = doc;
        });

      });


      platform.ready().then(() => {
          this.getCurrentLocation()
            console.log("Start Loding MAP....")
       });

    }

    getCurrentLocation():void{
      this.geolocation.getCurrentPosition().then((resp) => {

        this.userData.update({
          lat: resp.coords.latitude,
          lng: resp.coords.longitude
        });

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

      this.userData.update({
        status: 'searching',
      });

      var count = 0;
      var temp = this;
      var temp_victims = this.superData.setHelpBroadcast();

      var interval = setInterval(function(){
        count++;

        if(count > 5){
          clearInterval(interval);
          temp.loading.dismiss();
          temp.userData.update({
            status: 'idle',
            victim: null
          });
          let toast = temp.toastCtrl.create({
            message: 'No victim found',
            duration: 3000
          });
          toast.present();
        }

        if(temp.superData.getHelpBroadcast()){
          clearInterval(interval);

          var victimx = temp.superData.getHelpBroadcast();
          temp.userData.update({
            status: 'searching',
            victim: victimx.id,
          });
          temp.userData.updateOther(
          victimx.id,
          {
            hero: temp.user.id,
          });

          temp.loading.dismiss();
          let toast = temp.toastCtrl.create({
            message: 'Nearest victim found',
            duration: 3000
          });
          toast.present();

        }else{
          console.log('waiting...');
        }
      }, 1000);

    }

    goRescuing() {
      this.navCtrl.push(RescuePage, {
          user: this.victimsRef
      });
    }

    help(marker):void{
      let toast = this.toastCtrl.create({
        message: 'lol',
        duration: 3000
      });
      toast.present();
    }

    cancelBroadcasting():void{

      this.userRef.update({
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

      this.userRef.update({
        status: 'idle',
      })
      .then(() => {

        this.userData.updateOther(
        this.victimOffline.id,
        {
          hero: null,
        });

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

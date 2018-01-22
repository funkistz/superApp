import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { SuperProvider } from '../../providers/super/super';
import { UserProvider } from '../../providers/user/user';
import { Geolocation } from '@ionic-native/geolocation';
import { CallNumber } from '@ionic-native/call-number';

import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { SendHelpPage } from '../send-help/send-help';
import { RescuePage } from '../rescue/rescue';
import { RatingPage } from '../rating/rating';

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

    victimsRef: AngularFirestoreCollection<any>;
    victims: Observable<any[]>;
    victimx: any;

    victimOffline:any;
    userRealLoop:any = 0;
    public alertPresented: any;

    constructor(
      public platform: Platform,
      public navCtrl: NavController,
      public authData: AuthProvider,
      public alertCtrl: AlertController,
      private callNumber: CallNumber,
      public superData: SuperProvider,
      public userData: UserProvider,
      private geolocation: Geolocation,
      public toastCtrl: ToastController,
      public loadingCtrl: LoadingController,
      private afs: AngularFirestore
    )
    {

      this.alertPresented = false;
      this.user = this.authData.getUserData();

      this.userRef = this.afs.doc('users/' + this.user.id);
      this.userReal = this.userRef.valueChanges();

      this.userReal.subscribe(doc => {

        this.userData.refresh();
        if(doc['status'] == "assisted" && doc['hero_status'] == "first" && this.userRealLoop == 0){

            this.userRealLoop == 1;
            this.showAlert();

        }

        if(doc['status'] == "canceled_assist"){

            this.assistCanceled();

        }

        if(doc['status'] == "searching" || doc['status'] == "helping"){

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

        }else if(doc['status'] == "assisted"){

          this.victimsRef = this.afs.collection('users', ref => ref.where('victim', '==', this.user.id));
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

        }

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

          temp.victimx = temp.superData.getHelpBroadcast();
          temp.userData.update({
            status: 'searching',
            victim: temp.victimx.id,
          });
          temp.userData.updateOther(
          temp.victimx.id,
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

      this.userData.updateOther(
      this.victimOffline.id,
      {
        status: 'assisted',
        hero_status: 'first',
      });

      this.userData.update(
      {
        status: 'helping',
      });

      this.navCtrl.push(RescuePage, {
          user: this.victimsRef
      });
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

    showAlert(){

        let vm = this
        if(!vm.alertPresented) {
          vm.alertPresented = true
          vm.alertCtrl.create({
            title: 'Hero is on the way!',
            message: "Hi " + this.user.first_name + ". your hero is on the way!",
            buttons: [
              {
                text: 'Close',
                handler: data => {
                  this.userData.update({
                    hero_status: 'aware'
                  });
                }
              }
            ]
          }).present();
        }

    }

    cancelHero(){

      let prompt = this.alertCtrl.create({
        title: 'Cancel Hero',
        message: "Your hero is already on his/her way to help you. Why do you want to cancel it?",
        inputs: [
          {
            name: 'reason',
            placeholder: 'Type something...'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {

            }
          },
          {
            text: 'Submit',
            handler: data => {
              this.userData.update({
                hero_cancel_reason: data.reason,
                status: 'idle'
              });
              this.userRealLoop == 1;
            }
          }
        ]
      });
      prompt.present();

    }

    problemSolved(){

      let prompt = this.alertCtrl.create({
        title: 'Confirmation',
        message: "Confirm problem solved",
        buttons: [
          {
            text: 'Cancel',
            handler: data => {

            }
          },
          {
            text: 'Submit',
            handler: data => {

              this.userData.update({
                status: 'idle',
                hero: null
              });
              this.userRealLoop == 1;
              this.userData.refresh();

              this.navCtrl.push(RatingPage, {
                  user_id: this.authData.getUserData().hero
              }).then(response => {
              }).catch(e => {
                  console.log(e);
              });

            }
          }
        ]
      });
      prompt.present();

    }


    callHero(){
      this.callNumber.callNumber(this.victimOffline.phone, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
    }

    assistCanceled(){

        let vm = this
        if(!vm.alertPresented) {
          vm.alertPresented = true
          vm.alertCtrl.create({
            title: 'Your hero withdraw from helping you',
            message: "Reason: " + this.authData.getUserData().reason,
            buttons: [
              {
                text: 'Close',
                handler: data => {
                  this.userData.update({
                    status: 'broadcasting'
                  });
                }
              }
            ]
          }).present();
        }

    }
}

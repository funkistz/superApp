import { Component, ElementRef, ViewChild } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

import { Geolocation } from '@ionic-native/geolocation';
import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';
import { HomePage } from '../home/home';

declare var google;

@IonicPage()
@Component({
  selector: 'page-direction',
  templateUrl: 'direction.html',
})
export class DirectionPage {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;
  map: any;
  victim:any;
  origin:any;
  destination: any;
  lat:any;
  lng:any;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public geolocation: Geolocation,
    private callNumber: CallNumber,
    private sms: SMS,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public userData: UserProvider
  )
  {

    this.victim = navParams.get("user");
    this.destination = {lat: this.victim.lat, lng: this.victim.lng}

    this.geolocation.getCurrentPosition().then((resp) => {

      this.origin = {lat: resp.coords.latitude, lng: resp.coords.longitude};
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;

      this.startNavigating();

    }).catch((error) => {
        console.log('Error getting location', error);
    });

  }

  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){

        let latLng = new google.maps.LatLng(this.victim.lat, this.victim.lng);

        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  }

  startNavigating(){

      let directionsService = new google.maps.DirectionsService;
      let directionsDisplay = new google.maps.DirectionsRenderer;

      directionsDisplay.setMap(this.map);
      directionsDisplay.setPanel(this.directionsPanel.nativeElement);

      directionsService.route({
          origin: this.origin,
          destination: this.destination,
          travelMode: google.maps.TravelMode['DRIVING']
      }, (res, status) => {

          if(status == google.maps.DirectionsStatus.OK){
              directionsDisplay.setDirections(res);
          } else {
              console.warn(status);
          }

      });

  }

  openMap(){
    let destination = this.lat + ',' + this.lng;

    if(this.platform.is('ios')){
    	window.open('maps://?q=' + destination, '_system');
    } else {
    	let label = encodeURI(this.victim.first_name);
    	window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }
  }

  call(){
    this.callNumber.callNumber(this.victim.phone, true)
    .then(() => console.log('Launched dialer!'))
    .catch(() => console.log('Error launching dialer'));
  }

  message(){
    this.sms.send(this.victim.phone, "Hye i am your hero and i on my way to help you.");

    let toast = this.toastCtrl.create({
      message: 'SMS send',
      duration: 3000
    });
    toast.present();
  }

  cancel(){

    let prompt = this.alertCtrl.create({
      title: 'Cancel Helping!',
      message: "You can use your power to help him/her. Why do you want to cancel it?",
      inputs: [
        {
          name: 'reason',
          placeholder: 'Type something...'
        },
      ],
      buttons: [
        {
          text: 'Close',
          handler: data => {

          }
        },
        {
          text: 'Reply',
          handler: data => {

            this.userData.updateOther(
            this.victim.id,
            {
              status: 'canceled_assist',
              reason: data.reason,
              hero: null
            });

            this.userData.update({
              status: 'idle',
              victim: null
            });

            this.navCtrl.setRoot(HomePage);

          }
        }
      ]
    });
    prompt.present();

  }

  endMission(){

    this.userData.update({
      status: 'idle',
      victim: null
    });
    this.userData.refresh();

    let toast = this.toastCtrl.create({
      message: 'Mission Ended',
      duration: 3000
    });
    toast.present();

    this.navCtrl.setRoot(HomePage);
  }

}

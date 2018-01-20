import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-cancel-help',
  templateUrl: 'cancel-help.html',
})
export class CancelHelpPage {

  reason:any;
  victim:any;

  constructor(
    public navCtrl: NavController,
     public navParams: NavParams,
     public userData: UserProvider,
  ) {
    this.victim = navParams.get("user");
  }

  ionViewDidLoad() {
  }

  cancel(){
    this.navCtrl.pop();
  }

  submit(){
    this.userData.updateOther(
    this.victim.id,
    {
      status: 'canceled_assisted',
      reason: this.reason
    });
  }

}

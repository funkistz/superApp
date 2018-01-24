import { Component } from '@angular/core';
import { IonicPage,
  NavController,
  Loading,
  LoadingController,
  AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';
import { LoginPage } from '../login/login';
import {AngularFireDatabase} from 'angularfire2/database';

@IonicPage({
  name: 'signup'
})
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  public signupForm: FormGroup;
  public loading: Loading;

  constructor(
    public navCtrl: NavController,
    public authProvider: AuthProvider,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public aDB: AngularFireDatabase,
  ) {
    this.signupForm = formBuilder.group({
      email: ['',
        Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['',
        Validators.compose([Validators.minLength(6), Validators.required])],
      firstName: ['',
        Validators.compose([Validators.required])],
      lastName: ['',
        Validators.compose([Validators.required])],
      phone: ['',
        Validators.compose([Validators.required])]
    });

  }

  signupUser(){
    if (!this.signupForm.valid){
      console.log(this.signupForm.value);
    } else {
      this.authProvider.signupUser(
        this.signupForm.value.email,
        this.signupForm.value.password,
        this.signupForm.value.firstName,
        this.signupForm.value.lastName,
        this.signupForm.value.phone
      )
      .then(() => {

        this.toastCtrl.create({
          message: 'Registered Successfully',
          duration: 2000
        }).present();

        this.loading.dismiss().then( () => {
          this.navCtrl.setRoot(LoginPage);
        });

      }, (error) => {
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            message: error.message,
            buttons: [
              {
                text: "Ok",
                role: 'cancel'
              }
            ]
          });
          alert.present();
        });
      });
      this.loading = this.loadingCtrl.create();
      this.loading.present();
    }


  }

  goToLogin(): void {
    this.navCtrl.push(LoginPage);
  }

}

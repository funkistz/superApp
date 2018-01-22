import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SendHelpPage } from '../pages/send-help/send-help';
import { RescuePage } from '../pages/rescue/rescue';
import { DirectionPage } from '../pages/direction/direction';
import { CancelHelpPage } from '../pages/cancel-help/cancel-help';
import { RatingPage } from '../pages/rating/rating';

import { AuthProvider } from '../providers/auth/auth';
import { SuperProvider } from '../providers/super/super';
import { UserProvider } from '../providers/user/user';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
// for AngularFireAuth
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AgmCoreModule } from '@agm/core';
import {Geolocation} from '@ionic-native/geolocation';

import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';

// Import ionic2-rating module
import { Ionic2RatingModule } from 'ionic2-rating';

// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyCx29oB-zfGVhI1VJzZRYttSYrMtnOMie8",
  authDomain: "super-a9ce3.firebaseapp.com",
  databaseURL: "https://super-a9ce3.firebaseio.com",
  projectId: "super-a9ce3",
  storageBucket: "super-a9ce3.appspot.com",
  messagingSenderId: "700490616662"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    SendHelpPage,
    RescuePage,
    DirectionPage,
    CancelHelpPage,
    RatingPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyCx29oB-zfGVhI1VJzZRYttSYrMtnOMie8'}),
    Ionic2RatingModule // Put ionic2-rating module here
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    SendHelpPage,
    RescuePage,
    DirectionPage,
    CancelHelpPage,
    RatingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    SuperProvider,
    UserProvider,
    Geolocation,
    AngularFireDatabase,
    CallNumber,
    SMS
  ]
})
export class AppModule {}

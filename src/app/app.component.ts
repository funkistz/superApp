import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../providers/auth/auth';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import 'rxjs/add/operator/do';
import {
  AngularFirestore,
  AngularFirestoreDocument ,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  HomePage = HomePage;
  LoginPage = LoginPage;
  user:any;
  private userCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public aDB: AngularFireDatabase,
    public authData: AuthProvider,
    private afs: AngularFirestore
  )
  {

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyCx29oB-zfGVhI1VJzZRYttSYrMtnOMie8",
        authDomain: "super-a9ce3.firebaseapp.com",
        databaseURL: "https://super-a9ce3.firebaseio.com",
        projectId: "super-a9ce3",
        storageBucket: "super-a9ce3.appspot.com",
        messagingSenderId: "700490616662"
      });
    }

    const unsubscribe = firebase.auth().onAuthStateChanged( userAuth => {


      if (!userAuth) {
        this.rootPage = LoginPage;
        unsubscribe();
      } else {

        this.user = userAuth;

        this.userCollection = this.afs.collection('users', ref => ref.where('email', '==', userAuth.email).limit(1) );

        this.users = this.userCollection.snapshotChanges().map( v => {
            return v.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...data };
            });
        });

        this.users.subscribe(docs => {
          authData.setUserData(docs[0]);
          this.rootPage = HomePage;
        })

        unsubscribe();
      }
    });

    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    firebase.auth().signOut();
    this.nav.setRoot(LoginPage);
  }
}

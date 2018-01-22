import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatingPage } from './rating';

import { Ionic2RatingModule } from "ionic2-rating";

@NgModule({
  declarations: [
    RatingPage,
  ],
  imports: [
    IonicPageModule.forChild(RatingPage),
    Ionic2RatingModule // Put ionic2-rating module here
  ],
})
export class RatingPageModule {}

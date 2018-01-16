import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RescuePage } from './rescue';

@NgModule({
  declarations: [
    RescuePage,
  ],
  imports: [
    IonicPageModule.forChild(RescuePage),
  ],
})
export class RescuePageModule {}

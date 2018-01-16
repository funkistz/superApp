import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendHelpPage } from './send-help';

@NgModule({
  declarations: [
    SendHelpPage,
  ],
  imports: [
    IonicPageModule.forChild(SendHelpPage),
  ],
})
export class SendHelpPageModule {}

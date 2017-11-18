import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MushonkeyComponent } from './components/MushonkeyComponent';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    MushonkeyComponent
  ],
  exports: [
    MushonkeyComponent
  ]
})
export class MushonkeyModule { }

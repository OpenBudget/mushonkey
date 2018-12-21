import { NgModule } from '@angular/core';
import { MushonkeyComponent } from './mushonkey.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MushonkeyComponent],
  imports: [
    CommonModule
  ],
  exports: [MushonkeyComponent]
})
export class MushonkeyModule { }

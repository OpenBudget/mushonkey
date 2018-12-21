import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MushonkeyModule } from 'mushonkey';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MushonkeyModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

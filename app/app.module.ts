import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MushonkeyModule } from '../src';

import { AppComponent } from './app.component';
import {MushonkeyComponent} from "../src/components/MushonkeyComponent";
import {FormsModule} from "@angular/forms";

declare const process: any;

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    MushonkeyModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}

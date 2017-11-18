import 'core-js/client/shim.min.js';
import 'reflect-metadata';
import 'zone.js';

declare const process: any;

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

if (process.env.NODE_ENV === 'production') {
    enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule);

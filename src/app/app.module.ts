import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MapOneComponent } from './components/map-one/map-one.component';
import { MapTwoComponent } from './components/map-two/map-two.component';

@NgModule({
  declarations: [
    AppComponent,
    MapOneComponent,
    MapTwoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MapOneComponent } from './components/map-one/map-one.component';
import { MapTwoComponent } from './components/map-two/map-two.component';
import { MapDemoComponent } from './components/map-demo/map-demo.component';
import { NgZorroAntdModule } from './ng-zorro-antd.module';

@NgModule({
  declarations: [
    AppComponent,
    MapOneComponent,
    MapTwoComponent,
    MapDemoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

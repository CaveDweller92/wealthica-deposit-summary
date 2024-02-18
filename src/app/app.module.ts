import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
 
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainModule } from './main/main.module';

@NgModule({
  declarations: [AppComponent], 
  imports: [BrowserModule, AppRoutingModule, MainModule], 
  providers: [], 
  bootstrap: [AppComponent],
})
export class AppModule { }

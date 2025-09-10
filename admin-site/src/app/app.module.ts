import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './shared/auth/auth.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { AngularMaterialsModule } from './angular-materials/angular-materials.module';

//Firebase
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DialogScheduleDetailsComponent } from './components/schedule/dialog-schedule-details/dialog-schedule-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    AuthComponent,
    DialogScheduleDetailsComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    AngularMaterialsModule,
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './shared/auth/auth.component';
import { authGuard } from './services/auth.guard';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookingsComponent } from './components/bookings/bookings/bookings.component';
import { BookingDetailsComponent } from './components/bookings/booking-details/booking-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'bookings/:id',
    component: BookingDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import(
        './components/organisation-settings/organisation-settings.module'
      ).then((m) => m.OrganisationSettingsModule),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: '**',
    component: ScheduleComponent,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

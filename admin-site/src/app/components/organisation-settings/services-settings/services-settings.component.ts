import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganisationService } from 'src/app/services/organisation/organisation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-services-settings',
    templateUrl: './services-settings.component.html',
    styleUrls: ['./services-settings.component.scss'],
    standalone: false
})
export class ServicesSettingsComponent implements OnInit {
  loading: boolean = false;
  errorMessage: string = '';
  servicesForm: FormGroup = new FormGroup({});
  servicesData: any = [];


  constructor(
    private fb: FormBuilder,
    private organisationService: OrganisationService,
    private _snackBar: MatSnackBar
  ) { }
  ngOnInit(): void {
    this.getServices();
  }

  async getServices() {
    this.loading = true;
    try {
      this.servicesData = await this.organisationService.getServices() || [];
      const servicesFGs = this.servicesData.map((service:any) =>
        this.fb.group({
          id: [service.id],
          name: [service.name, [Validators.required, Validators.min(1)]],
          rate: [service.rate, [Validators.required, Validators.min(1)]],
        })
      );
      this.servicesForm = this.fb.group({
        services: this.fb.array(servicesFGs)
      });
    } catch (err) {
      this.errorMessage = 'Error occurred while fetching services';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }


  addService() {
    let newService = {id:'', rate: 0, name: '' };

    this.servicesData.push(newService);

    const servicesArray = this.servicesForm.get('services') as FormArray;
    servicesArray.push(
      this.fb.group({
        id: [newService.id],
        name: [newService.name, [Validators.required, Validators.min(1)]],
        rate: [newService.rate, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeService(index: number) {
    this.servicesData.splice(index, 1);

    const servicesArray = this.servicesForm.get('services') as FormArray;
    servicesArray.removeAt(index);
  }


  async saveServices(event: Event) {
    event.preventDefault();

    if (this.servicesForm.invalid) {
      this.errorMessage = 'Please fill all the required fields';
      return;
    }

    this.errorMessage = '';

    let response = await this.organisationService.updateServices(this.servicesForm.value.services);

    if (response.success) {

      let savedData = response.data;

      const servicesFGs = savedData.map((service:any) =>
      this.fb.group({
        id: [service.id],
        name: [service.name, [Validators.required, Validators.min(1)]],
        rate: [service.rate, [Validators.required, Validators.min(1)]],
      })
      );

    this.servicesForm = this.fb.group({
      services: this.fb.array(servicesFGs)
    });

      this.openSnackBar('Saved', 'Close');
      return;
    }

    this.openSnackBar('Something went wrong', 'Close');
  }


  openSnackBar(message: string, action: string, duration: number = 2000) {
    this._snackBar.open(message, action);
  }



}

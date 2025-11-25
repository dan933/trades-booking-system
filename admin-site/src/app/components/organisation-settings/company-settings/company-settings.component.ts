import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OrganisationService } from 'src/app/services/organisation/organisation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss'],
  standalone: false,
})
export class CompanySettingsComponent implements OnInit {
  companySettingsForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    number: ['', [Validators.required, Validators.pattern('^[0-9+s]*$')]],
    ABN: ['', [Validators.required, Validators.pattern('^[0-9s]*$')]],
    gst: [false, [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private organisationService: OrganisationService,
    private _snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.getOrgSettings();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  async getOrgSettings() {
    let orgSettings: any = await this.organisationService.getOrganisation();

    this.companySettingsForm.patchValue({
      name: orgSettings.name,
      email: orgSettings.email,
      number: orgSettings.number,
      ABN: orgSettings.ABN,
      gst: orgSettings.gst ? orgSettings.gst : false,
    });
  }

  async save() {
    if (this.companySettingsForm.invalid) {
      return;
    }

    await this.organisationService
      .updateOrganisation(this.companySettingsForm.value)
      .then((res) => {
        this.openSnackBar('Saved', 'Close');
      })
      .catch((err) => {
        console.log(err.message);
        this.openSnackBar('Error', 'Close');
      });
  }
}

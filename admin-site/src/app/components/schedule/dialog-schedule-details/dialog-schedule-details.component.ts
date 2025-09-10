import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingService } from 'src/app/services/booking/booking.service';
@Component({
    selector: 'app-dialog-schedule-details',
    templateUrl: './dialog-schedule-details.component.html',
    styleUrls: ['./dialog-schedule-details.component.scss'],
    standalone: false
})
export class DialogScheduleDetailsComponent {
  viewType: string = 'overview';
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogScheduleDetailsComponent>,
    private bookingService: BookingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  async refund() {
    //start loading
    let bookingId = this.data.schedule.id;
    this.loading = true;

    await this.bookingService.refundBooking(bookingId).then((resp) => {

      console.log(resp, "line 27")

      this.dialogRef.close(resp);
      this.loading = false;
    }).catch((err) => {
      this.dialogRef.close(err);
      this.loading = false;
    });

  }

}

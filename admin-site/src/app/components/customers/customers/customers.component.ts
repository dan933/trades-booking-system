import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { CustomerService } from 'src/app/services/customer/customer.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  standalone: false,
})
@Injectable({ providedIn: 'root' })
export class CustomersComponent implements OnInit {
  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  customers: {
    id: string;
    address: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }[] = [];

  loading = false;
  lastDocument: QueryDocumentSnapshot<DocumentData, DocumentData> | undefined;
  hasMore: boolean = true;
  searchTerm: string = '';
  searchTimeout: any;

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.resetAndGetCustomers();
    }, 300);
  }

  private resetAndGetCustomers() {
    this.lastDocument = undefined;
    this.hasMore = true;
    this.getCustomers();
  }

  async getCustomers() {
    this.loading = true;
    try {
      const resp = await this.customerService.getCustomers(
        30,
        this.lastDocument,
        this.searchTerm || undefined
      );

      if (this.lastDocument) {
        this.customers = [...this.customers, ...resp.customers];
      } else {
        this.customers = resp.customers;
      }
      this.lastDocument = resp?.lastDocument;
      this.hasMore = resp.hasMore;
    } finally {
      this.loading = false;
    }
  }

  goToDetails(customerId: string) {
    this.router.navigate(['/customers', customerId]);
  }
  ngOnInit(): void {
    this.getCustomers();
  }
}

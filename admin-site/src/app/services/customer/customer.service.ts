import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

import {
  collection,
  where,
  query,
  getDocs,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter,
  getDoc,
  doc,
  DocumentData,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async getCustomer(customerId: string) {
    const userToken = await this.auth.currentUser?.getIdTokenResult();
    const orgId = userToken?.claims['org'];

    const customerDoc = await getDoc(
      doc(this.firestore, `organisations/${orgId}/users/${customerId}`)
    );

    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }

    const data = customerDoc?.data();

    return {
      id: customerDoc.id,
      address: data['addressList']?.[0] || '',
      email: data['email'] || '',
      firstName: data['firstName'] || '',
      lastName: data['lastName'] || '',
      phoneNumber: data['phoneNumber'] || '',
    };
  }

  async getCustomers(
    size: number = 30,
    lastDocument?: QueryDocumentSnapshot<DocumentData>,
    search?: string
  ) {
    const userToken = await this.auth.currentUser?.getIdTokenResult();
    const orgId = userToken?.claims['org'];

    const customersCol = collection(
      this.firestore,
      `organisations/${orgId}/users`
    );

    let q = query(
      customersCol,
      ...(search
        ? [
            where('email', '>=', search?.toLowerCase()),
            where('email', '<=', search.toLowerCase() + '\uf8ff'),
          ]
        : []),
      orderBy('email'),
      ...(lastDocument ? [startAfter(lastDocument)] : []),
      limit(size)
    );

    let snapshot = await getDocs(q);

    let customers: {
      id: string;
      address: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    }[] = snapshot.docs.map((doc) => {
      let data = doc.data();

      return {
        id: doc.id,
        address: data['addressList']?.[0] || '',
        email: data['email'] || '',
        firstName: data['firstName'] || '',
        lastName: data['lastName'] || '',
        phone: data['phoneNumber'],
      };
    });

    return {
      customers,
      hasMore: snapshot.docs.length === size,
      lastDocument: snapshot.docs[snapshot.docs.length - 1],
    };
  }
}

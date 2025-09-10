import { Injectable, inject } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import {
  Firestore,
  // collection,
  // doc,
  // getDoc,
  updateDoc,
  // setDoc,
  DocumentReference,
  addDoc,
} from '@angular/fire/firestore';

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async getOrganisation() {
    // console.log(this.auth.currentUser);
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    console.log('orgId', orgId);

    if (!orgId) {
      return {
        error: 'No organisation found',
        success: false,
      };
    }

    //get the organisation from firestore
    let org = doc(this.firestore, `organisations/${orgId}`);
    let orgData = (await getDoc(org)).data();

    return orgData;
  }

  async updateOrganisation(orgData: any) {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    if (!orgId) {
      return {
        error: 'No organisation found',
        success: false,
      };
    }

    try {
      await setDoc(doc(this.firestore, `organisations/${orgId}`), orgData, {
        merge: true,
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        error: error,
        success: false,
      };
    }
  }

  //get org settings opperating hours
  async getOrganisationSettings() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    //get the organisation from firestore
    let orgSettings = doc(
      this.firestore,
      `organisations/${orgId}/availability/opperatingHours`
    );

    let orgSettingsData = (await getDoc(orgSettings)).data();

    return orgSettingsData;
  }

  //format data for user
  formatOpperatingHours(gapSettings: any, opperatingHours: any) {
    console.log(gapSettings);
    console.log('opperatingHours', opperatingHours);

    const opperatingHoursData: any = opperatingHours.openingTimes.reduce(
      (acc: any, curr: any) => {
        console.log('curr', curr);
        acc[curr.day] = {
          end: curr?.to?.value || 16,
          start: curr?.from?.value || 9,
          open: curr.checked || false,
        };

        return acc;
      },
      {}
    );

    let formattedData = {
      gapBetween: gapSettings?.gapBetweenAppointments || 1,
      bookMonthsAheadLimit: gapSettings?.bookMonthsAheadLimit || 1,
      openingTimes: opperatingHoursData,
    };

    return formattedData;
  }

  //update org settings
  async updateOpperatingHours(gapSettings: any, opperatingHours: any) {
    let payload = this.formatOpperatingHours(gapSettings, opperatingHours);

    //get user claims
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    console.log('payload', payload);

    try {
      await setDoc(
        doc(
          this.firestore,
          `organisations/${orgId}/availability/opperatingHours`
        ),
        {
          ...payload,
        }
      );

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  //get services
  async getServices() {
    //get user claims
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    //get the organisation from firestore
    let services = doc(
      this.firestore,
      `organisations/${orgId}/availability/services`
    );
    let servicesData = (await getDoc(services)).data();
    servicesData = servicesData ? servicesData['services'] : [];
    return servicesData;
  }

  //add and update services
  async updateServices(services: any) {
    //get user claims
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    console.log('services', services);

    //if services do not have an Id then add one
    services = services.map((service: any) => {
      if (!service.id) {
        let newDocId = doc(
          collection(this.firestore, `organisations/${orgId}/availability`)
        ).id;

        service.id = newDocId;
      }

      return service;
    });

    try {
      await setDoc(
        doc(this.firestore, `organisations/${orgId}/availability/services`),
        {
          services: services,
        }
      );

      return {
        data: services,
        success: true,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
      };
    }
  }
}

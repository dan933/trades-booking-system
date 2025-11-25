import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  Auth,
  idToken,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: false,
})
export class AuthComponent implements OnInit, OnDestroy {
  private auth: Auth = inject(Auth);
  idToken$ = idToken(this.auth);
  idTokenSubscription: Subscription;
  hide = true;
  loginForm: FormGroup = new FormGroup({});
  loading = false;

  view = 'login';

  isDemoLogin = false;

  constructor(public router: Router, private fb: FormBuilder) {
    this.idTokenSubscription = this.idToken$.subscribe(
      (token: string | null) => {
        //handle idToken changes here. Note, that user will be null if there is no currently logged in user.
        if (token) {
          //If user is logged in, navigate to home page
          this.router.navigate(['/schedule']);
        }
      }
    );
  }
  ngOnDestroy(): void {
    this.idTokenSubscription.unsubscribe();
  }
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  forgotPassword() {
    this.view = 'reset';
  }

  async resetPassword(event: Event) {
    event.preventDefault();

    if (this.loginForm.get('email')?.valid) {
      this.loading = true;
      try {
        await sendPasswordResetEmail(this.auth, this.loginForm.value['email']);
        this.loginForm.setErrors(null);
        this.view = 'login';
        this.loading = false;
      } catch (error: any) {
        this.loginForm.setErrors({ failed: true });
        this.loading = false;
      }
    }
  }

  backToLogin() {
    this.view = 'login';
  }

  login(event: Event) {
    event.preventDefault();

    if (this.isDemoLogin) {
      this.loginForm.get('email')?.setValue(environment?.demoEmail || '');
      this.loginForm.get('password')?.setValue(environment?.demoPassword || '');
    }

    if (this.loginForm.valid) {
      this.loading = true;
      signInWithEmailAndPassword(
        this.auth,
        this.loginForm.value['email'],
        this.loginForm.value['password']
      )
        .then((userCredential: any) => {
          //reset errors
          this.loginForm.setErrors(null);
          this.loading = false;

          //Navigate to home page
          this.router.navigate(['/dashboard']);
        })
        .catch((error) => {
          console.log(error?.message, error?.code);
          if (
            error?.code === 'auth/user-not-found' ||
            error?.code === 'auth/wrong-password'
          ) {
            this.loginForm.setErrors({ incorrect: true });
          } else {
            this.loginForm.setErrors({ failedAttempts: true });
          }
          this.loading = false;
        });
    }
  }
  toggleHide(event: Event) {
    event.preventDefault();
    this.hide = !this.hide;
  }
}

import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
} from "firebase/auth";

var authService = {
  registerUser: async (registerUserObject) => {
    const auth = getAuth();
    try {
      const email = registerUserObject.email;
      const password = registerUserObject.password;

      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      return response;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        let email = registerUserObject.email;

        let userSignInMethods = await fetchSignInMethodsForEmail(auth, email);
        let firstSignInMethod =
          userSignInMethods?.length > 0 ? userSignInMethods[0] : "";

        return {
          IsUserDifferentCredentials: true,
          firstSignInMethod: firstSignInMethod,
          // customData: error?.customData,
          // tokenResponse: error?.customData?._tokenResponse,
          error: error,
          registerUserObject: registerUserObject,
        };
      }

      return { errorCode: error.code, errorMessage: error.message };
    }
  },
  signIn: async ({ providerName, user }, org) => {
    //An organisation must be present in url
    if (!org) {
      alert("No Organisation found in url");
      return;
    }

    //Creates auth instance
    const auth = getAuth();

    try {
      if (providerName === "email") {
        let response = await signInWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        return {
          IsLoginSuccess: true,
          response: response,
        };
      }

      if (providerName === "Guest") {
        return {
          IsGuest: true,
        };
      }

      //get provider
      let provider =
        providerName === "Google"
          ? new GoogleAuthProvider()
          : providerName === "Facebook"
          ? new FacebookAuthProvider()
          : null;

      const result = await signInWithPopup(auth, provider);
      return {
        result: result,
        IsLoginSuccess: true,
      };

      //if true return result if error return auth/account-exists-with-different-credential details
    } catch (error) {
      //if the error is Incorrect password
      if (error.code === "auth/wrong-password") {
        return {
          IsLoginSuccess: false,
          IsPasswordIncorrect: true,
          errorMessage: "Incorrect Password",
        };
      }

      if (error.code === "auth/user-not-found") {
        return {
          IsLoginSuccess: false,
          IsPasswordIncorrect: true,
          errorMessage: "Incorrect Password",
        };
      }

      if (error.code === "auth/account-exists-with-different-credential") {
        let email = error.customData.email;
        let pendingCredential = error.credential;

        let userSignInMethods = await fetchSignInMethodsForEmail(auth, email);
        let firstSignInMethod =
          userSignInMethods?.length > 0 ? userSignInMethods[0] : "";

        return {
          IsUserDifferentCredentials: true,
          firstSignInMethod: firstSignInMethod,
          pendingCredential: pendingCredential,
          pendingProvider: error?.customData?._tokenResponse?.providerId,
          userSignInMethods: userSignInMethods,
          tokenResponse: error?.customData?._tokenResponse,
          error: error,
        };
      } else {
        return error;
      }
    }
  },
  resetPassword: async (email) => {
    const auth = getAuth();

    try {
      const response = await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      return true;
    }
  },
  getProviderForProviderId: function (providerId) {
    switch (providerId) {
      case GoogleAuthProvider.PROVIDER_ID:
        return new GoogleAuthProvider();
      case FacebookAuthProvider.PROVIDER_ID:
        return new FacebookAuthProvider();
      default:
        return null;
    }
  },
  signInWithExistingAccount: async function (signInResponse) {
    if (signInResponse?.firstSignInMethod === "password") {
      signInWithEmailAndPassword(
        userCredentials.email,
        userCredentials.password
      )
        .then((result) => {
          result.user.linkAccounts(userCredentials?.tokenResponse);
        })
        .then(() => {
          this.$router.push(`/org/${org}/book`);
        })
        .catch(() => {
          //error message here
        });

      return;
    }

    let provider = this.getProviderForProviderId(
      signInResponse?.firstSignInMethod
    );

    const auth = getAuth();

    const response = await signInWithPopup(auth, provider);

    let IsSameToExistingEmailSignIn =
      signInResponse?.tokenResponse?.email === response?.user?.email ||
      signInResponse?.registerUserObject?.email === response?.user?.email;

    if (response?.user?.uid) {
      return {
        IsSameToExistingEmailSignIn: IsSameToExistingEmailSignIn,
        success: true,
      };
    } else {
      return false;
    }
  },
  linkAccounts: async function (signInResponse) {
    const auth = getAuth();

    try {
      if (signInResponse?.registerUserObject) {
        const credential = EmailAuthProvider.credential(
          signInResponse?.registerUserObject.email,
          signInResponse?.registerUserObject.password
        );
        await linkWithCredential(auth.currentUser, credential);

        return {
          IsSuccess: true,
        };
      } else if (signInResponse?.user) {
        await signInWithEmailAndPassword(
          auth,
          signInResponse?.user.email,
          signInResponse?.user.password
        );

        const providerId = signInResponse?.pendingProvider;
        const provider = this.getProviderForProviderId(providerId);
        await linkWithPopup(auth.currentUser, provider);
      } else {
        const providerId = signInResponse?.pendingProvider;
        const provider = this.getProviderForProviderId(providerId);
        await linkWithPopup(auth.currentUser, provider);
      }

      return {
        IsSuccess: true,
      };
    } catch (error) {
      if (error?.code === "auth/wrong-password") {
        return {
          IsError: true,
          message: "Password Incorrect",
        };
      }

      if (error?.code === "auth/email-already-in-use") {
        return {
          IsSuccess: true,
        };
      }
    }
  },
};

export { authService };

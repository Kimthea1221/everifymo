//Auth.js
document.addEventListener('DOMContentLoaded', () => {
  const emailField = document.getElementById('email-field');
  const otpField = document.getElementById('otp-field');
  const otpDigitInputs = Array.from(document.querySelectorAll('.otp-digit-input'));
  const otpError = document.getElementById('otp-error');
  const otpDevPreview = document.getElementById('otp-dev-preview');
  const otpVerifyButton = document.getElementById('otp-verify-button');
  const resendOtpLink = document.getElementById('resend-otp-link');
  const backFromOtpLink = document.getElementById('back-from-otp-link');
  let otpPendingEmail = '';
  let otpPendingMode = 'signin';
  const forgotPasswordFields = document.getElementById('forgot-password-fields');
  const forgotConfirmButton = document.getElementById('forgot-confirm-button');
  const newPasswordInput = document.getElementById('new-password');
  const confirmNewPasswordInput = document.getElementById('confirm-new-password');
  const newPasswordError = document.getElementById('new-password-error');
  const confirmNewPasswordError = document.getElementById('confirm-new-password-error');
  const tabsContainer = document.querySelector('.tabs');
  const orDivider = document.querySelector('.or-divider');
  const tabs = document.querySelectorAll('[data-auth-mode]');
  const usernameField = document.getElementById('signup-username-field');
  const usernameInput = document.getElementById('username');
  const usernameError = document.getElementById('username-error');
  const emailInput = document.getElementById('email');
  const signinPasswordField = document.getElementById('signin-password-field');
  const passwordInput = document.getElementById('password');
  const signupPasswordFields = document.getElementById('signup-password-fields');
  const createPasswordInput = document.getElementById('create-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const backToSigninLink = document.getElementById('back-to-signin-link');
  const noticeTitle = document.getElementById('auth-notice-title');
  const noticeText = document.getElementById('auth-notice-text');
  const primaryButton = document.getElementById('auth-primary-button');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const createPasswordError = document.getElementById('create-password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');
  const forgotLink = document.querySelector('.forgot-link');
  const guestBtn = document.getElementById('btn-guest');

  // --- Password show/hide eye icon toggle ---
  document.querySelectorAll('.toggle-password-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector('.eye-icon');
      if (!input) return;

      const willShow = input.type === 'password';
      input.type = willShow ? 'text' : 'password';
      if (icon) {
        icon.src = willShow
          ? '../assets/images/eye_close_icon.png'
          : '../assets/images/eye_open_icon.png';
      }
      btn.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
    });
  });

  // --- check if the screen is currently in signin/singup mode
  let currentMode = 'signin';

  // --- text for each mode (swapped in by updateMode() below)
  const authModes = {
    signin: {
      title: 'Signing in is optional',
      text: 'You can still verify products and submit complaints as a guest. Sign in or Sign up to view your verification history, complaints, and report status.',
      buttonLabel: 'Sign In',
      documentTitle: 'E-VERIFY | Sign In'
    },
    signup: {
      title: 'Signing up is optional',
      text: 'You can still verify products and submit complaints as a guest. Sign in or Sign up to view your verification history, complaints, and report status.',
      buttonLabel: 'Sign Up',
      documentTitle: 'E-VERIFY | Sign Up'
    }
  };

  // Wipes every validation error message and red "invalid" outline back to clean
  const clearErrors = () => {
    [emailError, passwordError, createPasswordError, confirmPasswordError, usernameError].forEach((errorNode) => {
      if (errorNode) {
        errorNode.textContent = '';
      }
    });

    [emailInput, passwordInput, createPasswordInput, confirmPasswordInput, usernameInput].forEach((inputNode) => {
      if (inputNode) {
        inputNode.classList.remove('is-invalid');
      }
    });
  };

  // --- put a error message on <p> elements
  const setError = (node, message) => {
    if (node) {
      node.textContent = message;
    }
  };

  // --- if the email is valid ---
  const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

  // --- password rule ---
  const isStrongPassword = (value) => {
    const hasMinimumLength = value.length >= 8;
    const hasLetter = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasMinimumLength && hasLetter && hasNumber;
  };

  // Switches the whole form between "Sign In" view and "Sign Up" view
  const updateMode = (mode) => {
    currentMode = mode;
    const settings = authModes[mode] || authModes.signin;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.authMode === mode;
      tab.classList.toggle('active', isActive);
      tab.classList.toggle('inactive', !isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    if (noticeTitle) {
      noticeTitle.textContent = settings.title;
    }

    if (noticeText) {
      noticeText.textContent = settings.text;
    }

    if (primaryButton) {
      primaryButton.textContent = settings.buttonLabel;
    }

    if (usernameField) {
      usernameField.hidden = mode !== 'signup';
    }

    if (signupPasswordFields) {
      signupPasswordFields.hidden = mode !== 'signup';
    }

    if (signinPasswordField) {
      signinPasswordField.hidden = mode === 'signup';
    }

    if (forgotLink) {
      forgotLink.hidden = mode === 'signup';
    }

    clearErrors();

    document.title = settings.documentTitle;
    window.location.hash = mode;
  };

  // Reads the 6 individual OTP boxes and joins them into one string
  function getOtpValue() {
    return otpDigitInputs.map(inp => inp.value).join('');
  }

  // Empties all 6 OTP boxes and puts the cursor back in the first one
  function clearOtpInputs() {
    otpDigitInputs.forEach(inp => {
      inp.value = '';
      inp.classList.remove('is-invalid');
    });
    if (otpDigitInputs[0]) otpDigitInputs[0].focus();
  }

  // --- Makes the 6 OTP boxes behave like one connected input ---
  otpDigitInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && index < otpDigitInputs.length - 1) {
        otpDigitInputs[index + 1].focus();
      }
    });

    // Backspace on an empty box: jump back to the previous box
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpDigitInputs[index - 1].focus();
      }
    });

    // Pasting a full code: spread the digits across all 6 boxes at once
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, otpDigitInputs.length);
      pasted.split('').forEach((digit, i) => {
        if (otpDigitInputs[i]) otpDigitInputs[i].value = digit;
      });
      const nextIndex = Math.min(pasted.length, otpDigitInputs.length - 1);
      otpDigitInputs[nextIndex].focus();
    });
  });

  // ---- Forgot Password mode switching — defined once, not inside updateMode ----
  function enterForgotMode() {
    if (tabsContainer) tabsContainer.classList.add('hidden');
    if (usernameField) usernameField.hidden = true;
    if (signinPasswordField) signinPasswordField.hidden = true;
    if (signupPasswordFields) signupPasswordFields.hidden = true;
    if (forgotPasswordFields) forgotPasswordFields.hidden = false;
    if (primaryButton) primaryButton.classList.add('hidden');
    if (forgotConfirmButton) forgotConfirmButton.classList.remove('hidden');
    if (backToSigninLink) backToSigninLink.classList.remove('hidden');
    if (orDivider) orDivider.classList.add('hidden');
    if (guestBtn) guestBtn.classList.add('hidden');

    if (noticeTitle) noticeTitle.textContent = 'Reset your password';
    if (noticeText) noticeText.textContent = 'Enter your account email and choose a new password.';

    clearErrors();
    if (newPasswordError) newPasswordError.textContent = '';
    if (confirmNewPasswordError) confirmNewPasswordError.textContent = '';
  }
  
  // Switches the screen into "enter your OTP code" view. 
  // (Called right after signup or login succeeds — email/mode are passed in)
  function enterOtpMode(email, mode) {
    otpPendingEmail = email;  // remember which account this code belongs to
    otpPendingMode = mode;    // remember whether this came from signup or signin

    // Hide everything from the normal signin/signup form...
    if (tabsContainer) tabsContainer.classList.add('hidden');
    if (usernameField) usernameField.hidden = true;
    if (emailField) emailField.hidden = true;
    if (signinPasswordField) signinPasswordField.hidden = true;
    if (signupPasswordFields) signupPasswordFields.hidden = true;
    if (forgotPasswordFields) forgotPasswordFields.hidden = true;
    if (primaryButton) primaryButton.classList.add('hidden');
    if (forgotConfirmButton) forgotConfirmButton.classList.add('hidden');
    if (backToSigninLink) backToSigninLink.classList.add('hidden');
    if (orDivider) orDivider.classList.add('hidden');
    if (guestBtn) guestBtn.classList.add('hidden');

    // ...and show the OTP entry screen instead
    if (otpField) otpField.hidden = false;
    if (otpVerifyButton) {
      otpVerifyButton.classList.remove('hidden');
      otpVerifyButton.textContent = mode === 'signup' ? 'Verify and Sign Up' : 'Verify and Sign In';
    }
    if (resendOtpLink) resendOtpLink.hidden = false;
    if (backFromOtpLink) {
      backFromOtpLink.hidden = false;
      backFromOtpLink.textContent = mode === 'signup' ? 'Back to Sign Up' : 'Back to Sign In';
    }

    if (noticeTitle) noticeTitle.textContent = 'Verify your email';
    if (noticeText) noticeText.textContent = `Enter the 6-digit code sent to ${email}.`;

    if (otpError) otpError.textContent = '';
    clearOtpInputs();

  }

  // Reverses enterOtpMode — goes back to showing the normal signin/signup form
  function exitOtpMode() {
    if (otpField) otpField.hidden = true;
    if (otpVerifyButton) otpVerifyButton.classList.add('hidden');
    if (resendOtpLink) resendOtpLink.hidden = true;
    if (backFromOtpLink) backFromOtpLink.hidden = true;
    if (emailField) emailField.hidden = false;
    if (primaryButton) primaryButton.classList.remove('hidden');
    if (tabsContainer) tabsContainer.classList.remove('hidden');
    if (orDivider) orDivider.classList.remove('hidden');
    if (guestBtn) guestBtn.classList.remove('hidden');

    updateMode(otpPendingMode === 'signup' ? 'signup' : 'signin');
  }

  // Reverses enterForgotMode — goes back to the normal signin form
  function exitForgotMode() {
    if (forgotPasswordFields) forgotPasswordFields.hidden = true;
    if (forgotConfirmButton) forgotConfirmButton.classList.add('hidden');
    if (backToSigninLink) backToSigninLink.classList.add('hidden');
    if (primaryButton) primaryButton.classList.remove('hidden');
    if (tabsContainer) tabsContainer.classList.remove('hidden');
    if (orDivider) orDivider.classList.remove('hidden');
    if (guestBtn) guestBtn.classList.remove('hidden');

    updateMode('signin');
  }

  // Checks the signin/signup form fields before submitting.
  // Returns true only if everything required is filled in correctly.
  const validateForm = () => {
    clearErrors();

    const emailValue = emailInput ? emailInput.value.trim() : '';
    let isValid = true;

    if (!emailValue) {
      setError(emailError, 'Email is required.');
      if (emailInput) {
        emailInput.classList.add('is-invalid');
      }
      isValid = false;
    } else if (!isValidEmail(emailValue)) {
      setError(emailError, 'Enter a valid email address.');
      if (emailInput) {
        emailInput.classList.add('is-invalid');
      }
      isValid = false;
    }

    // Extra checks that only apply when signing up (not signing in)
    if (currentMode === 'signup') {
      const usernameValue = usernameInput ? usernameInput.value.trim() : '';
        if (!usernameValue) {
          setError(usernameError, 'Username is required.');
          if (usernameInput) usernameInput.classList.add('is-invalid');
          isValid = false;
        }
      const createPasswordValue = createPasswordInput ? createPasswordInput.value : '';
      const confirmPasswordValue = confirmPasswordInput ? confirmPasswordInput.value : '';

      if (!createPasswordValue) {
        setError(createPasswordError, 'Create a password.');
        if (createPasswordInput) {
          createPasswordInput.classList.add('is-invalid');
        }
        isValid = false;
      } else if (!isStrongPassword(createPasswordValue)) {
        setError(createPasswordError, 'Password must be at least 8 characters and include a letter and a number.');
        if (createPasswordInput) {
          createPasswordInput.classList.add('is-invalid');
        }
        isValid = false;
      }

      if (!confirmPasswordValue) {
        setError(confirmPasswordError, 'Confirm your password.');
        if (confirmPasswordInput) {
          confirmPasswordInput.classList.add('is-invalid');
        }
        isValid = false;
      } else if (createPasswordValue !== confirmPasswordValue) {
        setError(confirmPasswordError, 'Passwords do not match.');
        if (confirmPasswordInput) {
          confirmPasswordInput.classList.add('is-invalid');
        }
        isValid = false;
      }
    }

    // Signin-only check: just needs a password typed in
    else if (!passwordInput || !passwordInput.value) {
      setError(passwordError, 'Password is required.');
      if (passwordInput) {
        passwordInput.classList.add('is-invalid');
      }
      isValid = false;
    }

    return isValid;
  };

  // Show signup tab first if the URL is "#signup", otherwise default to signin
  const initialMode = window.location.hash === '#signup' ? 'signup' : 'signin';
  updateMode(initialMode);

  // Clicking "Sign In" / "Sign Up" tabs switches the form mode
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      updateMode(tab.dataset.authMode);
    });
  });

  // "Continue as guest" — skips login entirely
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      logoutUser(() => {
        window.location.href = 'report-complaint.html';
      });
    });
  }

  // "Back to sign in" from the forgot-password screen
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      enterForgotMode();
    });
  }

  if (backToSigninLink) {
    backToSigninLink.addEventListener('click', (e) => {
      e.preventDefault();
      newPasswordInput.value = '';
      confirmNewPasswordInput.value = '';
      exitForgotMode();
    });
  }

  // Submits a password reset request (email + new password)
  if (forgotConfirmButton) {
    forgotConfirmButton.addEventListener('click', () => {
      clearErrors();
      if (newPasswordError) newPasswordError.textContent = '';
      if (confirmNewPasswordError) confirmNewPasswordError.textContent = '';

      const emailValue = emailInput ? emailInput.value.trim() : '';
      const newPw = newPasswordInput ? newPasswordInput.value : '';
      const confirmPw = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';
      let isValid = true;

      if (!emailValue || !isValidEmail(emailValue)) {
        setError(emailError, 'Enter a valid email address.');
        if (emailInput) emailInput.classList.add('is-invalid');
        isValid = false;
      }
      if (!isStrongPassword(newPw)) {
        setError(newPasswordError, 'Password must be at least 8 characters and include a letter and a number.');
        if (newPasswordInput) newPasswordInput.classList.add('is-invalid');
        isValid = false;
      }
      if (newPw && newPw !== confirmPw) {
        setError(confirmNewPasswordError, 'Passwords do not match.');
        if (confirmNewPasswordInput) confirmNewPasswordInput.classList.add('is-invalid');
        isValid = false;
      }

      if (!isValid) return;

      resetPasswordDirect(emailValue, newPw, (success, errorMsg) => {
        if (!success) {
          setError(emailError, errorMsg || 'Account does not exist.');
          if (emailInput) emailInput.classList.add('is-invalid');
          return;
        }
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
        exitForgotMode();
      });
    });
  }

  // flash message after redirect to clear previous message
  const flashMessage = sessionStorage.getItem('authFlashMessage');
  const flashType = sessionStorage.getItem('authFlashType');

  if (flashMessage) {
    const noticeBanner = document.querySelector('.notice-banner');

    noticeTitle.textContent = "You're verified!";
    noticeText.textContent = flashMessage;

    if (flashType === 'success') {
      noticeBanner.classList.add('notice-banner-success');
    }

    // Clear it so a page refresh doesn't show it again
    sessionStorage.removeItem('authFlashMessage');
    sessionStorage.removeItem('authFlashType');
  }

  // Clicking "Verify and Sign In/Up" — collects the 6 digits and checks them with the backend
  if (otpVerifyButton) {
    otpVerifyButton.addEventListener('click', () => {
      if (otpError) otpError.textContent = '';
      const enteredCode = getOtpValue();

      if (enteredCode.length < 6) {
        setError(otpError, 'Please enter all 6 digits.');
        otpDigitInputs.forEach(inp => { if (!inp.value) inp.classList.add('is-invalid'); });
        return;
      }

      // otpPendingEmail was filled in back when enterOtpMode() ran —
      // that's the account this code is being checked against
      verifyOtp(otpPendingEmail, enteredCode, (success, errorMsg) => {
        if (!success) {
          setError(otpError, 'Incorrect code. Please try again.');
          otpDigitInputs.forEach(inp => inp.classList.add('is-invalid'));
          return;
        }
        // Flash-style message, after redirect (successful signup)
        sessionStorage.setItem('authFlashMessage', 'Account verified! Please login to continue.');
        sessionStorage.setItem('authFlashType', 'success');
        
        window.location.href = 'auth.html';
      });
    });
  }

  // "Resend code" — asks the backend to generate and email a fresh code
  if (resendOtpLink) {
    resendOtpLink.addEventListener('click', (e) => {
      e.preventDefault();
      resendOtpSession(otpPendingEmail, (success, errorMsg) => {
        if (otpError) otpError.textContent = success ? '' : (errorMsg || 'Could not resend code.');
        clearOtpInputs();
      });
    });
  }

  // "Back to Sign In/Up" — leaves the OTP screen without verifying
  if (backFromOtpLink) {
    backFromOtpLink.addEventListener('click', (e) => {
      e.preventDefault();
      exitOtpMode();
    });
  }

  // The main Sign In / Sign Up button — validates the form, then calls
  // the backend to either register or log in
  if (primaryButton) {
    primaryButton.addEventListener('click', () => {
      const isValid = validateForm();
      if (!isValid) return;

      const emailValue = emailInput.value.trim();

      if (currentMode === 'signup') {
        const usernameValue = usernameInput.value.trim();
        const passwordValue = createPasswordInput.value;

        registerUser({ username: usernameValue, email: emailValue, password: passwordValue }, (success, errorMsg) => {
          if (success) {
            enterOtpMode(emailValue, 'signup');
            return;
          } 

          let error = errorMsg || 'Could not create account.';
          if (error.toLowerCase().includes('password')) {
            setError(createPasswordError, error);
            createPasswordInput.classList.add('is-invalid');
          } else if (error.toLowerCase().includes('username')) {
            setError(usernameError, error);
            usernameInput.classList.add('is-invalid');
          } else {
            setError(emailError, error);
            emailInput.classList.add('is-invalid');
          }

        });

      } else {
        const passwordValue = passwordInput.value;

        loginUser(emailValue, passwordValue, (success, error) => {
          if (success) {
            window.location.href = 'report-complaint.html';
            // enterOtpMode(emailValue, 'signin');
          } else if (error && error.toLowerCase().includes('verify')) {
            setError(passwordError, 'Please verify your email before signing in.');
            // enterOtpMode(emailValue, 'signup'); //redirect to OTP screen
          } else {
            setError(passwordError, 'Incorrect email or password.');
            passwordInput.classList.add('is-invalid');
          }
        });
      }
    });
  }
});

//Auth.js
document.addEventListener('DOMContentLoaded', () => {
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

  let currentMode = 'signin';

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

  const setError = (node, message) => {
    if (node) {
      node.textContent = message;
    }
  };

  const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

  const isStrongPassword = (value) => {
    const hasMinimumLength = value.length >= 8;
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasMinimumLength && hasLetter && hasNumber;
  };

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

    else if (!passwordInput || !passwordInput.value) {
      setError(passwordError, 'Password is required.');
      if (passwordInput) {
        passwordInput.classList.add('is-invalid');
      }
      isValid = false;
    }

    return isValid;
  };

  const initialMode = window.location.hash === '#signup' ? 'signup' : 'signin';
  updateMode(initialMode);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      updateMode(tab.dataset.authMode);
    });
  });

  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      logoutUser(() => {
        window.location.href = 'report-complaint.html';
      });
    });
  }

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
            window.location.href = 'report-complaint.html';
          } else {
            setError(emailError, errorMsg || 'Could not create account.');
            emailInput.classList.add('is-invalid');
          }
        });

      } else {
        const passwordValue = passwordInput.value;

        loginUser(emailValue, passwordValue, (success) => {
          if (success) {
            window.location.href = 'report-complaint.html';
          } else {
            setError(passwordError, 'Incorrect email or password.');
            passwordInput.classList.add('is-invalid');
          }
        });
      }
    });
  }
});
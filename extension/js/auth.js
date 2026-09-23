document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('[data-auth-mode]');
  const emailInput = document.getElementById('email');
  const signinPasswordField = document.getElementById('signin-password-field');
  const passwordInput = document.getElementById('password');
  const signupPasswordFields = document.getElementById('signup-password-fields');
  const createPasswordInput = document.getElementById('create-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const noticeTitle = document.getElementById('auth-notice-title');
  const noticeText = document.getElementById('auth-notice-text');
  const primaryButton = document.getElementById('auth-primary-button');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const createPasswordError = document.getElementById('create-password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');
  const forgotLink = document.querySelector('.forgot-link');

  let currentMode = 'signin';

  const authModes = {
    signin: {
      title: 'Signing in is optional',
      text: 'You can still verify products and submit complaints as a guest. Sign in or Sign up to view your verification history, complaints, and report status.',
      buttonLabel: 'Sign In',
      documentTitle: 'E-VERIFYMO | Sign In'
    },
    signup: {
      title: 'Signing up is optional',
      text: 'You can still verify products and submit complaints as a guest. Sign in or Sign up to view your verification history, complaints, and report status.',
      buttonLabel: 'Sign Up',
      documentTitle: 'E-VERIFYMO | Sign Up'
    }
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

  const clearErrors = () => {
    [emailError, passwordError, createPasswordError, confirmPasswordError].forEach((errorNode) => {
      if (errorNode) {
        errorNode.textContent = '';
      }
    });

    [emailInput, passwordInput, createPasswordInput, confirmPasswordInput].forEach((inputNode) => {
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
    } else if (!passwordInput || !passwordInput.value) {
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

  if (primaryButton) {
    primaryButton.addEventListener('click', () => {
      validateForm();
    });
  }
});
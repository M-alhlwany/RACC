console.log('hello from budle file');
import 'babel-polyfill'; // لتوافق المتصفحات القديمة
import { displayMap } from './mapbox.js';
import { login, logout, signup, editTour } from './login.js';
import { upDateSettings } from './updateSettings.js';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const saveBtn = document.querySelector('.btn--save-password');
    saveBtn.textContent = 'Updating ......';
    await upDateSettings('password', {
      currentPassword,
      password,
      passwordConfirm,
    });
    saveBtn.textContent = 'Save password';
    currentPassword.value = '';
    password.value = '';
    passwordConfirm.value = '';
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];
    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);
    // Debug:
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    upDateSettings('data', form);
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

const tourForm = document.getElementById('tourForm');
if (tourForm) {
  tourForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('duration', document.getElementById('duration').value);

    //collect Data from the form
    // إضافة صورة الغلاف
    const imageCoverInput = document.getElementById('imageCover');
    if (imageCoverInput.files.length > 0) {
      formData.append('imageCover', imageCoverInput.files[0]);
    }

    // إضافة الصور المتعددة
    const imagesInput = document.getElementById('images');
    for (let i = 0; i < imagesInput.files.length; i++) {
      formData.append('images', imagesInput.files[i]); // الاسم 'images' كما في multer.array('images')
    }

    await editTour('68d4608644106026abde528e', formData);
  });
}

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const div = document.createElement('div');
  div.className = `alert alert--${type}`;
  div.textContent = msg;
  document.querySelector('body').insertAdjacentElement('afterbegin', div);
  window.setTimeout(hideAlert, 1500);
};

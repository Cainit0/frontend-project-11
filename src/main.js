import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import * as yup from 'yup';
import initI18n from './i18n';
import i18next from 'i18next';

await initI18n();

const state = {
  feeds: []
};

const createFeedSchema = () => yup.object({
  url: yup
    .string()
    .required(i18next.t('errors.required'))
    .url(i18next.t('errors.url'))
    .test('unique', i18next.t('errors.unique'), value => 
      !state.feeds.includes(value)
    )
});

const form = document.getElementById('rssForm');
const input = document.getElementById('feedUrl');
const errorFeedback = document.getElementById('error-feedback');
const feedsContainer = document.getElementById('feedsContainer');

const translateUI = () => {
  document.querySelector('h1').textContent = i18next.t('appTitle');
  document.querySelector('label[for="feedUrl"]').textContent = i18next.t('formLabel');
  input.placeholder = i18next.t('formPlaceholder');
  document.querySelector('button[type="submit"]').textContent = i18next.t('submitButton');
};

const renderFeeds = () => {
  if (state.feeds.length === 0) {
    feedsContainer.innerHTML = `<p>${i18next.t('noFeeds')}</p>`;
    return;
  }

  feedsContainer.innerHTML = `
    <h2>${i18next.t('addedFeeds')}</h2>
    <ul class="list-group">
      ${state.feeds.map(feed => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${feed}
          <span class="badge bg-primary rounded-pill">✓</span>
        </li>
      `).join('')}
    </ul>
  `;
};

const resetForm = () => {
  form.reset();
  input.focus();
  input.classList.remove('is-invalid');
  errorFeedback.textContent = '';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = input.value.trim();
  const schema = createFeedSchema();
  
  try {
    await schema.validate({ url }, { abortEarly: false });
    
    state.feeds.push(url);
    
    renderFeeds();
    resetForm();
  } catch (err) {
    const error = err.inner.find(e => e.path === 'url');
    if (error) {
      input.classList.add('is-invalid');
      errorFeedback.textContent = error.message;
    }
  }
});

translateUI();
renderFeeds();
input.focus();
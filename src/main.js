import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import * as yup from 'yup';
import initI18n from './locales/index.js';
import i18next from 'i18next';

async function initializeApp() {
  try {
    await initII8n();
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
}

initializeApp();

const state = {
  feeds: [],
  posts: [],
  error: null,
  loading: false,
  updateTimer: null,
  activeRequests: 0
};

const generateId = () => crypto.randomUUID();

const getProxyUrl = (url) => 
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const parseRss = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const channel = xmlDoc.querySelector('channel');
    if (!channel) throw new Error('Invalid RSS format');
    
    const feed = {
      title: channel.querySelector('title')?.textContent || i18next.t('noTitle'),
      description: channel.querySelector('description')?.textContent || i18next.t('noDescription')
    };
    
    const posts = Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
      id: generateId(),
      title: item.querySelector('title')?.textContent || i18next.t('noTitle'),
      link: item.querySelector('link')?.textContent || '#',
      feedUrl: url
    }));
    
    return { feed, posts };
  } catch (error) {
    throw new Error(i18next.t('errors.parseError'));
  }
};

const fetchRss = async (url) => {
  try {
    state.activeRequests++;
    state.loading = true;
    render();
    
    const response = await fetch(getProxyUrl(url));
    if (!response.ok) throw new Error(i18next.t('errors.network'));
    
    const data = await response.json();
    return parseRss(data.contents);
  } finally {
    state.activeRequests--;
    state.loading = state.activeRequests > 0;
    render();
  }
};

const checkForNewPosts = async () => {
  if (state.feeds.length === 0 || state.activeRequests > 0) return;
  
  try {
    state.loading = true;
    render();
    
    const newPosts = [];
    
    await Promise.all(state.feeds.map(async (feed) => {
      try {
        const { posts: fetchedPosts } = await fetchRss(feed.url);
        
        const existingLinks = new Set(state.posts.map(post => post.link));
        const newFeedPosts = fetchedPosts.filter(post => !existingLinks.has(post.link));
        
        newPosts.push(...newFeedPosts);
      } catch (err) {
        console.error(`Failed to update feed ${feed.url}:`, err);
      }
    }));
    
    if (newPosts.length > 0) {
      state.posts = [...newPosts, ...state.posts];
      renderPosts();
    }
  } catch (err) {
    state.error = i18next.t('errors.updateError');
    renderError();
  } finally {
    state.loading = false;
    scheduleNextUpdate();
  }
};

const scheduleNextUpdate = () => {
  if (state.updateTimer) clearTimeout(state.updateTimer);
  state.updateTimer = setTimeout(checkForNewPosts, 5000);
};

const container = document.createElement('div');
container.className = 'container mt-5';
container.innerHTML = `
  <h1 class="mb-4">${i18next.t('appTitle')}</h1>
  
  <div id="errorContainer" class="alert alert-danger d-none"></div>
  
  <form id="rssForm" novalidate>
    <div class="mb-3">
      <label for="feedUrl" class="form-label">${i18next.t('formLabel')}</label>
      <input 
        type="url" 
        class="form-control" 
        id="feedUrl"
        placeholder="${i18next.t('formPlaceholder')}" 
        autofocus
        required
      >
      <div class="invalid-feedback" id="error-feedback"></div>
    </div>
    <button type="submit" class="btn btn-primary" ${state.loading ? 'disabled' : ''}>
      ${state.loading 
        ? `<span class="spinner-border spinner-border-sm"></span> ${i18next.t('loading')}`
        : i18next.t('submitButton')
      }
    </button>
  </form>
  
  <div class="row mt-5">
    <div class="col-md-6">
      <h2>${i18next.t('addedFeeds')}</h2>
      <div id="feedsContainer" class="mt-3"></div>
    </div>
    <div class="col-md-6">
      <h2>${i18next.t('addedPosts')}</h2>
      <div id="postsContainer" class="mt-3"></div>
    </div>
  </div>
`;

document.getElementById('app').appendChild(container);

const form = container.querySelector('#rssForm');
const input = container.querySelector('#feedUrl');
const errorFeedback = container.querySelector('#error-feedback');
const feedsContainer = container.querySelector('#feedsContainer');
const postsContainer = container.querySelector('#postsContainer');
const errorContainer = container.querySelector('#errorContainer');

const renderError = () => {
  if (!state.error) {
    errorContainer.classList.add('d-none');
    return;
  }
  
  errorContainer.textContent = state.error;
  errorContainer.classList.remove('d-none');
};

const renderFeeds = () => {
  if (state.feeds.length === 0) {
    feedsContainer.innerHTML = `<p>${i18next.t('noFeeds')}</p>`;
    return;
  }

  feedsContainer.innerHTML = `
    <div class="list-group">
      ${state.feeds.map(feed => `
        <div class="list-group-item">
          <h5 class="mb-1">${feed.title}</h5>
          <p class="mb-1">${feed.description}</p>
          <small class="text-muted">${feed.url}</small>
        </div>
      `).join('')}
    </div>
  `;
};

const renderPosts = () => {
  if (state.posts.length === 0) {
    postsContainer.innerHTML = `<p>${i18next.t('noPosts')}</p>`;
    return;
  }

  postsContainer.innerHTML = `
    <div class="list-group">
      ${state.posts.map(post => `
        <a href="${post.link}" target="_blank" class="list-group-item list-group-item-action">
          <div>${post.title}</div>
          <small class="text-muted">${post.feedUrl}</small>
        </a>
      `).join('')}
    </div>
  `;
};

const render = () => {
  renderFeeds();
  renderPosts();
  renderError();
  
  const button = form.querySelector('button');
  button.disabled = state.loading;
  button.innerHTML = state.loading 
    ? `<span class="spinner-border spinner-border-sm"></span> ${i18next.t('loading')}`
    : i18next.t('submitButton');
};

const createFeedSchema = () => yup.object({
  url: yup
    .string()
    .required(i18next.t('errors.required'))
    .url(i18next.t('errors.url'))
    .test('unique', i18next.t('errors.unique'), value => 
      !state.feeds.some(feed => feed.url === value)
    )
});

const resetForm = () => {
  form.reset();
  input.focus();
  input.classList.remove('is-invalid');
  errorFeedback.textContent = '';
  state.error = null;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = input.value.trim();
  
  try {
    const schema = createFeedSchema();
    await schema.validate({ url }, { abortEarly: false });
    
    const { feed, posts } = await fetchRss(url);
    
    state.feeds.push({ ...feed, id: generateId(), url });
    
    const postsWithSource = posts.map(post => ({
      ...post,
      feedUrl: url
    }));
    
    state.posts = [...postsWithSource, ...state.posts];
    
    resetForm();
    
    if (state.feeds.length === 1) {
      scheduleNextUpdate();
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      const error = err.inner.find(e => e.path === 'url');
      if (error) {
        input.classList.add('is-invalid');
        errorFeedback.textContent = error.message;
      }
      return;
    }
    
    state.error = err.message;
    renderError();
  }
});

render();
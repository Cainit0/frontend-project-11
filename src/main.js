import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import { initView, renderFeeds, setInputState, resetForm } from './lib/view.js';
import { validateFeed } from './lib/validation.js';

// Состояние приложения
const state = {
  feeds: []
};

// Инициализация приложения
const initApp = () => {
  const view = initView();
  document.getElementById('app').appendChild(view.container);
  
  // Рендер существующих фидов
  renderFeeds(view.feedsContainer, state.feeds);
  
  // Обработка отправки формы
  view.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = view.input.value.trim();
    const validation = await validateFeed(url, state.feeds);
    
    if (!validation.isValid) {
      const error = validation.errors.find(e => e.path === 'url');
      setInputState(view.input, view.errorFeedback, false, error?.message || 'Invalid URL');
      return;
    }
    
    // Добавление фида
    state.feeds.push(url);
    
    // Обновление UI
    resetForm(view.form, view.input);
    renderFeeds(view.feedsContainer, state.feeds);
  });
};

document.addEventListener('DOMContentLoaded', initApp);
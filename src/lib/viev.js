export const initView = () => {
  const container = document.createElement('div');
  container.className = 'container mt-5';
  container.innerHTML = `
    <h1 class="mb-4">RSS Feed Manager</h1>
    <form id="rssForm" novalidate>
      <div class="mb-3">
        <label for="feedUrl" class="form-label">RSS Feed URL</label>
        <input 
          type="url" 
          class="form-control" 
          id="feedUrl"
          placeholder="https://example.com/feed.xml" 
          autofocus
          required
        >
        <div class="invalid-feedback" id="error-feedback"></div>
      </div>
      <button type="submit" class="btn btn-primary">Add Feed</button>
    </form>
    <div id="feedsContainer" class="mt-4"></div>
  `;

  return {
    container,
    form: container.querySelector('#rssForm'),
    input: container.querySelector('#feedUrl'),
    errorFeedback: container.querySelector('#error-feedback'),
    feedsContainer: container.querySelector('#feedsContainer')
  };
};

export const renderFeeds = (feedsContainer, feeds) => {
  if (feeds.length === 0) {
    feedsContainer.innerHTML = '<p>No feeds added yet</p>';
    return;
  }

  feedsContainer.innerHTML = `
    <h2>Added Feeds</h2>
    <ul class="list-group">
      ${feeds.map(feed => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${feed}
          <span class="badge bg-primary rounded-pill">✓</span>
        </li>
      `).join('')}
    </ul>
  `;
};

export const setInputState = (input, errorFeedback, isValid, message = '') => {
  if (isValid) {
    input.classList.remove('is-invalid');
    errorFeedback.textContent = '';
  } else {
    input.classList.add('is-invalid');
    errorFeedback.textContent = message;
  }
};

export const resetForm = (form, input) => {
  form.reset();
  input.focus();
  setInputState(input, document.getElementById('error-feedback'), true);
};
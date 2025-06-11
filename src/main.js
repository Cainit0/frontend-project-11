import './style.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

document.querySelector('#app').innerHTML = `
  <div class="container mt-5">
    <h1 class="mb-4">RSS Feed Manager</h1>
    <form id="rssForm" class="mb-3">
      <div class="mb-3">
        <label for="feedUrl" class="form-label">RSS Feed URL</label>
        <input 
          type="url" 
          class="form-control" 
          id="feedUrl"
          placeholder="https://example.com/feed.xml" 
          required
        >
      </div>
      <button type="submit" class="btn btn-primary">Add Feed</button>
    </form>
  </div>
`

document.getElementById('rssForm').addEventListener('submit', e => {
  e.preventDefault()
  const url = document.getElementById('feedUrl').value
  alert(`Added RSS Feed: ${url}`)
  e.target.reset()
})

// API base URL - update this to your NestJS server URL
const API_URL = 'http://localhost:3000';

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const articleContainer = document.getElementById('articleContainer');
const articleTitle = document.getElementById('articleTitle');
const articleMetadata = document.getElementById('articleMetadata');
const articleContent = document.getElementById('articleContent');

// Hide article container initially
articleContainer.style.display = 'none';

// Add event listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

// Search function
async function performSearch() {
  const query = searchInput.value.trim();
  
  if (!query) return;
  
  try {
    const response = await fetch(`${API_URL}/wikipedia/search?query=${encodeURIComponent(query)}`);
    const results = await response.json();
    
    displaySearchResults(results);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = '<p class="error">Error searching for articles. Please try again.</p>';
  }
}

// Display search results
function displaySearchResults(results) {
  searchResults.innerHTML = '';
  
  if (!results || results.length === 0) {
    searchResults.innerHTML = '<p>No results found.</p>';
    return;
  }
  
  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <h3>${result.title}</h3>
      <p>${sanitizeHTML(result.snippet)}</p>
    `;
    
    // Add click event to load article
    resultItem.addEventListener('click', () => loadArticle(result.pageid));
    
    searchResults.appendChild(resultItem);
  });
}

// Load article function
async function loadArticle(pageId) {
  try {
    const response = await fetch(`${API_URL}/wikipedia/article/${pageId}/fulltext`);
    const article = await response.json();
    
    displayArticle(article);
  } catch (error) {
    console.error('Article loading error:', error);
    articleContent.innerHTML = '<p class="error">Error loading article. Please try again.</p>';
  }
}

// Display article
function displayArticle(article) {
  // Show the article container
  articleContainer.style.display = 'block';
  
  // Set the title
  articleTitle.textContent = article.title;
  
  // Set metadata
  articleMetadata.innerHTML = `
    <span>Word count: ${article.metadata.wordCount}</span>
  `;
  
  // Clear previous content
  articleContent.innerHTML = '';
  
  // Add formatted sections
  article.content.formattedSections.forEach(section => {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'article-section';
    
    sectionElement.innerHTML = `
      <h3>${section.title}</h3>
      <div>${formatParagraphs(section.content)}</div>
    `;
    
    articleContent.appendChild(sectionElement);
  });
  
  // Scroll to article
  articleContainer.scrollIntoView({ behavior: 'smooth' });
}

// Helper to format paragraphs
function formatParagraphs(text) {
  return text.split('\n')
    .filter(para => para.trim().length > 0)
    .map(para => `<p>${sanitizeHTML(para)}</p>`)
    .join('');
}

// Simple HTML sanitizer to prevent XSS
function sanitizeHTML(text) {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}
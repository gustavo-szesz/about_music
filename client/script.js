// API base URL
const API_URL = 'http://localhost:3000';

// DOM Elements
const artistInput = document.getElementById('artistInput');
const songInput = document.getElementById('songInput');
const searchButton = document.getElementById('searchButton');
const lyricsContent = document.getElementById('lyricsContent');
const artistContent = document.getElementById('artistContent');
const albumContent = document.getElementById('albumContent');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumTitle = document.getElementById('albumTitle');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Event listeners
searchButton.addEventListener('click', handleSearch);
artistInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });
songInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    tabContents.forEach(content => content.classList.remove('active'));
    
    const tabId = button.getAttribute('data-tab') + 'Tab';
    document.getElementById(tabId).classList.add('active');
  });
});

// Main search handler
async function handleSearch() {
  const artist = artistInput.value.trim();
  const song = songInput.value.trim();
  
  if (!artist && !song) {
    alert('Please enter an artist name or song title');
    return;
  }
  
  // Update UI elements
  artistName.textContent = artist || 'Artist Information';
  songTitle.textContent = song ? (artist ? `${song} - ${artist}` : song) : 'Search for a song to view lyrics';
  
  // Clear previous content
  lyricsContent.innerHTML = '<p class="loading">Searching...</p>';
  artistContent.innerHTML = '<p class="loading">Loading artist information...</p>';
  albumContent.innerHTML = '';
  
  // Search for lyrics if both artist and song are provided
  if (artist && song) {
    searchLyrics(artist, song);
    document.querySelector('[data-tab="lyrics"]').click();
  } else {
    lyricsContent.innerHTML = '<p>Both artist and song name are needed for lyrics</p>';
  }
  
  // Search for artist info
  if (artist) {
    searchArtistInfo(artist);
    if (!song) {
      document.querySelector('[data-tab="artist"]').click();
    }
  }
  
  // Search for album info if song is provided (try to find album from song)
  if (song) {
    findAlbumForSong(artist, song);
  }
}

// Search for lyrics
async function searchLyrics(artist, song) {
  try {
    const response = await fetch(`${API_URL}/lyrics/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        showLyricsNotFound(artist, song);
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
      return;
    }
    
    const data = await response.json();
    
    if (data && data.lyrics) {
      lyricsContent.innerHTML = `
        <div class="lyrics-header">
          <h3>${song}</h3>
          <h4>by ${artist}</h4>
        </div>
        <div class="lyrics-text">
          ${data.lyrics.replace(/\n/g, '<br>')}
        </div>
      `;
    } else {
      showLyricsNotFound(artist, song);
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    lyricsContent.innerHTML = `
      <p class="error">Failed to load lyrics. Error: ${error.message}</p>
      ${getLyricsExternalLinks(artist, song)}
    `;
  }
}

// Search for artist information using Wikipedia
async function searchArtistInfo(artist) {
  try {
    // First search for the artist
    const searchResponse = await fetch(`${API_URL}/wikipedia/search?query=${encodeURIComponent(artist)}`);
    
    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
    }
    
    const searchResults = await searchResponse.json();
    
    if (searchResults && searchResults.length > 0) {
      // Filter for likely artist results
      const artistResults = searchResults.filter(result => 
        result.snippet.toLowerCase().includes('singer') || 
        result.snippet.toLowerCase().includes('musician') || 
        result.snippet.toLowerCase().includes('band') ||
        result.snippet.toLowerCase().includes('artist')
      );
      
      // Use filtered results if available, otherwise use the first result
      const bestResult = artistResults.length > 0 ? artistResults[0] : searchResults[0];
      
      // Get article details
      const articleResponse = await fetch(`${API_URL}/wikipedia/article/${bestResult.pageid}/fulltext`);
      
      if (!articleResponse.ok) {
        throw new Error(`Failed to get article: ${articleResponse.status}`);
      }
      
      const articleData = await articleResponse.json();
      
      // Update artist name to match Wikipedia title
      artistName.textContent = articleData.title || artist;
      
      // Display Wikipedia content
      displayWikipediaArticle(articleData, artistContent);
    } else {
      artistContent.innerHTML = '<p>No information found for this artist.</p>';
    }
  } catch (error) {
    console.error('Error fetching artist info:', error);
    artistContent.innerHTML = `<p class="error">Failed to load artist information. Error: ${error.message}</p>`;
  }
}

// Find album for a song
async function findAlbumForSong(artist, song) {
  try {
    // Search for song to find possible album
    const searchQuery = artist ? `${song} ${artist} album` : `${song} album`;
    const searchResponse = await fetch(`${API_URL}/wikipedia/search?query=${encodeURIComponent(searchQuery)}`);
    
    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
    }
    
    const searchResults = await searchResponse.json();
    
    if (searchResults && searchResults.length > 0) {
      // Filter for album results
      const albumResults = searchResults.filter(result => 
        result.title.toLowerCase().includes('album') || 
        result.snippet.toLowerCase().includes('album')
      );
      
      if (albumResults.length > 0) {
        // Get album article
        const albumResponse = await fetch(`${API_URL}/wikipedia/article/${albumResults[0].pageid}/fulltext`);
        
        if (!albumResponse.ok) {
          throw new Error(`Failed to get album article: ${albumResponse.status}`);
        }
        
        const albumData = await albumResponse.json();
        
        // Update album title
        albumTitle.textContent = albumData.title || 'Album Information';
        
        // Display album content
        displayWikipediaArticle(albumData, albumContent);
      } else {
        albumContent.innerHTML = '<p>No album information found for this song.</p>';
      }
    } else {
      albumContent.innerHTML = '<p>No album information found.</p>';
    }
  } catch (error) {
    console.error('Error fetching album info:', error);
    albumContent.innerHTML = `<p class="error">Failed to load album information. Error: ${error.message}</p>`;
  }
}

// Show message when lyrics aren't found
function showLyricsNotFound(artist, song) {
  lyricsContent.innerHTML = `
    <p class="error">No lyrics found for "${song}" by ${artist}.</p>
    ${getLyricsExternalLinks(artist, song)}
  `;
}

// Generate HTML for external lyrics links
function getLyricsExternalLinks(artist, song) {
  return `
    <div class="lyrics-search-form">
      <h4>Find lyrics on these websites:</h4>
      <div class="external-links">
        <a href="https://genius.com/search?q=${encodeURIComponent(artist + ' ' + song)}" target="_blank">Genius</a>
        <a href="https://www.azlyrics.com/search.php?q=${encodeURIComponent(artist + ' ' + song)}" target="_blank">AZLyrics</a>
        <a href="https://www.google.com/search?q=${encodeURIComponent(artist + ' ' + song + ' lyrics')}" target="_blank">Google</a>
      </div>
    </div>
  `;
}

// Display Wikipedia article
function displayWikipediaArticle(article, container) {
  if (!article || !article.content) {
    container.innerHTML = '<p>No information available.</p>';
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Display sections
  if (article.content.formattedSections && article.content.formattedSections.length > 0) {
    article.content.formattedSections.forEach(section => {
      const sectionElement = document.createElement('div');
      sectionElement.className = 'wiki-section';
      
      sectionElement.innerHTML = `
        <h3>${section.title}</h3>
        <div>${formatParagraphs(section.content)}</div>
      `;
      
      container.appendChild(sectionElement);
    });
  } else if (article.content.fullText) {
    // Fallback to displaying full text
    container.innerHTML = `<div>${formatParagraphs(article.content.fullText)}</div>`;
  }
}

// Format paragraphs for display
function formatParagraphs(text) {
  if (!text) return '';
  
  return text.split('\n')
    .filter(para => para.trim().length > 0)
    .map(para => `<p>${sanitizeHTML(para)}</p>`)
    .join('');
}

// HTML sanitizer for safety
function sanitizeHTML(text) {
  if (!text) return '';
  
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}
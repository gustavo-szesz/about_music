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

// Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseButton = document.getElementById('playPauseButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const volumeSlider = document.getElementById('volumeSlider');
const progressFill = document.getElementById('progressFill');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const progressBar = document.querySelector('.progress-bar');
const playerThumbnail = document.getElementById('playerThumbnail');
const playerTrackName = document.getElementById('playerTrackName');
const playerArtistName = document.getElementById('playerArtistName');

// Player State
let isPlaying = false;
let currentTrack = null;
let playlist = [];

// Initialization
audioPlayer.volume = 0.7; // Initial volume

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
function handleSearch() {
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

  // Search and play YouTube music
  if (artist && song) {
    searchAndPlayYouTube(artist, song);
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

// Functions to control the player
function playAudio(videoId, trackInfo) {
  // Update the audio player URL to point to our streaming endpoint
  audioPlayer.src = `http://localhost:3000/youtube-audio/stream?videoId=${videoId}`;
  
  // Update track information
  if (trackInfo) {
    playerTrackName.textContent = trackInfo.title || 'Unknown Track';
    playerArtistName.textContent = trackInfo.artist || 'Unknown Artist';
    
    // Update thumbnail if available
    if (trackInfo.thumbnail) {
      playerThumbnail.src = trackInfo.thumbnail;
    } else {
      // Use a placeholder image if no thumbnail is available
      playerThumbnail.src = 'assets/placeholder.jpg';
    }
    
    // Add to playlist if not already present
    if (!playlist.some(track => track.videoId === videoId)) {
      playlist.push({
        videoId,
        ...trackInfo
      });
    }
    
    currentTrack = videoId;
  }
  
  // Play the track and update the button
  audioPlayer.play()
    .then(() => {
      isPlaying = true;
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    })
    .catch(error => {
      console.error('Error playing audio:', error);
    });
}

// Function to get YouTube video ID
async function getYouTubeVideoId(artist, song) {
  try {
    // Fazendo uma requisição para um endpoint hipotético em seu backend
    const response = await fetch(`http://localhost:3000/youtube-search?q=${encodeURIComponent(artist + ' ' + song)}`);
    const data = await response.json();
    
    if (data && data.videoId) {
      return data.videoId;
    } else {
      console.error('Nenhum vídeo encontrado');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar ID do vídeo:', error);
    return null;
  }
}

// Function to search and play YouTube music
async function searchAndPlayYouTube(artist, song) {
  // Mostrar estado de carregamento
  playerTrackName.textContent = 'Carregando...';
  playerArtistName.textContent = `${song} - ${artist}`;
  
  // Buscar o ID do vídeo
  const videoId = await getYouTubeVideoId(artist, song);
  
  if (videoId) {
    playAudio(videoId, {
      title: song,
      artist: artist,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    });
  } else {
    // Fallback para uma pesquisa direta do YouTube
    const searchQuery = `${artist} ${song} official audio`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    
    console.log('Não foi possível encontrar o vídeo automaticamente');
    console.log('Tente buscar manualmente:', searchUrl);
    
    // Informe ao usuário
    playerTrackName.textContent = 'Não foi possível encontrar esta música';
    playerArtistName.textContent = 'Tente uma busca diferente';
  }
}

// Player events
playPauseButton.addEventListener('click', () => {
  if (isPlaying) {
    audioPlayer.pause();
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
  } else {
    audioPlayer.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  }
});

// Volume control
volumeSlider.addEventListener('input', () => {
  audioPlayer.volume = volumeSlider.value;
});

// Progress bar update
audioPlayer.addEventListener('timeupdate', () => {
  // Update progress bar fill
  const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressFill.style.width = `${percentage}%`;
  
  // Update current time
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  
  // Update total time if available
  if (!isNaN(audioPlayer.duration)) {
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
  }
});

// Format time in minutes:seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Allow clicking on progress bar to navigate the track
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  audioPlayer.currentTime = ratio * audioPlayer.duration;
});

// Previous and next buttons
prevButton.addEventListener('click', playPrevious);
nextButton.addEventListener('click', playNext);

function playPrevious() {
  if (!currentTrack || playlist.length <= 1) return;
  
  const currentIndex = playlist.findIndex(track => track.videoId === currentTrack);
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
  
  const prevTrack = playlist[prevIndex];
  playAudio(prevTrack.videoId, prevTrack);
}

function playNext() {
  if (!currentTrack || playlist.length <= 1) return;
  
  const currentIndex = playlist.findIndex(track => track.videoId === currentTrack);
  const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
  
  const nextTrack = playlist[nextIndex];
  playAudio(nextTrack.videoId, nextTrack);
}
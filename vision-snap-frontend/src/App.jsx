import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:6969/VisionSnap/api';
const IMGBB_API_KEY = "07e8479fd94e930344d0e50b48048b02"; 

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      await searchImages(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      await searchImages(file);
    }
  };

  const searchImages = async (file = null) => {
    setLoading(true);
    try {
      let imageUrlToSend = '';

      if (file || selectedImage) {
        const uploadFile = file || selectedImage;
        const formData = new FormData();
        formData.append('image', uploadFile);

        const imgbbResponse = await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          formData
        );
        imageUrlToSend = imgbbResponse.data.data.url;
      } else if (searchQuery.trim()) {
        imageUrlToSend = searchQuery.trim();
      } else {
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/searchByImage`, {
        imageUrl: imageUrlToSend,
      });

      setSearchResults(response.data.relatedImages || []);
    } catch (error) {
      console.error('Error searching images:', error);
      alert('Failed to search images. Please make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="app">
      <div className="pixel-overlay"></div>
      <div className="container">
        <header className="header">
          <div className="header-icon">🎨</div>
          <h1>AI VISION SNAP</h1>
          <p>Discover the magic in every pixel • Upload • Explore</p>
        </header>

        <div className="background-shapes">
          {[...Array(5)].map((_, i) => <div key={i} className="shape"></div>)}
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <span className="tab-icon">📤</span><span>Upload</span>
          </button>
          <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <span className="tab-icon">🔍</span><span>Search Gallery</span>
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2>📷 Upload Your Image</h2>
                <p>Drop or click to upload and get inspired!</p>
              </div>

              <div className={`upload-area ${imagePreview ? 'has-image' : ''}`} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => document.getElementById('imageInput').click()}>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button onClick={(e) => { e.stopPropagation(); clearImage(); }} className="clear-btn">✖</button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">🖼️</div>
                    <h3>Drop your masterpiece here</h3>
                    <p>or click to browse your files</p>
                    <div className="file-types">
                      <span>PNG</span><span>JPG</span><span>GIF</span><span>WEBP</span>
                    </div>
                  </div>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2>🔍 Image Galaxy Explorer</h2>
                <p>Search through infinite visual possibilities</p>
              </div>

              <div className="search-section">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="What visual story are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                    className="search-input"
                  />
                </div>
                <button
                  onClick={() => searchImages()}
                  disabled={loading || !searchQuery.trim()}
                  className="btn-primary btn-search"
                >
                  <span className="btn-icon">{loading ? '⏳' : '🚀'}</span>
                  <span>{loading ? 'Searching...' : 'Explore'}</span>
                </button>
              </div>

              <div className="search-suggestions">
                <span className="suggestion-label">Popular searches:</span>
                {['pixel art', 'nature', 'abstract', 'vintage', 'minimalist'].map((suggestion) => (
                  <button key={suggestion} onClick={() => { setSearchQuery(suggestion); searchImages(); }} className="suggestion-chip">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card results-card">
            <div className="card-header">
              <h3>🎨 Visual Treasures</h3>
              <p>Found {searchResults.length} amazing images for you</p>
            </div>
            <div className="image-grid">
              {searchResults.map((image, index) => (
                <div key={index} className="image-card">
                  <div className="image-wrapper">
                    <img src={image.urls?.small || image.url} alt={image.alt_description || `Discovery ${index + 1}`} loading="lazy" />
                    <div className="image-overlay"><span className="view-icon">👁️</span></div>
                  </div>
                  <div className="image-info">
                    <p className="image-description">
                      {image.description || image.alt_description || 'A beautiful discovery'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="loading-animation"><div className="pixel-loader"></div></div>
            <h3>Searching the visual universe...</h3>
            <p>Discovering amazing images for you</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

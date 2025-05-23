import React, { useState, useEffect, useCallback } from "react";
import "./HomePage.css";

// const PIXABAY_API_KEY = "47849701-73acc40f5327790e47c2f6a81";

const HomePage = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [activeTab, setActiveTab] = useState("pc");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWallpapers = useCallback(async () => {
    try {
      setLoading(true);
      const [backendRes, pixabayRes] = await Promise.all([
        fetch("https://wallpaperhub-backend.onrender.com/api/get-wallpapers"),
        fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=wallpapers&image_type=photo&per_page=50`)
      ]);

      const backendData = await backendRes.json();
      const pixabayData = await pixabayRes.json();

      const pixabayWallpapers = pixabayData.hits.map((img) => ({
        _id: `pixabay-${img.id}`,
        name: img.tags || "Pixabay Image",
        description: `Photo by ${img.user}`,
        category: "Pixabay",
        device: img.imageWidth > img.imageHeight ? "pc" : "mobile",
        image_url: img.largeImageURL,
        thumbnail_url: img.previewURL
      }));

      setWallpapers([...backendData.wallpapers, ...pixabayWallpapers]);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallpapers();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fetchWallpapers]);

  const pcWallpapers = wallpapers.filter((wp) => wp.device.toLowerCase() === "pc");
  const mobileWallpapers = wallpapers.filter((wp) => wp.device.toLowerCase() === "mobile");

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);

  const getImageUrl = (url) => url.startsWith("http") ? url : `https://wallpaperhub-backend.onrender.com${url}`;

  const handleDownload = async (url, name) => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "wallpaper.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      alert("Download started!");
    } catch (err) {
      console.error(err);
      alert("Failed to download wallpaper.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="homepage-container">
      <nav className="homepage-navbar glass-effect">
        <div className="homepage-logo gradient-text">WallpaperHub</div>
        <ul className={`homepage-nav-links ${isNavOpen ? "homepage-nav-active" : ""}`}>
          <li><a href="#hero">Home</a></li>
          <li><a href="/categories">Categories</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="homepage-hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      <section id="hero" className="homepage-hero">
        <div className="homepage-hero-overlay"></div>
        <div className="homepage-hero-content fade-in">
          <h1 className="homepage-hero-title gradient-text">Discover Epic Wallpapers</h1>
          <p>Elevate your device with stunning visuals from our collection.</p>
          <a href="#wallpapers" className="homepage-cta-button">Explore Now</a>
        </div>
      </section>

      <section id="wallpapers" className="homepage-wallpapers">
        <h2 className="homepage-section-title">Our Collection</h2>
        <div className="homepage-tabs">
          <button className={activeTab === "pc" ? "homepage-tab-active" : ""} onClick={() => setActiveTab("pc")}>PC Wallpapers</button>
          <button className={activeTab === "mobile" ? "homepage-tab-active" : ""} onClick={() => setActiveTab("mobile")}>Mobile Wallpapers</button>
        </div>
        {loading ? (
          <p className="homepage-loading">Loading wallpapers...</p>
        ) : (
          <div className="homepage-wallpapers-gallery grid-responsive">
            {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).map((wallpaper) => (
              <div
                className={`homepage-wallpaper-card shadow-lg rounded ${activeTab === "pc" ? "homepage-landscape" : "homepage-portrait"}`}
                key={wallpaper._id}
                onClick={() => openModal(wallpaper)}
              >
                <img
                  src={getImageUrl(wallpaper.thumbnail_url || wallpaper.image_url)}
                  alt={wallpaper.name}
                  className="homepage-wallpaper-image hover-zoom"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedWallpaper && (
        <div className="homepage-modal fade-in">
          <div className="homepage-modal-content glass-effect">
            <button className="homepage-modal-close" onClick={closeModal}>✕</button>
            <div className="homepage-modal-image-container">
              <img
                src={getImageUrl(selectedWallpaper.image_url)}
                alt={selectedWallpaper.name}
                className="homepage-modal-image"
              />
            </div>
            <div className="homepage-modal-details">
              <h2>{selectedWallpaper.name}</h2>
              <p><strong>Description:</strong> {selectedWallpaper.description}</p>
              <p><strong>Category:</strong> {selectedWallpaper.category}</p>
              <p><strong>Device:</strong> {selectedWallpaper.device}</p>
              <button
                className="homepage-download-btn shine"
                onClick={() => handleDownload(getImageUrl(selectedWallpaper.image_url), selectedWallpaper.name)}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
          <div className="homepage-modal-backdrop" onClick={closeModal}></div>
        </div>
      )}

      <section id="contact" className="homepage-contact-section">
        <p>Developed and maintained by Vatsal Bairagi</p>
        <div className="homepage-contact-info">
          <p>Email: <a href="mailto:support@wallpaperhub.com">support@wallpaperhub.com</a></p>
          <p>Instagram: <a href="https://instagram.com/wallpaperhub" target="_blank" rel="noopener noreferrer">@wallpaperhub</a></p>
        </div>
      </section>

      <footer className="homepage-footer glass-effect">
        <p>© 2025 WallpaperHub. All rights reserved.</p>
        <div className="homepage-social-links">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

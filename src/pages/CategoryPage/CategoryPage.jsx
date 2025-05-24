import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CategoryPage.css";

const CategoryPage = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("pc");
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://wallpaperhub-backend.onrender.com/api/get-wallpapers`)
      .then((res) => res.json())
      .then((data) => setWallpapers(data.wallpapers))
      .catch((err) => console.error("Error loading wallpapers:", err));

    fetch(`https://wallpaperhub-backend.onrender.com/api/get-categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Error loading categories:", err));

    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedWallpaper(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const filteredWallpapers = selectedCategory
    ? wallpapers.filter((wp) => wp.category === selectedCategory)
    : wallpapers;

  const pcWallpapers = filteredWallpapers.filter((wp) => wp.device === "pc");
  const mobileWallpapers = filteredWallpapers.filter((wp) => wp.device === "mobile");

  const handleDownload = async (url, name) => {
    setIsDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
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
      console.error("Download error:", err);
      alert("Failed to download wallpaper.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getImageUrl = (imageUrl) =>
    imageUrl.startsWith("http")
      ? imageUrl
      : `https://wallpaperhub-backend.onrender.com${imageUrl}`;

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);

  return (
    <div className="category-page">
      <nav className="category-navbar glass-effect">
        <div className="category-logo gradient-text">WallpaperHub</div>
        <ul className={`category-nav-links ${isNavOpen ? "category-nav-active" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/categories">Categories</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="category-hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      <header className="hero">
        <h1>Explore Categories</h1>
        <p>Discover wallpapers tailored to your vibe.</p>
      </header>

      <div className="category-filters">
        <button className={!selectedCategory ? "active" : ""} onClick={() => setSelectedCategory(null)}>All</button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="wallpapers">
        <div className="tabs">
          <button className={activeTab === "pc" ? "active" : ""} onClick={() => setActiveTab("pc")}>PC</button>
          <button className={activeTab === "mobile" ? "active" : ""} onClick={() => setActiveTab("mobile")}>Mobile</button>
        </div>
        <div className="gallery">
          {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).map((wallpaper) => (
            <div key={wallpaper._id} className="wallpaper-card" onClick={() => openModal(wallpaper)}>
              <img
                src={getImageUrl(wallpaper.thumbnail_url || wallpaper.image_url)}
                alt={wallpaper.name}
                className={`wallpaper-image ${wallpaper.device}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
        {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).length === 0 && (
          <p>No {activeTab} wallpapers in this category.</p>
        )}
      </section>

      {selectedWallpaper && (
        <div className="category-modal fade-in">
          <div className="category-modal-content glass-effect slide-up">
            <button className="category-modal-close" onClick={closeModal}>✕</button>
            <div className="category-modal-image-container">
              <img
                src={getImageUrl(selectedWallpaper.image_url)}
                alt={selectedWallpaper.name}
                className={`modal-image ${selectedWallpaper.device}`}
              />
            </div>
            <div className="category-modal-details">
              <h2>{selectedWallpaper.name}</h2>
              <p><strong>Description:</strong> {selectedWallpaper.description}</p>
              <p><strong>Category:</strong> {selectedWallpaper.category}</p>
              <p><strong>Device:</strong> {selectedWallpaper.device}</p>
              <button
                className="category-download-btn shine"
                onClick={() => handleDownload(getImageUrl(selectedWallpaper.image_url), selectedWallpaper.name)}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
          <div className="category-modal-backdrop" onClick={closeModal}></div>
        </div>
      )}

      <footer className="category-footer glass-effect" id="contact">
        <p>Developed and maintained by Vatsal Bairagi</p>
        <p>Email: <a href="mailto:support@wallpaperhub.com">support@wallpaperhub.com</a></p>
        <p>Instagram: <a href="https://instagram.com/wallpaperhub" target="_blank">@wallpaperhub</a></p>
        <p>© 2025 WallpaperHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CategoryPage;

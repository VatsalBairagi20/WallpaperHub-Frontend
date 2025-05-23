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
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handlePinSubmit = () => {
    if (pin === "1234") {
      navigate("/admin");
    } else {
      setError("Incorrect PIN");
    }
  };

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const getImageUrl = (imageUrl) =>
    imageUrl.startsWith("http")
      ? imageUrl
      : `https://wallpaperhub-backend.onrender.com${imageUrl}`;

  return (
    <div className="category-page">
      <nav className="navbar">
        <div className="navbar-brand">WallpaperHub</div>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/categories">Categories</a></li>
          <li><a href="#contact">Contact</a></li>
          <li>
            <button onClick={() => setShowPinInput(!showPinInput)} className="login-btn">🔐 Login</button>
          </li>
        </ul>
        {showPinInput && (
          <div className="pin-input">
            <input
              type="password"
              placeholder="Admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button onClick={handlePinSubmit}>Submit</button>
            {error && <p className="error">{error}</p>}
          </div>
        )}
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
        <WallpaperModal
          wallpaper={selectedWallpaper}
          onClose={closeModal}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          getImageUrl={getImageUrl}
        />
      )}

      <footer className="footer" id="contact">
        <h2>Contact Us</h2>
        <p>Developed and Maintained by Vatsal Bairagi</p>
        <p>Email: <a href="mailto:support@wallpaperhub.com">support@wallpaperhub.com</a></p>
        <p>Instagram: <a href="https://instagram.com/wallpaperhub" target="_blank">@wallpaperhub</a></p>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" required></textarea>
          <button type="submit">Send</button>
        </form>
        <p>© 2025 WallpaperHub. Built with 💪 by <strong>Vatsal Bairagi</strong></p>
        <div>
          <a href="https://instagram.com" target="_blank">Instagram</a>
          <a href="https://github.com/vatsalbairagi" target="_blank">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

const WallpaperModal = ({ wallpaper, onClose, onDownload, isDownloading, getImageUrl }) => (
  <div className="modal">
    <div className="modal-content">
      <button className="close" onClick={onClose}>✕</button>
      <img src={getImageUrl(wallpaper.image_url)} alt={wallpaper.name} />
      <h2>{wallpaper.name}</h2>
      <p><strong>Description:</strong> {wallpaper.description}</p>
      <p><strong>Category:</strong> {wallpaper.category}</p>
      <p><strong>Device:</strong> {wallpaper.device}</p>
      <button onClick={() => onDownload(getImageUrl(wallpaper.image_url), wallpaper.name)} disabled={isDownloading}>
        {isDownloading ? "Downloading..." : "Download"}
      </button>
    </div>
    <div className="backdrop" onClick={onClose}></div>
  </div>
);

export default CategoryPage;

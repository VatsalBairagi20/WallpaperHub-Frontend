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
  const [isLoading, setIsLoading] = useState(true); // NEW

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const backendRes = await fetch(`https://wallpaperhub-backend.onrender.com/api/get-wallpapers`);
        const backendData = await backendRes.json();

        const categoryRes = await fetch(`https://wallpaperhub-backend.onrender.com/api/get-categories`);
        const categoryData = await categoryRes.json();

        setWallpapers(backendData.wallpapers);
        setCategories(categoryData.categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // ✅ stop showing loading
      }
    };

    fetchAllData();

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
    <div className="category-page-container">
      <nav className="category-navbar">
        <div className="category-logo">WallpaperHub</div>

        <button className="category-hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
        </button>

        <ul className={`category-nav-links ${menuOpen ? "open" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/categories">Categories</a></li>
          <li><a href="#contact">Contact</a></li>
          <li>
            <button onClick={() => {
              setShowPinInput(!showPinInput);
              setMenuOpen(false);
            }} className="category-login-btn">🔐 Login</button>
          </li>
        </ul>

        {showPinInput && (
          <div className="category-pin-container">
            <input
              type="password"
              placeholder="Enter Admin PIN"
              className="category-pin-input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button onClick={handlePinSubmit} className="category-pin-submit-btn">Submit</button>
            {error && <p className="category-pin-error">{error}</p>}
          </div>
        )}
      </nav>

      <main className="category-main-content">
        <section className="category-hero">
          <div className="category-hero-content">
            <h1 className="category-glitch" data-text="Explore Categories">Explore Categories</h1>
            <p className="category-hero-text">Discover wallpapers tailored to your vibe.</p>
          </div>
        </section>

        <div className="category-strip">
          <div
            className={`category-pill ${selectedCategory === null ? "active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </div>
          {categories.map((cat) => (
            <div
              key={cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        <section className="category-wallpapers">
          <h2 className="category-wallpapers-heading">{selectedCategory || "All"} Wallpapers</h2>
          <div className="category-tabs">
            <button
              className={`category-tab-btn ${activeTab === "pc" ? "active" : ""}`}
              onClick={() => setActiveTab("pc")}
            >
              PC Wallpapers
            </button>
            <button
              className={`category-tab-btn ${activeTab === "mobile" ? "active" : ""}`}
              onClick={() => setActiveTab("mobile")}
            >
              Mobile Wallpapers
            </button>
          </div>

          {isLoading ? (
            <p className="category-loading-text">🌀 Images loading, please wait...</p>
          ) : (
            <div className="category-wallpapers-gallery">
              {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).length > 0 ? (
                (activeTab === "pc" ? pcWallpapers : mobileWallpapers).map((wallpaper) => (
                  <div
                    key={wallpaper._id}
                    className={`category-wallpaper-card ${activeTab === "pc" ? "landscape" : "portrait"}`}
                    onClick={() => openModal(wallpaper)}
                  >
                    <img
                      src={getImageUrl(wallpaper.thumbnail_url || wallpaper.image_url)}
                      alt={wallpaper.name}
                      className="category-wallpaper-image"
                      loading="lazy"
                    />
                  </div>
                ))
              ) : (
                <p className="category-no-wallpapers">No {activeTab} wallpapers in this category.</p>
              )}
            </div>
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

        <section id="contact" className="category-contact-section">
          <h2 className="category-contact-heading">Contact Us</h2>
          <p className="category-contact-text">Developed and Maintained by Vatsal Bairagi</p>
          <div className="category-contact-info">
            <p>Email: <a href="mailto:support@wallpaperhub.com">support@wallpaperhub.com</a></p>
            <p>Instagram: <a href="https://instagram.com/wallpaperhub" target="_blank" rel="noreferrer">@wallpaperhub</a></p>
          </div>
          <form className="category-contact-form">
            <input type="text" className="category-input" placeholder="Your Name" required />
            <input type="email" className="category-input" placeholder="Your Email" required />
            <textarea className="category-textarea" placeholder="Your Message" required></textarea>
            <button type="button" className="category-submit-btn">Send Message</button>
          </form>
        </section>
      </main>

      <footer className="category-footer">
        <p>© 2025 WallpaperHub. Built and maintained with 💪 by <strong>Vatsal Bairagi</strong></p>
        <div className="category-social-links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://github.com/vatsalbairagi" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

const WallpaperModal = ({ wallpaper, onClose, onDownload, isDownloading, getImageUrl }) => (
  <div className="category-modal">
    <div className="category-modal-content">
      <button className="category-modal-close" onClick={onClose}>✕</button>
      <div className="category-modal-image-container">
        <img
          src={getImageUrl(wallpaper.image_url)}
          alt={wallpaper.name}
          className="category-modal-image"
        />
      </div>
      <div className="category-modal-details">
        <h2>{wallpaper.name}</h2>
        <p><strong>Description:</strong> {wallpaper.description}</p>
        <p><strong>Category:</strong> {wallpaper.category}</p>
        <p><strong>Device:</strong> {wallpaper.device}</p>
        <button
          onClick={() => onDownload(getImageUrl(wallpaper.image_url), wallpaper.name)}
          disabled={isDownloading}
          className="category-download-btn"
        >
          {isDownloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
    <div className="category-modal-backdrop" onClick={onClose}></div>
  </div>
);

export default CategoryPage;

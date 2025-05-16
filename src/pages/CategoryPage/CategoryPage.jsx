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
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://wallpaperhub-backend.onrender.com/api/get-wallpapers")
      .then((response) => response.json())
      .then((data) => setWallpapers(data.wallpapers))
      .catch((error) => console.error("Error fetching wallpapers:", error));

    fetch("https://wallpaperhub-backend.onrender.com/api/get-categories")
      .then((response) => response.json())
      .then((data) => setCategories(data.categories))
      .catch((error) => console.error("Error fetching categories:", error));

    // Escape key closes modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedWallpaper(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredWallpapers = selectedCategory
    ? wallpapers.filter((wallpaper) => wallpaper.category === selectedCategory)
    : wallpapers;

  const pcWallpapers = filteredWallpapers.filter((wp) => wp.device === "pc");
  const mobileWallpapers = filteredWallpapers.filter((wp) => wp.device === "mobile");

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);

  // Download with disabling and alert
  const handleDownload = async (url, name) => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "wallpaper.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      alert("Download started successfully!");
    } catch (error) {
      console.error("Error downloading the wallpaper:", error);
      alert("Failed to download the wallpaper. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin === "1234") {
      navigate("/admin");
    } else {
      setError("Incorrect PIN. Try again.");
    }
  };

  return (
    <div className="category-page-container">
      {/* ...rest of your JSX code... */}

      <section className="category-wallpapers">
        <h2 className="category-wallpapers-heading">{selectedCategory || "All"} Wallpapers</h2>
        <div className="category-tabs">
          <button
            className={`category-tab-btn ${activeTab === "pc" ? "active" : ""}`}
            onClick={() => setActiveTab("pc")}
          >PC Wallpapers</button>
          <button
            className={`category-tab-btn ${activeTab === "mobile" ? "active" : ""}`}
            onClick={() => setActiveTab("mobile")}
          >Mobile Wallpapers</button>
        </div>
        <div className="category-wallpapers-gallery">
          {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).length > 0 ? (
            (activeTab === "pc" ? pcWallpapers : mobileWallpapers).map((wallpaper) => (
              <div
                key={wallpaper._id}
                className={`category-wallpaper-card ${activeTab === "pc" ? "landscape" : "portrait"}`}
                onClick={() => openModal(wallpaper)}
              >
                <img
                  src={`https://wallpaperhub-backend.onrender.com${wallpaper.thumbnail_url || wallpaper.image_url}`}
                  alt={wallpaper.name}
                  className="category-wallpaper-image"
                  loading="lazy"
                />
              </div>
            ))
          ) : (
            <p className="category-no-wallpapers">No {activeTab === "pc" ? "PC" : "Mobile"} wallpapers available in this category.</p>
          )}
        </div>
      </section>

      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper}
          onClose={closeModal}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />
      )}

      {/* ...rest of your JSX code... */}
    </div>
  );
};

const WallpaperModal = ({ wallpaper, onClose, onDownload, isDownloading }) => (
  <div className="category-modal">
    <div className="category-modal-content">
      <button className="category-modal-close" onClick={onClose}>✕</button>
      <div className="category-modal-image-container">
        <img
          src={`https://wallpaperhub-backend.onrender.com${wallpaper.image_url}`}
          alt={wallpaper.name}
          className="category-modal-image"
        />
      </div>
      <div className="category-modal-details">
        <h2 className="category-modal-title">{wallpaper.name}</h2>
        <p className="category-modal-description"><strong>Description:</strong> {wallpaper.description}</p>
        <p className="category-modal-meta"><strong>Category:</strong> {wallpaper.category}</p>
        <p className="category-modal-meta"><strong>Device:</strong> {wallpaper.device}</p>
        <button
          className="category-download-btn"
          onClick={() => onDownload(`https://wallpaperhub-backend.onrender.com${wallpaper.image_url}`, wallpaper.name)}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
    <div className="category-modal-backdrop" onClick={onClose}></div>
  </div>
);

export default CategoryPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/customer/wishlist/${parsedUser.id}`);
        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeItem = async (serviceId) => {
    if (!user) return;
    try {
      await fetch(`http://localhost:5000/api/customer/wishlist/${user.id}/${serviceId}`, {
        method: "DELETE",
      });
      setWishlist(prev => prev.filter(item => item.serviceId !== serviceId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleBookNow = (item) => {
    if (!user) {
      alert("Please log in to book an appointment.");
      return;
    }
    // Navigate to SlotsPage with required state
    navigate(`/spa/${item.spaId}/slots`, {
      state: {
        selectedServices: [{
          id: item.serviceId,
          name: item.name,
          price: item.price
        }],
        spaName: item.spaName,
        ownerId: item.ownerId
      }
    });
  };

  if (loading) return <div className="wishlist-page page-content">Loading...</div>;
  if (!user) return <div className="wishlist-page page-content">Please log in to view your wishlist.</div>;

  return (
    <div className="wishlist-page page-content">
      <h1 className="wishlist-title">💖 Your Wishlist</h1>

      {/* EMPTY MESSAGE */}
      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <p>No items in your wishlist yet.</p>
          <p className="wishlist-sub">Start exploring spas & add your favorites!</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(item => (
            <div className="wishlist-card" key={item.serviceId}>
              <h3 className="wishlist-item-name">{item.name}</h3>
              <p className="wishlist-item-price">Rs. {item.price}</p>

              <div className="wishlist-actions">
                <button
                  className="wishlist-book-btn"
                  onClick={() => handleBookNow(item)}
                >
                  Book Now 📅
                </button>
                <button
                  className="wishlist-remove-btn"
                  onClick={() => removeItem(item.serviceId)}
                >
                  Remove ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;

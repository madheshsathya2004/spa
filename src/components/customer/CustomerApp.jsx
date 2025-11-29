import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "src\\components\\customer\\HomePage.jsx"
import SpaDetail from "./components/customer/SpaDetail";
import SlotsPage from "./components/customer/SlotsPage";
import PaymentPage from "./components/customer/PaymentPage";
import WishlistPage from "./components/customer/WishlistPage";
import MembershipPage from "./components/customer/MembershipPage";
import Bookings from "./components/customer/Bookings";
import ProfilePage from "./components/customer/ProfilePage";

export default function CustomerApp({ user, onLogout }) {
  return (
    <>
      {/* Optional: Customer navbar can go here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/spa/:spaId/:spaName" element={<SpaDetail />} />
        <Route path="/spa/:spaId/slots" element={<SlotsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/bookings/:userId" element={<Bookings />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

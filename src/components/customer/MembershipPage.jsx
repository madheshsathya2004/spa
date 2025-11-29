import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './index1.css';

const MembershipPage = () => {
  const [membership, setMembership] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/customer/membership");
        const data = await res.json();
        setMembership(data);
      } catch (err) {
        console.error("Failed to fetch membership:", err);
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchMembership();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) {
      setLoadingStatus(false);
      return;
    }

    const parsedUser = JSON.parse(stored);
    setCurrentUser(parsedUser);

    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/customer/membership/status/${parsedUser.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch membership status");
        }
        const data = await res.json();
        setMembershipStatus(data);
      } catch (err) {
        console.error("Failed to fetch membership status:", err);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchStatus();
  }, []);

  const applyMembership = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!membership) return;

    navigate(`/payment`, {
      state: {
        membershipDetails: {
          name: membership.name,
          amount: membership.amount,
          purpose: membership.purpose,
        },
      },
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString();
  };

  const isActive = membershipStatus?.status === "active";

  if (loadingPlan || loadingStatus) return <div className="page-content">Loading...</div>;
  if (!membership) return <div className="page-content">No membership available</div>;

  if (isActive) {
    return (
      <div className="page-content">
        <h2>Membership</h2>
        <div className="membership-card active-membership">
          <h3>{membershipStatus.planName || membership.name}</h3>
          <p className="price">Status: Active</p>
          <p>Start Date: {formatDate(membershipStatus.startDate)}</p>
          <p>End Date: {formatDate(membershipStatus.endDate)}</p>
          <p className="membership-note">Enjoy all membership benefits until your end date.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h2>Membership</h2>
      <div className="membership-card">
        <h3>{membership.name}</h3>
        <p className="price">{membership.amount}</p>
        <ul>
          {membership.benefits &&
            membership.benefits.map((benefit, idx) => <li key={idx}>{benefit}</li>)}
        </ul>
        <button className="btn-primary" onClick={applyMembership}>
          {currentUser ? "Apply Membership" : "Login to Apply"}
        </button>
      </div>
    </div>
  );
};

export default MembershipPage;
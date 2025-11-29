const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, "data", "db.json");

// Add this to your existing customer routes file (customer.routes.js)

const bcrypt = require('bcrypt');

/* ----------------------------------------------------
   PATCH /profile/update - Update user profile
-----------------------------------------------------*/
router.patch('/profile/update', async (req, res) => {
  const { userId, fullName, phone, currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const data = await req.app.locals.readDB();
  const user = data.users.find(u => u.id === parseInt(userId));

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update basic information
  if (fullName && fullName.trim().length >= 2) {
    user.fullName = fullName.trim();
  }

  if (phone && phone.trim().length >= 10) {
    user.phone = phone.trim();
  }

  // Handle password change if requested
  if (currentPassword && newPassword) {
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
  }

  // Save updated data
  await req.app.locals.writeDB(data);

  // Return updated user (without password)
  const userResponse = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    membership: user.membership
  };

  res.json({
    message: "Profile updated successfully",
    user: userResponse
  });
});


router.get('/spas', async (req, res) => {
    const { search } = req.query;
    const data = await req.app.locals.readDB();
    let spas = data.spas;

    if (search) {
        const term = search.toLowerCase();
        spas = spas.filter(s => s.name.toLowerCase().includes(term));
    }

    res.json(spas);
});

router.get('/spas/:spaId/services', async (req, res) => {
    const spaId = req.params.spaId;
    const data = await req.app.locals.readDB();

    const spaServices = data.services.filter(svc => String(svc.spaId) === String(spaId));

    if (spaServices.length === 0) {
        return res.status(404).json({ message: 'No services found for this spa.' });
    }

    res.json(spaServices);
});

router.post('/check-availability', async (req, res) => {
  const { spaId, selectedServices, date } = req.body; // 'date' is included but not used yet (can be added for future date-based logic)
  const data = await req.app.locals.readDB();
  if (!selectedServices || selectedServices.length === 0) {
    return res.json({ slots: [] });
  }
  let combinedSlots = [];
  selectedServices.forEach(service => {
    // Find the matching service in the DB by service ID and spaId (to ensure it belongs to the correct spa)
    const dbService = data.services.find(
      s => String(s.id) === String(service.id) && String(s.spaId) === String(spaId)
    );
    if (dbService && dbService.slots && Array.isArray(dbService.slots)) {
      combinedSlots.push(...dbService.slots);
    }
  });
  // Remove duplicates and return unique slots
  combinedSlots = [...new Set(combinedSlots)];
  res.json({ slots: combinedSlots });
});

router.post('/bookings', async (req, res) => {
  const {
    userId,
    spaId,
    spaName,
    ownerId,
    services,
    slot,
    date,
    totalPrice
  } = req.body;

  const data = await req.app.locals.readDB();

  if (!userId || !services || !slot || !date) {
    return res.status(400).json({ message: "Missing booking details" });
  }

  const computedPrice = services.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const finalPrice = typeof totalPrice !== 'undefined' ? Number(totalPrice) : computedPrice;

  const newBooking = {
    id: Date.now(),
    userId: parseInt(userId),
    spaId: parseInt(spaId),
    spaName,
    ownerId: parseInt(ownerId),
    services,
    slot,
    date,
    totalPrice: finalPrice,
    status: 'pending',
    createdAt: new Date().toISOString(),
    paymentMethod: null,
    discountPrice: 0,
    paymentDetails: null,
    paymentReference: null
  };

  data.bookings.push(newBooking);
  
  await req.app.locals.writeDB(data);

  res.status(201).json({
    message: "Booking created successfully with pending status",
    booking: newBooking
  });
});

router.get('/bookings/user/:userId', async (req, res) => {
  const data = await req.app.locals.readDB();
  const userId = parseInt(req.params.userId);
  
  const userBookings = data.bookings.filter(b => b.userId === userId);
  
  if (!userBookings || userBookings.length === 0) {
    return res.status(404).json({ message: "No bookings found for this user" });
  }
  
  res.json(userBookings);
});

router.get('/bookings/:id', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  
  const booking = data.bookings.find(b => b.id === id);
  
  if (!booking || booking.length === 0) {
    return res.status(404).json({ message: "Booking not found" });
  }
  
  res.json(booking);
});

router.patch('/bookings/:id/approve', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  
  const booking = data.bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  
  booking.status = 'approved';
  await req.app.locals.writeDB(data);
  
  res.json({
    message: "Booking approved successfully",
    booking
  });
});

router.patch('/bookings/:id/complete', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  const { paymentMethod, paymentDetails, totalPrice, discountPrice } = req.body;
  
  const booking = data.bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== 'approved') {
    return res.status(400).json({ message: "Booking must be approved before payment" });
  }
  
  booking.status = 'completed';
  booking.paymentMethod = paymentMethod;
  booking.paymentDetails = paymentDetails;
  booking.paymentReference = `PAY-${Date.now()}`;
  booking.paidAt = new Date().toISOString();
  booking.totalPrice = totalPrice;
  booking.discountPrice = discountPrice;
  
  await req.app.locals.writeDB(data);
  
  res.json({
    message: "Payment completed successfully",
    booking
  });
});

router.patch('/bookings/:id/cancel', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  const booking = data.bookings.find(b => b.id === id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (booking.status !== 'completed') {
    return res.status(400).json({ message: 'Only completed bookings can be cancelled/refunded' });
  }
  if (booking.refund && booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking has already been cancelled/refunded' });
  }

  // Find user
  const user = data.users.find(u => String(u.id) === String(booking.userId));
  let membershipStatus = 'inactive';
  let refundFull = false;

  if (user && user.membership && user.membership.status === 'active' && user.membership.endDate) {
    const now = new Date();
    const expiry = new Date(user.membership.endDate);
    if (expiry >= now) {
      membershipStatus = 'active';
      refundFull = true;
    } else {
      membershipStatus = 'expired';
    }
  }

  const baseAmount = Number(booking.totalPrice);
  let deductedAmount = 0;
  let refundAmount = baseAmount;
  if (!refundFull) {
    deductedAmount = +(baseAmount * 0.3).toFixed(2);
    refundAmount = +(baseAmount - deductedAmount).toFixed(2);
  }

  const refundObj = {
    refundAmount,
    deductedAmount,
    originalAmount: baseAmount,
    refundDate: new Date().toISOString(),
    refundStatus: 'refunded',
    membershipStatusAtCancel: membershipStatus
  };

  booking.status = 'cancelled';
  booking.refund = refundObj;

  await req.app.locals.writeDB(data);

  res.json({ message: 'Booking cancelled and refunded', refund: refundObj, booking });
});

router.get('/membership', async (req, res) => {
  const data = await req.app.locals.readDB();
  res.json(data.membership);
});

router.get('/membership/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const data = await req.app.locals.readDB();
  const user = data.users.find(u => String(u.id) === String(userId));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.membership && user.membership.endDate) {
    const now = new Date();
    const expiry = new Date(user.membership.endDate);
    if (expiry < now && user.membership.status === 'active') {
      user.membership.status = 'expired';
      await req.app.locals.writeDB(data);
    }
    return res.json(user.membership);
  }

  res.json({ status: 'inactive' });
});

router.post('/membership/activate', async (req, res) => {
  const { userId, planName } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  const data = await req.app.locals.readDB();
  const user = data.users.find(u => String(u.id) === String(userId));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  user.membership = {
    status: 'active',
    planName: planName || data.membership?.name || 'Spa Membership',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };

  await req.app.locals.writeDB(data);
  res.json({ membership: user.membership });
});

router.get('/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  const data = await req.app.locals.readDB();
  const wishlists = (data.wishlists || []).filter(
    item => String(item.userId) === String(userId)
  );

  // Enrich each wishlist item with spa details
  const enrichedWishlists = await Promise.all(
    wishlists.map(async (item) => {
      // Find the service by serviceId
      const service = data.services.find(s => String(s.id) === String(item.serviceId));
      if (!service) {
        // If service not found, return item as-is (or handle error)
        return item;
      }

      // Find the spa by spaId
      const spa = data.spas.find(s => String(s.id) === String(service.spaId));
      if (!spa) {
        // If spa not found, return item as-is
        return item;
      }

      // Add spa details to the item
      return {
        ...item,
        spaId: spa.id,
        spaName: spa.name,
        ownerId: spa.ownerId
      };
    })
  );

  res.json(enrichedWishlists);
});




router.post('/wishlist', async (req, res) => {
  const { serviceId, name, price, userId } = req.body;
  if (!serviceId || !userId) {
    return res.status(400).json({ message: 'serviceId and userId are required' });
  }

  const data = await req.app.locals.readDB();
  if (!data.wishlists) data.wishlists = [];

  const exists = data.wishlists.find(
    item => String(item.userId) === String(userId) && String(item.serviceId) === String(serviceId)
  );
  if (exists) {
    return res.status(400).json({ message: 'Item already in wishlist' });
  }

  const newEntry = { serviceId, name, price, userId };
  data.wishlists.push(newEntry);
  await req.app.locals.writeDB(data);
  res.status(201).json(newEntry);
});

router.delete('/wishlist/:userId/:serviceId', async (req, res) => {
  const { userId, serviceId } = req.params;
  const data = await req.app.locals.readDB();

  const before = data.wishlists ? data.wishlists.length : 0;
  data.wishlists = (data.wishlists || []).filter(
    item => !(String(item.userId) === String(userId) && String(item.serviceId) === String(serviceId))
  );
  const after = data.wishlists.length;

  await req.app.locals.writeDB(data);
  res.json({ message: before === after ? 'No item removed' : 'Removed from wishlist' });
});

module.exports = router;
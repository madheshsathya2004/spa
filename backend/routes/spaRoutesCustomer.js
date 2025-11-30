const express = require('express');
const router = express.Router();
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

  if (fullName && fullName.trim().length >= 2) {
    user.fullName = fullName.trim();
  }

  if (phone && phone.trim().length >= 10) {
    user.phone = phone.trim();
  }

  if (currentPassword && newPassword) {
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
  }

  await req.app.locals.writeDB(data);

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

/* ----------------------------------------------------
   GET /spas - Get all APPROVED spas only
-----------------------------------------------------*/
router.get('/spas', async (req, res) => {
    const { search } = req.query;
    const data = await req.app.locals.readDB();
    
    let spas = data.spas.filter(s => s.status === 'APPROVED');

    if (search) {
        const term = search.toLowerCase();
        spas = spas.filter(s => s.name.toLowerCase().includes(term));
    }

    res.json(spas);
});

/* ----------------------------------------------------
   GET single spa by ID (only if APPROVED)
-----------------------------------------------------*/
router.get('/spas/:spaId', async (req, res) => {
  const { spaId } = req.params;
  const data = await req.app.locals.readDB();
  
  const spa = data.spas.find(s => String(s.id) === String(spaId));
  
  if (!spa) {
    return res.status(404).json({ message: 'Spa not found' });
  }

  if (spa.status !== 'APPROVED' && spa.available === 'true') {
    return res.status(403).json({ message: 'Spa is not approved for booking' });
  }
  
  res.json(spa);
});

/* ----------------------------------------------------
   GET spa owner info
-----------------------------------------------------*/
router.get('/spas/:spaId/owner', async (req, res) => {
  const { spaId } = req.params;
  const data = await req.app.locals.readDB();
  
  const spa = data.spas.find(s => String(s.id) === String(spaId));
  
  if (!spa) {
    return res.status(404).json({ message: 'Spa not found' });
  }
  
  res.json({ 
    ownerId: spa.ownerId,
    spaName: spa.name,
    spaId: spa.id
  });
});

/* ----------------------------------------------------
   GET services by spa ID (only APPROVED services)
-----------------------------------------------------*/
router.get('/spas/:spaId/services', async (req, res) => {
    const spaId = req.params.spaId;
    const data = await req.app.locals.readDB();

    const spa = data.spas.find(s => String(s.id) === String(spaId));
    if (!spa) {
        return res.status(404).json({ message: 'Spa not found.' });
    }
    
    if (spa.status !== 'APPROVED') {
        return res.status(403).json({ message: 'Spa is not approved for booking.' });
    }

    const spaServices = data.services.filter(
        svc => String(svc.spaId) === String(spaId) && svc.status === 'approved' && svc.available
    );

    if (spaServices.length === 0) {
        return res.status(404).json({ message: 'No approved services found for this spa.' });
    }

    res.json(spaServices);
});

/* ----------------------------------------------------
   POST check availability
-----------------------------------------------------*/
router.post('/check-availability', async (req, res) => {
  const { spaId, selectedServices, date } = req.body;
  const data = await req.app.locals.readDB();
  
  if (!selectedServices || selectedServices.length === 0) {
    return res.json({ slots: [] });
  }
  
  let combinedSlots = [];
  
  selectedServices.forEach(service => {
    const dbService = data.services.find(
      s => String(s.id) === String(service.id) && 
           String(s.spaId) === String(spaId) &&
           s.status === 'approved' && s.available
    );
    
    if (dbService && dbService.slots && Array.isArray(dbService.slots)) {
      combinedSlots.push(...dbService.slots);
    }
  });
  
  combinedSlots = [...new Set(combinedSlots)];
  
  // Check which slots are already booked for the selected date
  const slotsWithAvailability = combinedSlots.map(slot => {
    // Find conflicting bookings for this specific slot
    const isBooked = data.bookings.some(booking => {
      const isSameSpa = String(booking.spaId) === String(spaId);
      const isSameDate = String(booking.date) === String(date);
      const isSameSlot = String(booking.slot) === String(slot);
      const isNotCancelled = booking.status !== 'cancelled';

      if (!isSameSpa || !isSameDate || !isSameSlot || !isNotCancelled) {
        return false;
      }

      // Check if any of the requested services overlap with this booking's services
      const requestedServiceIds = selectedServices.map(s => String(s.id));
      const bookedServiceIds = (booking.services || []).map(s => String(s.id));

      return requestedServiceIds.some(reqId => bookedServiceIds.includes(reqId));
    });

    return {
      time: slot,
      isBooked: isBooked
    };
  });
  
  res.json({ slots: slotsWithAvailability });
});


router.post('/bookings/validate-slot', async (req, res) => {
  const { spaId, date, slot, services } = req.body;

  if (!spaId || !date || !slot || !services) {
    return res.status(400).json({ 
      available: false,
      message: "Missing required fields" 
    });
  }

  const data = await req.app.locals.readDB();

  // Find all bookings for this spa on this date with this slot
  // that are NOT cancelled
  const conflictingBookings = data.bookings.filter(booking => {
    // Check basic criteria
    const isSameSpa = String(booking.spaId) === String(spaId);
    const isSameDate = String(booking.date) === String(date);
    const isSameSlot = String(booking.slot) === String(slot);
    const isNotCancelled = booking.status !== 'cancelled';

    if (!isSameSpa || !isSameDate || !isSameSlot || !isNotCancelled) {
      return false;
    }

    // Check if any of the requested services overlap with this booking's services
    const requestedServiceIds = services.map(s => String(s.id));
    const bookedServiceIds = (booking.services || []).map(s => String(s.id));

    // Check for service overlap
    const hasServiceOverlap = requestedServiceIds.some(reqId => 
      bookedServiceIds.includes(reqId)
    );

    return hasServiceOverlap;
  });

  if (conflictingBookings.length > 0) {
    return res.json({
      available: false,
      message: "This slot is already booked for one or more of the selected services",
      conflictingBookings: conflictingBookings.map(b => ({
        id: b.id,
        services: b.services.map(s => s.name)
      }))
    });
  }

  return res.json({
    available: true,
    message: "Slot is available"
  });
});


/* ----------------------------------------------------
   GET bookings by user ID
-----------------------------------------------------*/
router.get('/bookings/user/:userId', async (req, res) => {
  const data = await req.app.locals.readDB();
  const userId = parseInt(req.params.userId);
  
  const userBookings = data.bookings.filter(b => b.userId === userId);
  
  if (!userBookings || userBookings.length === 0) {
    return res.status(404).json({ message: "No bookings found for this user" });
  }
  
  res.json(userBookings);
});

/* ----------------------------------------------------
   GET single booking
-----------------------------------------------------*/
router.get('/bookings/:id', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  
  const booking = data.bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  
  res.json(booking);
});

/* ----------------------------------------------------
   PATCH approve booking
-----------------------------------------------------*/
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

/* ----------------------------------------------------
   PATCH complete booking payment
   Now stores customer and merchant UPI IDs
-----------------------------------------------------*/
router.patch('/bookings/:id/complete', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  const { 
    paymentMethod, 
    paymentDetails, 
    totalPrice, 
    discountPrice, 
    paymentReference,
    customerUpiId,
    merchantUpiId
  } = req.body;
  
  const booking = data.bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== 'approved') {
    return res.status(400).json({ message: "Booking must be approved before payment" });
  }
  
  // Update booking with payment details and UPI IDs
  booking.status = 'completed';
  booking.paymentMethod = paymentMethod;
  booking.paymentDetails = paymentDetails;
  booking.paymentReference = paymentReference || `PAY-${Date.now()}`;
  booking.paidAt = new Date().toISOString();
  booking.totalPrice = totalPrice || booking.totalPrice;
  booking.discountPrice = discountPrice || 0;
  booking.customerUpiId = customerUpiId || null;  // Store customer UPI ID
  booking.merchantUpiId = merchantUpiId || null;  // Store merchant UPI ID
  
  await req.app.locals.writeDB(data);
  
  res.json({
    message: "Payment completed successfully",
    booking
  });
});

/* ----------------------------------------------------
   PATCH cancel booking - Use stored UPI IDs for refund
-----------------------------------------------------*/

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

  // VALIDATION: Check if slot is still available before creating booking
  const conflictingBookings = data.bookings.filter(booking => {
    const isSameSpa = String(booking.spaId) === String(spaId);
    const isSameDate = String(booking.date) === String(date);
    const isSameSlot = String(booking.slot) === String(slot);
    const isNotCancelled = booking.status !== 'cancelled';

    if (!isSameSpa || !isSameDate || !isSameSlot || !isNotCancelled) {
      return false;
    }

    const requestedServiceIds = services.map(s => String(s.id));
    const bookedServiceIds = (booking.services || []).map(s => String(s.id));

    return requestedServiceIds.some(reqId => bookedServiceIds.includes(reqId));
  });

  if (conflictingBookings.length > 0) {
    return res.status(409).json({ 
      message: "This slot is already booked for one or more of the selected services. Please choose a different time slot.",
      conflictingBookings: conflictingBookings.map(b => ({
        id: b.id,
        services: b.services.map(s => s.name)
      }))
    });
  }

  // Proceed with booking creation
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

router.patch('/bookings/:id/cancel', async (req, res) => {
  const data = await req.app.locals.readDB();
  const id = parseInt(req.params.id);
  const { 
    refundAmount, 
    deductedAmount, 
    membershipStatusAtCancel, 
    refundTransactionId, 
    refundDetails 
  } = req.body;
  
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

  // Create refund object with UPI IDs from booking
  const refundObj = {
    refundAmount: refundAmount || 0,
    deductedAmount: deductedAmount || 0,
    originalAmount: Number(booking.totalPrice),
    refundDate: new Date().toISOString(),
    refundStatus: 'refunded',
    membershipStatusAtCancel: membershipStatusAtCancel || 'unknown',
    refundTransactionId: refundTransactionId || null,
    refundDetails: refundDetails || null,
    customerUpiId: booking.customerUpiId,  // Store for reference
    merchantUpiId: booking.merchantUpiId   // Store for reference
  };

  booking.status = 'cancelled';
  booking.refund = refundObj;

  await req.app.locals.writeDB(data);

  res.json({ 
    message: 'Booking cancelled and refunded', 
    refund: refundObj, 
    booking 
  });
});

/* ----------------------------------------------------
   MEMBERSHIP ROUTES
-----------------------------------------------------*/
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

/* ----------------------------------------------------
   WISHLIST ROUTES
-----------------------------------------------------*/
router.get('/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  const data = await req.app.locals.readDB();
  const wishlists = (data.wishlists || []).filter(
    item => String(item.userId) === String(userId)
  );

  const enrichedWishlists = await Promise.all(
    wishlists.map(async (item) => {
      const service = data.services.find(s => String(s.id) === String(item.serviceId));
      if (!service) {
        return item;
      }

      const spa = data.spas.find(s => String(s.id) === String(service.spaId));
      if (!spa) {
        return item;
      }

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
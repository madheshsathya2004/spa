const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Path to single JSON file
const BANK_FILE = path.join(__dirname, '../data/bank.json');

// Helper function to read JSON file
async function readBankData() {
  try {
    const data = await fs.readFile(BANK_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initialData = {
        users: [],
        accounts: [],
        transactions: []
      };
      await writeBankData(initialData);
      return initialData;
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeBankData(data) {
  await fs.writeFile(BANK_FILE, JSON.stringify(data, null, 2));
}

// Generate unique transaction ID
function generateTransactionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /api/payment/external
 * External Payment API - Match accounts by UPI ID
 */
router.post('/external', async (req, res) => {
  try {
    const { amount, merchant, paymentMethod, orderId, description } = req.body;

    if (!amount || !merchant || !paymentMethod || !orderId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { identifier: merchantUpiId, name: merchantName } = merchant;
    const { type, details } = paymentMethod;

    if (type !== 'upi') {
      return res.status(400).json({ message: 'Only UPI payments supported' });
    }

    const { upiId: customerUpiId, pin: customerPin } = details;

    // Read bank data
    const bankData = await readBankData();

    // Find customer by UPI ID
    const customer = bankData.users.find(u => u.upiID === customerUpiId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer UPI ID not found' });
    }

    if (!customer.upiEnabled) {
      return res.status(400).json({ message: 'UPI not enabled for customer' });
    }

    if (customer.upiPin !== customerPin) {
      return res.status(401).json({ message: 'Invalid UPI PIN' });
    }

    if (customer.status !== 'active') {
      return res.status(400).json({ message: 'Customer account is not active' });
    }

    // Find customer's account by matching userId
    const customerAccount = bankData.accounts.find(
      a => a.userId === customer.id && a.isPrimary && a.status === 'active'
    );
    if (!customerAccount) {
      return res.status(404).json({ message: 'Customer bank account not found' });
    }

    // Check balance
    if (customerAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Find merchant by UPI ID
    const merchantUser = bankData.users.find(u => u.upiID === merchantUpiId);
    if (!merchantUser) {
      return res.status(404).json({ message: 'Merchant UPI ID not found' });
    }

    // Find merchant's account by matching userId
    const merchantAccount = bankData.accounts.find(
      a => a.userId === merchantUser.id && a.isPrimary && a.status === 'active'
    );
    if (!merchantAccount) {
      return res.status(404).json({ message: 'Merchant bank account not found' });
    }

    // Process transaction
    customerAccount.balance -= amount;
    merchantAccount.balance += amount;

    // Create transaction record
    const transactionId = generateTransactionId();
    const transaction = {
      transactionId,
      orderId,
      description,
      amount,
      type: 'payment',
      status: 'success',
      from: {
        userId: customer.id,
        upiId: customerUpiId,
        accountId: customerAccount.accountId,
        name: customer.profile.name
      },
      to: {
        userId: merchantUser.id,
        upiId: merchantUpiId,
        accountId: merchantAccount.accountId,
        name: merchantName
      },
      timestamp: new Date().toISOString()
    };

    // Add transaction and save
    bankData.transactions.push(transaction);
    await writeBankData(bankData);

    // Return success response
    res.json({
      status: 'success',
      transactionId,
      message: 'Payment processed successfully',
      merchantName,
      amount
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
});

/**
 * POST /api/payment/refund
 * Process refund - Match accounts by UPI ID
 */
router.post('/refund', async (req, res) => {
  try {
    const { amount, customer, merchant, orderId, description } = req.body;

    if (!amount || !customer || !merchant || !orderId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { identifier: customerUpiId, name: customerName } = customer;
    const { identifier: merchantUpiId, pin: merchantPin } = merchant;

    // Read bank data
    const bankData = await readBankData();

    // Find merchant (who is issuing refund) by UPI ID
    const merchantUser = bankData.users.find(u => u.upiID === merchantUpiId);
    if (!merchantUser) {
      return res.status(404).json({ message: 'Merchant UPI ID not found' });
    }

    // Verify merchant PIN
    if (merchantUser.upiPin !== merchantPin) {
      return res.status(401).json({ message: 'Invalid merchant PIN' });
    }

    // Find customer (who receives refund) by UPI ID
    const customerUser = bankData.users.find(u => u.upiID === customerUpiId);
    if (!customerUser) {
      return res.status(404).json({ message: 'Customer UPI ID not found' });
    }

    // Find accounts by matching userId
    const merchantAccount = bankData.accounts.find(
      a => a.userId === merchantUser.id && a.isPrimary && a.status === 'active'
    );
    const customerAccount = bankData.accounts.find(
      a => a.userId === customerUser.id && a.isPrimary && a.status === 'active'
    );

    if (!merchantAccount || !customerAccount) {
      return res.status(404).json({ message: 'Bank accounts not found' });
    }

    // Check merchant balance for refund
    if (merchantAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient merchant balance for refund' });
    }

    // Process refund
    merchantAccount.balance -= amount;
    customerAccount.balance += amount;

    // Create transaction record
    const transactionId = generateTransactionId();
    const transaction = {
      transactionId,
      orderId,
      description,
      amount,
      type: 'refund',
      status: 'success',
      from: {
        userId: merchantUser.id,
        upiId: merchantUpiId,
        accountId: merchantAccount.accountId,
        name: merchantUser.profile?.name || 'Merchant'
      },
      to: {
        userId: customerUser.id,
        upiId: customerUpiId,
        accountId: customerAccount.accountId,
        name: customerName || customerUser.profile?.name
      },
      timestamp: new Date().toISOString()
    };

    // Add transaction and save
    bankData.transactions.push(transaction);
    await writeBankData(bankData);

    // Return success response
    res.json({
      status: 'success',
      transactionId,
      message: 'Refund processed successfully',
      customerName: customerName || customerUser.profile?.name,
      amount
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Refund processing failed', error: error.message });
  }
});

/**
 * GET /api/payment/balance/:upiId
 * Get account balance by UPI ID
 */
router.get('/balance/:upiId', async (req, res) => {
  try {
    const { upiId } = req.params;

    const bankData = await readBankData();
    const user = bankData.users.find(u => u.upiID === upiId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const account = bankData.accounts.find(
      a => a.userId === user.id && a.isPrimary
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({
      upiId,
      name: user.profile?.name,
      balance: account.balance,
      accountId: account.accountId,
      accountType: account.type,
      status: account.status
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch balance', error: error.message });
  }
});

/**
 * GET /api/payment/transactions/:upiId
 * Get transaction history for a UPI ID
 */
router.get('/transactions/:upiId', async (req, res) => {
  try {
    const { upiId } = req.params;
    const { limit = 50, type } = req.query;

    const bankData = await readBankData();
    const user = bankData.users.find(u => u.upiID === upiId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter transactions involving this UPI ID
    let transactions = bankData.transactions.filter(
      t => t.from.upiId === upiId || t.to.upiId === upiId
    );

    // Filter by type if specified
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    transactions = transactions.slice(0, parseInt(limit));

    res.json({
      upiId,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

/**
 * POST /api/payment/initialize-data
 * Initialize bank.json with sample data
 */
router.post('/initialize-data', async (req, res) => {
  try {
    const sampleData = {
      users: [
        {
          id: "customer-1",
          phone: "9000090000",
          password: "Password@123",
          role: "customer",
          upiID: "9000090000@bank",
          upiEnabled: true,
          upiPin: "1234",
          status: "active",
          profile: {
            name: "Kalki",
            email: "kalki@example.com",
            joinedDate: "2025-11-25T10:21:36.271Z"
          }
        },
        {
          id: "owner-1",
          phone: "9791273986",
          password: "Password@123",
          role: "owner",
          upiID: "9791273986@bank",
          upiEnabled: true,
          upiPin: "5678",
          status: "active",
          profile: {
            name: "Spa Owner",
            email: "spaowner@example.com",
            joinedDate: "2025-11-20T10:21:36.271Z"
          }
        },
        {
          id: "customer-2",
          phone: "9876543210",
          password: "Password@123",
          role: "customer",
          upiID: "9876543210@bank",
          upiEnabled: true,
          upiPin: "9999",
          status: "active",
          profile: {
            name: "John Doe",
            email: "john@example.com",
            joinedDate: "2025-11-26T10:21:36.271Z"
          }
        }
      ],
      accounts: [
        {
          accountId: "acc-customer-1",
          userId: "customer-1",
          balance: 50000,
          type: "savings",
          status: "active",
          isPrimary: true,
          card: {
            number: "4111111111111111",
            cvv: "123",
            expiry: "2030-12-31",
            pin: "1234"
          },
          createdAt: new Date().toISOString()
        },
        {
          accountId: "acc-owner-1",
          userId: "owner-1",
          balance: 10000,
          type: "business",
          status: "active",
          isPrimary: true,
          card: {
            number: "7166667414514994",
            cvv: "999",
            expiry: "2035-11-27",
            pin: "5678"
          },
          createdAt: "2025-11-27T10:25:07.441Z"
        },
        {
          accountId: "acc-customer-2",
          userId: "customer-2",
          balance: 25000,
          type: "savings",
          status: "active",
          isPrimary: true,
          card: {
            number: "5555555555554444",
            cvv: "456",
            expiry: "2032-06-30",
            pin: "9999"
          },
          createdAt: "2025-11-28T00:00:00.000Z"
        }
      ],
      transactions: []
    };

    await writeBankData(sampleData);

    res.json({
      message: 'Bank data initialized successfully',
      usersCount: sampleData.users.length,
      accountsCount: sampleData.accounts.length,
      users: sampleData.users.map(u => ({
        id: u.id,
        name: u.profile.name,
        upiId: u.upiID,
        role: u.role
      }))
    });

  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize data', error: error.message });
  }
});

/**
 * GET /api/payment/all-data
 * Get all bank data (for debugging)
 */
router.get('/all-data', async (req, res) => {
  try {
    const bankData = await readBankData();
    res.json(bankData);
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch data', error: error.message });
  }
});

module.exports = router;
export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse admin wallets from the environment
        const adminWallets = process.env.ADMIN_WALLETS;

        // Validate the request body
        const { walletAddy } = req.body;
        if (!walletAddy) {
            return res.status(400).json({ error: 'walletAddy is required' });
        }

        // Check if the wallet address exists in the admin wallets list
        const result = adminWallets.includes(walletAddy);

        // Log environment variable presence (sanitized)
        console.log('MAINNET_RPC is configured:', !!process.env.MAINNET_RPC);

        // Respond with the result
        return res.status(200).json({ result });
    } catch (error) {
        console.error('Error occurred in /api/isAdmin:', error.message);
        return res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
}

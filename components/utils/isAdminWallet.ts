export const isAdminWallet = async (walletAddy: string) => {
    console.log(walletAddy, 'walletAddy');
    try {
        const response = await fetch('/api/isAdmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddy }),
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const resultData = await response.json();
        return resultData.result;
    } catch (error) {
        console.error('Error fetching the key:', error.message);
        return false;
    }
};

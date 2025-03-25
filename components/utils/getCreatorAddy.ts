export const getCreatorAddy = async () => {
    try {
        const response = await fetch('/api/fetchCreatorEncode');
        const dataResponse = await response.json();
        const dataEncode = Buffer.from(dataResponse.encode, 'base64').toString('utf-8');
        return dataEncode;
    } catch (error) {
        console.error('Error fetching the key:', error);
        return false;
    }
};
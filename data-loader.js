// Data loader with better error handling and performance
async function loadData() {
    try {
        const response = await fetch('data/nextflix_titles.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.Sheet1 || data; // Handle both possible data structures
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Export the function
export { loadData }; 
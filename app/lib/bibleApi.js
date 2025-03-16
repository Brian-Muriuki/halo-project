import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_SCRIPTURE_API_KEY;
const BASE_URL = 'https://api.scripture.api.bible/v1';

// Fetch a specific verse
export const getVerse = async (reference, bibleId) => {
  try {
    const url = `${BASE_URL}/bibles/${bibleId}/verses/${reference}`;

    const response = await axios.get(url, {
      headers: {
        'api-key': API_KEY,
        'accept': 'application/json',
      },
    });

    // Enhanced Error Handling
    if (response.status !== 200) {
      return handleErrorResponse(response.status, response.data);
    }

    const verseText = response.data.data.content;
    return verseText;
  } catch (error) {
    // Handle network errors or exceptions
    console.error('Error fetching verse:', error);
    return 'An error occurred while fetching the verse.';
  }
};

// Search for verses
export const searchVerses = async (query, bibleId) => {
  try {
    const url = `${BASE_URL}/bibles/${bibleId}/search?query=${query}`;

    const response = await axios.get(url, {
      headers: {
        'api-key': API_KEY,
        'accept': 'application/json',
      },
    });

    // Enhanced Error Handling
    if (response.status !== 200) {
      return handleErrorResponse(response.status, response.data);
    }

    const results = response.data.data.verses;
    return results;
  } catch (error) {
    // Handle network errors or exceptions
    console.error('Error searching verses:', error);
    return 'An error occurred while searching for verses.';
  }
};

// Helper function to handle API errors
const handleErrorResponse = (status, data) => {
  let errorMessage = 'An unknown error occurred.';

  switch (status) {
    case 400:
      errorMessage = 'Invalid request. Please check your input.';
      break;
    case 401:
      errorMessage = 'Authentication failed. Please check your API key.';
      break;
    case 403:
      errorMessage = 'You are not authorized to access this resource.';
      break;
    case 404:
      errorMessage = 'The requested resource was not found.';
      break;
    case 429:
      errorMessage = 'Too many requests. Please try again later.'; // Handle rate limiting status
      break;
    case 500:
      errorMessage = 'Internal server error. Please try again later.';
      break;
    // Add more cases as needed
  }

  console.error('API Error:', status, data); // Log the detailed error
  return errorMessage;
};

// Fetch available Bible versions
export const getBibleVersions = async () => {
  try {
    const url = `${BASE_URL}/bibles`;
    const response = await axios.get(url, {
      headers: {
        'api-key': API_KEY,
        'accept': 'application/json',
      },
    });

    if (response.status !== 200) {
      return handleErrorResponse(response.status, response.data);
    }

    const versions = response.data.data;
    return versions;
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return 'Error fetching Bible versions';
  }
};
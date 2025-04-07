import axios from 'axios';
import { csrfHeaderStandalone } from '@/app/context/CsrfContext';

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
        ...csrfHeaderStandalone(),
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
    return handleErrorResponse(error);
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
        ...csrfHeaderStandalone(),
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
    return handleErrorResponse(error);
  }
};

// Helper function to handle API errors
const handleErrorResponse = (errorOrStatus, data = null) => {
  let status;
  let responseData;
  let errorMessage = 'An unknown error occurred while communicating with the Bible API.'; // Default message

  // Check if it's an error object (likely from catch block) or just a status code
  if (typeof errorOrStatus === 'object' && errorOrStatus !== null && errorOrStatus.isAxiosError) {
    // --- Handle Axios error structure ---
    console.error('API Error:', errorOrStatus.message);
    if (errorOrStatus.response) {
      // Got a response from the server (e.g., 4xx, 5xx)
      status = errorOrStatus.response.status;
      responseData = errorOrStatus.response.data;
      console.error('API Response Error Details:', status, responseData);
    } else if (errorOrStatus.request) {
      // Request was made but no response received (network error)
      console.error('API Network Error:', errorOrStatus.request);
      errorMessage = 'Could not connect to the Bible API. Please check your network connection.';
      return errorMessage; // Return early for network errors
    } else {
      // Something happened in setting up the request
      console.error('API Request Setup Error:', errorOrStatus.message);
      errorMessage = 'An error occurred while preparing the request to the Bible API.';
      return errorMessage; // Return early for setup errors
    }
  } else if (typeof errorOrStatus === 'number') {
     // --- Handle direct status code pass (original usage) ---
    status = errorOrStatus;
    responseData = data;
     console.error('API Error:', status, responseData); // Log the detailed error
  } else {
    // --- Handle unexpected error types ---
    console.error('Unknown Error Type in handleErrorResponse:', errorOrStatus);
    return errorMessage; // Return default message
  }


  // --- Use extracted status for the switch ---
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
      errorMessage = 'Bible API internal server error. Please try again later.';
      break;
    // Add more cases as needed
    default:
      // Keep the default message if status is not specifically handled
      errorMessage = `Received an unexpected status (${status}) from the Bible API.`;
      break; // Added break statement
  }

  // --- Log original data if available ---
  // console.error('API Error:', status, responseData); // Moved logging earlier
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
        ...csrfHeaderStandalone(),
      },
    });

    if (response.status !== 200) {
      return handleErrorResponse(response.status, response.data);
    }

    const versions = response.data.data;
    return versions;
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return handleErrorResponse(error);
  }
};
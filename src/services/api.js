// Central API service for handling all backend communication
// Uses axios for HTTP requests to make API calls simpler and more consistent
import axios from 'axios';

// Base URL for all API requests
// Using a REST service deployed on Rahtiapp
const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

// Main API service object containing all available operations
// Each function handles a specific API endpoint and returns a Promise
const api = {
  // CUSTOMER OPERATIONS
  
  // Fetches all customers from the backend
  // Returns an array of customer objects with their details
  getCustomers: async () => {
    const response = await axios.get(`${BASE_URL}/customers`);
    return response.data._embedded.customers;
  },

  // Creates a new customer in the system
  // Takes a customer object with firstname, lastname, email, etc.
  // Returns the created customer with their generated ID
  addCustomer: async (customer) => {
    const response = await axios.post(`${BASE_URL}/customers`, customer);
    return response.data;
  },

  // Updates an existing customer's information
  // Requires the full customer URL (from _links.self.href) and updated customer data
  // Returns the updated customer object
  updateCustomer: async (customerUrl, customer) => {
    const response = await axios.put(customerUrl, customer);
    return response.data;
  },

  // Removes a customer from the system
  // Requires the full customer URL (from _links.self.href)
  // Returns nothing on success, throws error on failure
  deleteCustomer: async (customerUrl) => {
    await axios.delete(customerUrl);
  },

  // TRAINING OPERATIONS
  
  // Fetches all training sessions, including customer information
  // Returns an array of training sessions with details like date, duration, activity
  getTrainings: async () => {
    const response = await axios.get(`${BASE_URL}/gettrainings`);
    return response.data;
  },

  // Creates a new training session
  // Takes training data including date, duration, activity, and customer reference
  // Returns the created training session with its ID
  addTraining: async (training) => {
    const response = await axios.post(`${BASE_URL}/trainings`, training);
    return response.data;
  },

  // Removes a training session
  // Takes the training session's ID
  // Returns nothing on success, throws error on failure
  deleteTraining: async (trainingId) => {
    await axios.delete(`${BASE_URL}/trainings/${trainingId}`);
  },
};

export default api;
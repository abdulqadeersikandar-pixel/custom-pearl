import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_URL } from "../config";
const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Base URL for API
    const API_URL = 'https://custom-pearl-backend.onrender.com/api';

    const fetchMyOrders = async (phone) => {
        if (!phone) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/my-orders/${phone}`);
            setOrders(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Orders fetch karne mein masla aaya.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const trackSingleOrder = async (trackingId) => {
        try {
            const response = await axios.get(`${API_URL}/track/${trackingId}`);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Is Tracking ID ka koi order nahi mila.');
        }
    };

    return (
        <OrderContext.Provider value={{ orders, loading, error, fetchMyOrders, trackSingleOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => useContext(OrderContext);
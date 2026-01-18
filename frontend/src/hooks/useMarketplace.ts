import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi } from '../api/endpoints';
import { Product, Order } from '../types';
import { toast } from 'react-hot-toast';

export const useMarketplace = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<{ buyOrders: Order[], sellOrders: Order[] }>({ buyOrders: [], sellOrders: [] });

    const fetchProducts = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await marketplaceApi.getProducts(params);
            setProducts(response.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await marketplaceApi.getOrders();
            setOrders({
                buyOrders: response.data.buyOrders,
                sellOrders: response.data.sellOrders
            });
        } catch (error: any) {
            toast.error('Failed to fetch orders');
        }
    }, []);

    const createListing = async (data: any) => {
        try {
            await marketplaceApi.createProduct(data);
            toast.success('Listing created successfully!');
            fetchProducts();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create listing');
            return false;
        }
    };

    const buyProduct = async (productId: string) => {
        try {
            const response = await marketplaceApi.createPaymentIntent(productId);
            return response.data; // clientSecret and orderId
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to initiate purchase');
            return null;
        }
    };

    const confirmDelivery = async (orderId: string) => {
        try {
            await marketplaceApi.confirmDelivery(orderId);
            toast.success('Delivery confirmed!');
            fetchOrders();
        } catch (error: any) {
            toast.error('Failed to confirm delivery');
        }
    };

    return {
        products,
        loading,
        orders,
        fetchProducts,
        fetchOrders,
        createListing,
        buyProduct,
        confirmDelivery
    };
};

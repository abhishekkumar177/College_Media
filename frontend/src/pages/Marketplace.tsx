import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../hooks/useMarketplace';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { Product } from '../types';
import { FaSearch, FaFilter, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Marketplace: React.FC = () => {
    const { products, loading, fetchProducts, buyProduct } = useMarketplace();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts({ search: searchTerm, category });
    }, [searchTerm, category, fetchProducts]);

    const handleBuy = async (product: Product) => {
        const result = await buyProduct(product._id);
        if (result && result.success) {
            // In a real app, this would redirect to Stripe Checkout or open Stripe Elements
            window.location.href = `/checkout/${result.orderId}?secret=${result.clientSecret}`;
        }
    };

    const categories = ['All', 'Books', 'Electronics', 'Dorm Essentials', 'Clothing', 'Services', 'Other'];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-text-primary mb-2">Campus Marketplace</h1>
                    <p className="text-text-secondary text-base">Safely buy and sell essentials within your college community.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">
                        <FaPlus /> Post Item
                    </button>
                    <button className="flex items-center justify-center w-12 h-12 bg-bg-secondary border border-border rounded-2xl text-text-primary hover:bg-bg-tertiary transition-all">
                        <FaShoppingCart />
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
                <div className="relative flex-1 group">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-brand-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for textbooks, monitors, bikes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-bg-secondary border border-border rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat === 'All' ? '' : cat)}
                            className={`px-5 py-3 whitespace-nowrap rounded-2xl text-xs font-bold transition-all border ${(cat === 'All' && !category) || category === cat
                                    ? 'bg-text-primary text-white border-text-primary'
                                    : 'bg-bg-secondary text-text-secondary border-border hover:border-brand-primary/50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[3/4] bg-bg-secondary rounded-2xl" />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onBuy={handleBuy}
                            onView={(p) => setSelectedProduct(p)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-bg-secondary rounded-3xl border-2 border-dashed border-border">
                    <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaSearch className="text-2xl text-text-secondary opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">No items found</h3>
                    <p className="text-text-secondary text-sm">Try adjusting your filters or search terms.</p>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onBuy={handleBuy}
                />
            )}
        </div>
    );
};

export default Marketplace;

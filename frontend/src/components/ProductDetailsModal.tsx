import React from 'react';
import { Product } from '../types';
import { FaTimes, FaMapMarkerAlt, FaClock, FaShieldAlt, FaUser } from 'react-icons/fa';

interface ProductDetailsModalProps {
    product: Product;
    onClose: () => void;
    onBuy: (product: Product) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose, onBuy }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-bg-secondary rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                >
                    <FaTimes />
                </button>

                {/* Left Side: Images */}
                <div className="w-full md:w-1/2 bg-bg-tertiary flex items-center justify-center relative min-h-[300px]">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-text-secondary font-medium">No Image</div>
                    )}
                </div>

                {/* Right Side: Info */}
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded-full uppercase">
                                {product.category}
                            </span>
                            <span className="px-3 py-1 bg-bg-tertiary text-text-secondary text-[10px] font-bold rounded-full uppercase">
                                {product.condition}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-text-primary leading-tight mb-2">
                            {product.title}
                        </h2>
                        <div className="text-4xl font-black text-brand-primary">₹{product.price}</div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">Description</h4>
                            <p className="text-text-primary text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-bg-tertiary p-3 rounded-2xl">
                                <FaMapMarkerAlt className="text-brand-primary text-lg" />
                                <div>
                                    <div className="text-[10px] text-text-secondary font-bold uppercase">Location</div>
                                    <div className="text-xs font-bold text-text-primary">{product.location}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-bg-tertiary p-3 rounded-2xl">
                                <FaClock className="text-brand-tertiary text-lg" />
                                <div>
                                    <div className="text-[10px] text-text-secondary font-bold uppercase">Posted</div>
                                    <div className="text-xs font-bold text-text-primary">2 days ago</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-primary/5 border border-brand-primary/10 p-4 rounded-2xl flex gap-3">
                            <FaShieldAlt className="text-brand-primary text-xl mt-1 shrink-0" />
                            <div>
                                <h5 className="text-sm font-bold text-text-primary mb-1">Escrow Protection</h5>
                                <p className="text-xs text-text-secondary leading-normal">
                                    Your money is held securely and only released to the seller after you confirm delivery.
                                </p>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center gap-4 pt-4 border-t border-border">
                            <div className="w-12 h-12 bg-bg-tertiary rounded-full overflow-hidden flex items-center justify-center">
                                <FaUser className="text-text-secondary text-xl opacity-20" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-secondary font-bold uppercase">Seller</div>
                                <div className="text-sm font-bold text-text-primary">
                                    {product.seller?.username || 'Verified Student'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => onBuy(product)}
                            className="w-full py-4 bg-brand-primary text-white text-base font-black rounded-2xl shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all hover:-translate-y-1"
                        >
                            Buy This Item Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;

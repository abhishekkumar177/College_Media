import React from 'react';
import { Product } from '../types';
import { FaTag, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

interface ProductCardProps {
    product: Product;
    onBuy: (product: Product) => void;
    onView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, onView }) => {
    return (
        <div className="group bg-bg-secondary rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border flex flex-col">
            {/* Image Placeholder */}
            <div className="relative aspect-square bg-bg-tertiary overflow-hidden">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary select-none">
                        No Image available
                    </div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 bg-brand-primary/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {product.category}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-bold text-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
                        {product.title}
                    </h3>
                    <span className="text-lg font-black text-brand-primary">₹{product.price}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary font-medium uppercase tracking-tight">
                    <div className="flex items-center gap-1 bg-bg-tertiary px-2 py-1 rounded-md">
                        <FaMapMarkerAlt className="text-brand-primary" /> {product.location}
                    </div>
                    <div className="flex items-center gap-1 bg-bg-tertiary px-2 py-1 rounded-md">
                        <FaTag className="text-brand-tertiary" /> {product.condition}
                    </div>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                <div className="mt-auto pt-4 flex gap-2">
                    <button
                        onClick={() => onView(product)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-text-primary bg-bg-tertiary hover:bg-border transition-all"
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onBuy(product)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all hover:-translate-y-0.5"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

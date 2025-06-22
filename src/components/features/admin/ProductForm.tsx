import React, {useEffect, useState} from 'react';

import {Product} from '@/types';

import {Button} from '../../ui/Button';

interface ProductFormProps {
    product?: Product;
    onSubmit: (product: Omit<Product, 'id'> | Partial<Product>) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
                                                            product,
                                                            onSubmit,
                                                            onCancel,
                                                            isLoading = false,
                                                            isEdit = false
                                                        }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price?.toString() || '');
            setCategory(product.category || '');
            setIsAvailable(product.isAvailable);
        }
    }, [product]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = 'Price must be a positive number';
        }

        if (!category.trim()) {
            newErrors.category = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const productData: Omit<Product, 'id'> | Partial<Product> = {
            name,
            description,
            price: Number(price),
            category,
            isAvailable
        };

        if (isEdit && product?.id) {
            await onSubmit(productData);
        } else {
            await onSubmit(productData as Omit<Product, 'id'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                    disabled={isLoading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="description"
                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price ($) *
                </label>
                <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                    disabled={isLoading}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>}
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                </label>
                <input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                    disabled={isLoading}
                />
                {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    disabled={isLoading}
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Available in stock
                </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                >
                    {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
};
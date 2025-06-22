import React, {useState} from 'react';

import {useProducts} from '@/hooks/useProducts';
import {createProduct, deleteProduct, updateProduct} from '@/services/productService';
import {Product} from '@/types';

import {Button} from '../../ui/Button';
import {Pagination} from '../../ui/Pagination';
import {OrderList} from '../orders/OrderList';

import {AdminProductCard} from './AdminProductCard';
import {ProductForm} from './ProductForm';

interface AdminProductListProps {
    className?: string;
    initialPage?: number;
    initialPageSize?: number;
}

/**
 * Component for admin product management with ability to view orders
 */
export const AdminProductList: React.FC<AdminProductListProps> = ({
                                                                      className = '',
                                                                      initialPage = 0,
                                                                      initialPageSize = 20
                                                                  }) => {
    const {
        data: products,
        pagination,
        loading,
        error,
        refetch,
        goToPage
    } = useProducts({initialPage, initialPageSize});

    const [showOrders, setShowOrders] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId);
            await refetch();
        } catch (error) {
            console.error(`Error deleting product ${productId}:`, error);
            if (error instanceof Error) {
                alert(`Failed to delete product: ${error.message}`);
            } else {
                alert('Failed to delete product');
            }
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsAddingProduct(false);
    };

    const handleAddProduct = () => {
        setIsAddingProduct(true);
        setEditingProduct(null);
    };

    const handleCancelForm = () => {
        setIsAddingProduct(false);
        setEditingProduct(null);
        setFormError(null);
    };

    const handleSubmitProduct = async (productData: Omit<Product, 'id'> | Partial<Product>) => {
        setFormLoading(true);
        setFormError(null);

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await createProduct(productData as Omit<Product, 'id'>);
            }

            setIsAddingProduct(false);
            setEditingProduct(null);
            await refetch();
        } catch (error) {
            console.error('Error saving product:', error);
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError('An unknown error occurred');
            }
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Admin Product
                        Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage products and view all orders
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={showOrders ? "outline" : "primary"}
                        size="sm"
                        rounded="md"
                        onClick={() => setShowOrders(false)}
                        className="transition-all duration-300"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                        }
                    >
                        Manage Products
                    </Button>
                    <Button
                        variant={showOrders ? "primary" : "outline"}
                        size="sm"
                        rounded="md"
                        onClick={() => setShowOrders(true)}
                        className="transition-all duration-300"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                        }
                    >
                        View All Orders
                    </Button>
                    <Button
                        variant="success"
                        size="sm"
                        rounded="md"
                        onClick={handleAddProduct}
                        className="transition-all duration-300"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        }
                    >
                        Add New Product
                    </Button>
                </div>
            </div>

            {showOrders ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Customer Orders</h3>
                    <OrderList/>
                </div>
            ) : isAddingProduct || editingProduct ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                    </h3>

                    {formError && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm" role="alert">
                            <strong className="font-semibold">Error: </strong>
                            <span className="block sm:inline">{formError}</span>
                        </div>
                    )}

                    <ProductForm
                        product={editingProduct || undefined}
                        onSubmit={handleSubmitProduct}
                        onCancel={handleCancelForm}
                        isLoading={formLoading}
                        isEdit={!!editingProduct}
                    />
                </div>
            ) : (
                <>
                    {error && (
                        <div
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm"
                            role="alert">
                            <strong className="font-semibold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {loading && !products.length ? (
                        <div className="flex justify-center items-center py-6 sm:py-8 md:py-10">
                            <div
                                className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-blue-500 dark:border-blue-400 border-t-transparent shadow-md"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                                {products.map((product) => (
                                    <AdminProductCard
                                        key={product.id}
                                        product={product}
                                        onDelete={handleDeleteProduct}
                                        onEdit={handleEditProduct}
                                    />
                                ))}
                            </div>

                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-6 sm:mt-8">
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        onPageChange={goToPage}
                                        isLoading={loading}
                                        className="mt-4"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="text-center py-6 sm:py-8 md:py-10 text-sm sm:text-base text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm p-4 sm:p-6">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500"
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                            </svg>
                            No products available. Click refresh to try again.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

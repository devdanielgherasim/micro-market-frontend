import React from 'react';

import {OrderList as FeatureOrderList} from './features/orders/OrderList';

interface OrderListProps {
    customerId?: string;
}

/**
 * Main OrderList component that uses the feature-rich OrderList component
 */
export const OrderList: React.FC<OrderListProps> = ({customerId}) => {
    return <FeatureOrderList customerId={customerId}/>;
};

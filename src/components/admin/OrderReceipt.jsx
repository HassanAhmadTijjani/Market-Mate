// @ts-nocheck
import React from 'react'
import { forwardRef } from 'react'

const OrderReceipt = forwardRef(({ order, settings }, ref) => {

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'long',
            year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
    }
    return (
        <div ref={ref} className="bg-white p-8 max-w-sm mx-auto font-mono
                                       text-sm text-gray-800">

            {/* Store Header */}
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-black uppercase tracking-wider">
                    {settings?.store_name || 'MarketMate'}
                </h1>
                {settings?.store_address && (
                    <p className="text-xs text-gray-600 mt-1">
                        {settings.store_address}
                    </p>
                )}
                {settings?.store_phone && (
                    <p className="text-xs text-gray-600">
                        Tel: {settings.store_phone}
                    </p>
                )}
                {settings?.store_email && (
                    <p className="text-xs text-gray-600">
                        {settings.store_email}
                    </p>
                )}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-400 mb-4" />

            {/* Receipt Title */}
            <div className="text-center mb-4">
                <p className="font-bold text-base uppercase tracking-widest">
                    Receipt
                </p>
            </div>

            {/* Order Info */}
            <div className="mb-4 space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-bold">
                        #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{order.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="capitalize">
                        {order.delivery_method === 'delivery'
                            ? 'Home Delivery'
                            : 'Store Pickup'
                        }
                    </span>
                </div>
                {order.delivery_method === 'delivery' && order.address && (
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-600 shrink-0">Address:</span>
                        <span className="text-right">{order.address}</span>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-400 mb-4" />

            {/* Items */}
            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold
                                 uppercase mb-2 text-gray-600">
                    <span>Item</span>
                    <span>Amount</span>
                </div>
                {order.order_items?.map((item) => (
                    <div key={item.id} className="mb-2">
                        <div className="flex justify-between text-xs">
                            <span className="flex-1 pr-2 leading-snug">
                                {item.name}
                            </span>
                            <span className="shrink-0 font-medium">
                                ₦{Number(item.subtotal).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {item.quantity} × ₦{Number(item.price).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-400 mb-4" />

            {/* Totals */}
            <div className="space-y-1 text-xs mb-4">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₦{Number(order.subtotal).toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span>− ₦{Number(order.discount).toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1
                                 border-t border-gray-300 mt-1">
                    <span>TOTAL</span>
                    <span>₦{Number(order.total).toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Status */}
            <div className="border-t border-dashed border-gray-400 pt-4 mb-4">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="capitalize font-medium">
                        {order.payment_method?.replace(/_/g, ' ')}
                    </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-bold uppercase
                    ${order.payment_status === 'paid'
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}>
                        {order.payment_status}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-400 mb-6" />

            {/* Footer */}
            <div className="text-center text-xs text-gray-500">
                <p className="font-bold text-black mb-1">
                    Thank you for your business!
                </p>
                <p>Please keep this receipt for your records.</p>
                {settings?.store_name && (
                    <p className="mt-2 font-medium">{settings.store_name}</p>
                )}
            </div>

        </div>
    )
})

OrderReceipt.displayName = 'OrderReceipt'

export default OrderReceipt
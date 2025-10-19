import React, { useMemo, useState, useEffect } from 'react';

/*
  CustomerOrdersViewer
  --------------------
  Stand‑alone component that fetches customers from the backend and, when a customer
  is selected, loads that customer's order history with line items.

  Usage:
    import CustomerOrdersViewer from './components/CustomerOrdersViewer';
    <CustomerOrdersViewer />

  Props: (currently none) – could be extended later to accept customers / orders arrays
         or data-loading callbacks.
*/

// Backend base URL (configure via environment variable for flexibility)
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000';

// Utility formatters
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function currency(amount) {
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

const statusColors = {
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200'
};

export default function CustomerOrdersViewer() {
  const [search, setSearch] = useState('');
  const [sortByRecent, setSortByRecent] = useState(true);
  const [customers, setCustomers] = useState([]); // [{id,name,email,orderCount,lastOrderDate}]
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [orders, setOrders] = useState([]); // orders for selected
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Fetch customers from backend
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoadingCustomers(true);
      setCustomersError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        params.set('order', sortByRecent ? 'recent' : 'name');
        const res = await fetch(`${API_BASE}/api/customers?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.warn('Unexpected /api/customers payload, expected array:', data);
          if (alive) setCustomers([]);
        } else {
          if (alive) {
            // ensure each customer has the expected fields
            setCustomers(data.map(c => ({
              id: c.id ?? c.User_ID ?? c.UserId,
              name: c.name ?? c.Name ?? c.name,
              email: c.email ?? c.Email ?? '',
              orderCount: Number(c.orderCount ?? c.orderCount ?? 0) || 0,
              lastOrderDate: c.lastOrderDate ?? c.lastOrderDate ?? null
            })));
          }
        }
      } catch (e) {
        if (alive) setCustomersError(e.message || 'Failed to load customers');
      } finally {
        if (alive) setLoadingCustomers(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [search, sortByRecent]);

  // Fetch orders for selected customer
  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const res = await fetch(`${API_BASE}/api/orders?userId=${encodeURIComponent(selectedId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.warn('Unexpected /api/orders payload, expected array:', data);
          if (alive) setOrders([]);
          return;
        }
        // Map backend shape to expected fields (normalize)
        const mapped = data.map(o => ({
          id: o.id ?? o.Order_ID ?? o.OrderId,
          placedAt: o.date ?? o.Order_Date ?? o.placedAt ?? null,
          // Normalize to DB enum: only 'Delivered' and 'Pending' are supported
          status: (o.deliveryStatus === 'Delivered' || o.status === 'completed')
            ? 'Delivered'
            : 'Pending',
          items: (o.items && Array.isArray(o.items) ? o.items : []).map((it, i) => ({
            sku: it.sku ?? `${o.id}-item-${i}`,
            productName: it.product ?? it.productName ?? 'Product',
            qty: Number(it.qty ?? it.Quantity ?? 0) || 0,
            price: Number(it.price ?? it.Price ?? it.unitPrice ?? 0) || 0
          }))
        }));
        // Sort newest first (guard missing dates)
        mapped.sort((a,b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0));
        if (alive) setOrders(mapped);
      } catch (e) {
        if (alive) setOrdersError(e.message || 'Failed to load orders');
      } finally {
        if (alive) setLoadingOrders(false);
      }
    }
    loadOrders();
    return () => { alive = false; };
  }, [selectedId]);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedId) || null, [customers, selectedId]);
  const selectedOrders = orders;

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 shadow-sm">
      {/* Customer List */}
      <div className="md:w-1/3 lg:w-1/4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Customers</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSortByRecent(s => !s)}
            className="text-xs px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            {sortByRecent ? 'Sort A-Z' : 'Sort Recent'}
          </button>
        </div>
        <div className="overflow-y-auto rounded border border-gray-200 bg-white divide-y divide-gray-100 shadow-inner max-h-96 md:max-h-[calc(100vh-10rem)]">
          {loadingCustomers && (
            <div className="p-3 text-sm text-gray-500">Loading customers...</div>
          )}
          {customersError && (
            <div className="p-3 text-sm text-red-600">{customersError}</div>
          )}
          {!loadingCustomers && !customersError && customers.map(c => {
            const isActive = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-blue-50 focus:outline-none ${isActive ? 'bg-blue-100' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{c.name}</span>
                  {c.orderCount > 0 && (
                    <span className="text-[10px] bg-gray-200 rounded-full px-2 py-0.5">{c.orderCount}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{c.email}</span>
                <span className="text-[10px] text-gray-400">
                  {c.lastOrderDate ? `Last: ${new Date(c.lastOrderDate).toLocaleDateString()}` : 'No orders'}
                </span>
              </button>
            );
          })}
          {!loadingCustomers && !customersError && !customers.length && (
            <div className="p-3 text-sm text-gray-500">No customers match your search.</div>
          )}
        </div>
      </div>

      {/* Orders Panel */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">{selectedCustomer ? `${selectedCustomer.name}'s Orders` : 'Select a customer'}</h2>
        {!selectedCustomer && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Choose a customer to view their order history.
          </div>
        )}
        {selectedCustomer && (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1 max-h-[calc(100vh-12rem)]">
            {loadingOrders && (
              <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-4 bg-white">Loading orders...</div>
            )}
            {ordersError && (
              <div className="text-sm text-red-600 border border-dashed border-red-300 rounded p-4 bg-white">{ordersError}</div>
            )}
            {!loadingOrders && !ordersError && !selectedOrders.length && (
              <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-4 bg-white">No orders found for this customer.</div>
            )}
            {!loadingOrders && !ordersError && selectedOrders.map(order => {
              const total = order.items.reduce((acc, it) => acc + it.qty * it.price, 0);
              return (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Order #{order.id}</span>
                      <span className="text-xs text-gray-500">Placed {formatDate(order.placedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{order.status}</span>
                      <span className="text-sm font-semibold">{currency(total)}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-1 font-medium">Item</th>
                          <th className="py-1 font-medium w-12">Qty</th>
                          <th className="py-1 font-medium w-20 text-right">Price</th>
                          <th className="py-1 font-medium w-20 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.items.map(it => (
                          <tr key={it.sku}>
                            <td className="py-1 pr-2">{it.productName}</td>
                            <td className="py-1 text-center">{it.qty}</td>
                            <td className="py-1 text-right">{currency(it.price)}</td>
                            <td className="py-1 text-right font-medium">{currency(it.qty * it.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

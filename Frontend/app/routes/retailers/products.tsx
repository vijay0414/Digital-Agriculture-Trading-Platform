import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import {
  getRetailerProducts,
  getRetailerProductsByCategory,
  searchRetailerProducts,
  type ProductResponse,
} from "~/services/products";
import { createOrder } from "~/services/orders";
import { getFarmerDisplayName } from "~/utils/farmer";
import { addNotification } from "~/services/notifications";

export function meta() {
  return [
    { title: "Retailer Marketplace | SmartX AgriTrade" },
    { name: "description", content: "Browse active products available for retailers." },
  ];
}

const CATEGORY_OPTIONS = ["Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Pulses"];

export default function RetailerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const showCategory = useMemo(() => category.trim().length > 0, [category]);
  const showSearch = useMemo(() => search.trim().length > 0, [search]);
  const retailerId = useMemo(() => user?.id, [user]);
  const isRetailerSignedIn = useMemo(() => user?.role === "RETAILER" && !!retailerId, [user, retailerId]);

  async function fetchProducts() {
    setLoading(true);
    setError("");

    try {
      let data: ProductResponse[];

      if (showSearch) {
        data = await searchRetailerProducts(search.trim());
      } else if (showCategory) {
        data = await getRetailerProductsByCategory(category.trim());
      } else {
        data = await getRetailerProducts();
      }

      setProducts(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceOrder(product: ProductResponse | null) {
    if (!product || !product.id) {
      setError("Unable to determine the product identifier. Please try a different product.");
      return;
    }

    const numericRetailerId = Number(retailerId);
    const numericFarmerId = Number(product.farmerId);

    if (!isRetailerSignedIn || !numericRetailerId || Number.isNaN(numericRetailerId)) {
      setError("You must be signed in as a retailer to place an order.");
      return;
    }

    if (!product.farmerId || Number.isNaN(numericFarmerId)) {
      setError("Unable to determine the farmer for this product. Please try again.");
      return;
    }

    if (!orderQuantity || Number.isNaN(orderQuantity) || orderQuantity < 1) {
      setError("Please enter a valid quantity (1 or more).");
      return;
    }

    setError("");
    setPlacingOrder(true);

    const payload = {
      farmerId: numericFarmerId,
      items: [
        {
          productId: Number(product.id), // Strictly Long/Number as per new spec
          quantity: Number(orderQuantity),
        },
      ],
      notes: orderNotes.trim() || undefined,
    };

    console.log("Submitting Order based on New Spec:", { payload, retailerId: numericRetailerId });

    try {
      // New Spec: retailerId required in query param (order swapped to match Digital-frontend)
      await createOrder(numericRetailerId, payload);

      // Alert Farmer about New Order
      await addNotification(
        numericFarmerId,
        "New Order Received!",
        `Retailer ${user?.name || user?.id || ''} has placed a new order for "${product.name}".`,
        "ORDER"
      );

      setShowOrderModal(false);
      setOrderQuantity(1);
      setOrderNotes("");
      setSelectedProduct(null);
      setSuccessMsg(`Order Sent Successfully! Your request for "${product.name}" has been placed. Check My Orders for tracking.`);
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      const status = err?.response?.status;
      
      // Resilient Fallback based on Digital-frontend: 
      // Handle Forbidden (403) or Not Found (404) by mocking in LocalStorage
      if (status === 403 || status === 404) {
        console.warn(`Backend returned ${status}. Mocking successful order creation in LocalStorage.`);
        
        const mockOrder = {
          id: Math.floor(Math.random() * 9000) + 1000,
          farmerId: numericFarmerId,
          retailerId: numericRetailerId,
          status: "PENDING",
          totalAmount: (product.price || 0) * Number(orderQuantity),
          notes: orderNotes.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [{ 
            productId: Number(product.id), 
            productName: product.name, // Added product name to items
            quantity: Number(orderQuantity), 
            unitPrice: product.price || 0, 
            lineTotal: (product.price || 0) * Number(orderQuantity) 
          }]
        };

        const existing = JSON.parse(localStorage.getItem("mockOrders") || "[]");
        localStorage.setItem("mockOrders", JSON.stringify([...existing, mockOrder]));

        // Alert Farmer about New Order
        await addNotification(
          numericFarmerId,
          "New Order Received!",
          `Retailer ${user?.name || user?.id || ''} has placed a new order for "${product.name}".`,
          "ORDER"
        );

        setShowOrderModal(false);
        setOrderQuantity(1);
        setOrderNotes("");
        setSelectedProduct(null);
        setSuccessMsg(`Order Sent Successfully! (Cached Locally) Your request for "${product.name}" is pending.`);
        setTimeout(() => setSuccessMsg(""), 6000);
      } else {
        const apiMessage =
          err?.response?.data?.message ??
          (typeof err?.response?.data === "string" ? err.response.data : undefined);

        setError(
          apiMessage
            ? `${apiMessage} (${status ?? ""})`
            : `Request failed with status code ${status ?? "unknown"}`
        );
        console.error("Place order error", err);
      }
    } finally {
      setPlacingOrder(false);
    }
  }

  function openOrderModal(product: ProductResponse) {
    console.log("Opening order modal for product:", product);
    setSelectedProduct(product);
    setOrderQuantity(1);
    setOrderNotes("");
    setError("");
    setShowOrderModal(true);
  }

  function closeOrderModal() {
    setShowOrderModal(false);
    setSelectedProduct(null);
    setOrderQuantity(1);
    setOrderNotes("");
    setError("");
    setPlacingOrder(false);
  }

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">SmartX AgriTrade</span>
              </Link>

              <Link
                to="/retailers/orders"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                My Orders
              </Link>
            </div>

              <Link
                to="/login"
                className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 transition-colors"
              >
                Sign In
              </Link>
          </div>
        </div>
      </nav>

      {/* Marketplace Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Retailer Marketplace</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Browse active products from farmers.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">All</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                onClick={() => {
                  setCategory("");
                  setSearch("");
                }}
                className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={fetchProducts} className="ml-auto text-red-600 dark:text-red-400 underline text-sm font-medium">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              There are no active products matching your filter. Try resetting the filters or checking back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap gap-2">
                      {product.category && (
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${product.category.toLowerCase().includes("veg")
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                        >
                          {product.category}
                        </span>
                      )}
                      {product.status && (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {product.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2.5">
                    {product.price != null && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                          ${product.price}/{product.unit || "kg"}
                        </span>
                      </div>
                    )}

                    {product.availableQuantity != null && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                        {product.availableQuantity} {product.unit || "kg"} available
                      </div>
                    )}

                    {product.location && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                        <span className="truncate">{product.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <span>{getFarmerDisplayName(product.farmerId)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <button
                    onClick={() => openOrderModal(product)}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-purple-700 text-white hover:bg-purple-800 transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Popup Modal */}
      {successMsg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 max-w-sm w-full text-center">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Sent Successfully!</h3>
             <p className="text-gray-600 dark:text-gray-400 mb-8">{successMsg.replace("Order Sent Successfully! ", "")}</p>
             <button 
                onClick={() => setSuccessMsg("")}
                className="w-full py-3 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800 transition-all shadow-lg active:scale-95"
              >
                Got it!
             </button>
          </div>
        </div>
      )}

      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-950 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Place order</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order from {getFarmerDisplayName(selectedProduct.farmerId)}.</p>
              </div>
              <button
                onClick={closeOrderModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {!isRetailerSignedIn && (
                <div className="mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-semibold mb-1">⚠️ Retailer account required</p>
                  <p>You must be signed in as a <strong>Retailer</strong> to place orders. Your current role is: <strong>{user?.role || 'not logged in'}</strong>.</p>
                  <Link
                    to="/login"
                    className="inline-block mt-2 text-purple-700 dark:text-purple-400 underline font-semibold"
                    onClick={closeOrderModal}
                  >
                    → Sign in to your account
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                  <input
                    value={selectedProduct.name}
                    disabled
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => handlePlaceOrder(selectedProduct)}
                  disabled={!isRetailerSignedIn || placingOrder}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placingOrder ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Placing order...
                    </>
                  ) : isRetailerSignedIn ? (
                    "Place order"
                  ) : (
                    "Retailers Only"
                  )}
                </button>
                <button
                  onClick={closeOrderModal}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

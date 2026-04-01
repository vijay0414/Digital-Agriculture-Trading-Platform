import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import AuthGuard from "~/components/AuthGuard";
import {
  getProducts,
  getFarmerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductResponse,
  type PagedResponse,
} from "~/services/products";

export function meta() {
  return [
    { title: "Products | SmartX AgriTrade" },
    { name: "description", content: "Browse agriculture products on the marketplace" },
  ];
}

const PAGE_SIZE = 6;
const SORT_OPTIONS = [
  { label: "Price: Low to High", sortBy: "price", direction: "asc" as const },
  { label: "Price: High to Low", sortBy: "price", direction: "desc" as const },
  { label: "Newest First", sortBy: "createdAt", direction: "desc" as const },
  { label: "Name A-Z", sortBy: "name", direction: "asc" as const },
];

function ProductsContent() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [retryCount, setRetryCount] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    unit: "",
    availableQuantity: "",
    minOrderQty: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    setError("");
    
    // Spec: Show only this farmer's products
    getFarmerProducts(Number(user.id))
      .then((data) => {
        setProducts(data);
        setTotalElements(data.length);
        setTotalPages(1); // Non-paged for farmer specifics
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || "Failed to load your products.");
        setLoading(false);
      });
  }, [retryCount, user?.id]);

  // Reset to first page when filter or sort changes
  function handleFilterChange(newFilter: "all" | "available") {
    setFilter(newFilter);
    setPage(0);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const option = SORT_OPTIONS[Number(e.target.value)];
    setSortBy(option.sortBy);
    setDirection(option.direction);
    setPage(0);
  }

  function fetchProducts() {
    setRetryCount((c) => c + 1);
  }

  function updateNewProduct(field: string, value: string) {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  }

  function resetNewProductForm() {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      category: "",
      description: "",
      price: "",
      unit: "",
      availableQuantity: "",
      minOrderQty: "",
      status: "ACTIVE",
    });
    setCreateError("");
  }

  async function handleSaveProduct() {
    setCreateError("");

    if (!newProduct.name.trim()) {
      setCreateError("Product name is required.");
      return;
    }
    if (!newProduct.price || Number.isNaN(Number(newProduct.price))) {
      setCreateError("A valid price is required.");
      return;
    }
    if (!newProduct.availableQuantity || Number.isNaN(Number(newProduct.availableQuantity))) {
      setCreateError("Available quantity is required.");
      return;
    }

    if (!user?.id) {
      setCreateError("Unable to determine farmer ID. Please sign in again.");
      return;
    }

    setCreateLoading(true);

    try {
      if (editingProduct) {
        await updateProduct(String(editingProduct.id), {
          name: newProduct.name.trim(),
          category: newProduct.category.trim() || undefined,
          description: newProduct.description.trim() || undefined,
          price: Number(newProduct.price),
          unit: newProduct.unit.trim() || undefined,
          availableQuantity: Number(newProduct.availableQuantity),
          minOrderQty: newProduct.minOrderQty ? Number(newProduct.minOrderQty) : undefined,
          status: newProduct.status || undefined,
        });
      } else {
        await createProduct({
          farmerId: user.id,
          name: newProduct.name.trim(),
          category: newProduct.category.trim() || undefined,
          description: newProduct.description.trim() || undefined,
          price: Number(newProduct.price),
          unit: newProduct.unit.trim() || undefined,
          availableQuantity: Number(newProduct.availableQuantity),
          minOrderQty: newProduct.minOrderQty ? Number(newProduct.minOrderQty) : undefined,
          status: newProduct.status || undefined,
        });
      }

      resetNewProductForm();
      setShowCreateModal(false);
      fetchProducts();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to save product. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  }

  function openProductModal(product?: ProductResponse) {
    if (product) {
      setEditingProduct(product);
      setNewProduct({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        unit: product.unit || "",
        availableQuantity: product.availableQuantity?.toString() || "",
        minOrderQty: product.minOrderQty?.toString() || "",
        status: product.status || "ACTIVE",
      });
    } else {
      resetNewProductForm();
    }
    setShowCreateModal(true);
  }

  async function handleDeleteProduct(productId: string) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(productId);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product. Please try again.");
    }
  }


  function getCategoryColor(category: string) {
    switch (category?.toUpperCase()) {
      case "VEGETABLES":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "FRUITS":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "GRAINS":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "DAIRY":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "SPICES":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "PULSES":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    }
  }

  function getStatusColor(status: string) {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "SOLD_OUT":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "PENDING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  }

  const currentSortIndex = SORT_OPTIONS.findIndex(
    (o) => o.sortBy === sortBy && o.direction === direction
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">SmartX AgriTrade</span>
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                >
                  Products
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-400 font-semibold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Products</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Manage and track your active listings.
              {!loading && totalElements > 0 && (
                <span className="ml-1 text-gray-400 dark:text-gray-500">
                  ({totalElements} product{totalElements !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>
          <button
              onClick={() => openProductModal()}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-colors"
            >
              + Add Product
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => handleFilterChange("available")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "available"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Available
            </button>
            <select
              value={currentSortIndex >= 0 ? currentSortIndex : 0}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((option, i) => (
                <option key={i} value={i}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
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

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading products...</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              {filter === "available"
                ? "No products are available right now. Check back later or view all products."
                : "No products have been listed yet. Be the first to add your produce!"}
            </p>
            {filter === "available" && (
              <button
                onClick={() => handleFilterChange("all")}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-purple-700 text-white hover:bg-purple-800 transition-colors"
              >
                View all products
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
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
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                            {product.category.replace(/_/g, " ")}
                          </span>
                        )}
                        {product.status && (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {product.status.replace(/_/g, " ")}
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
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                            ${product.price}/{product.unit || "kg"}
                          </span>
                        </div>
                      )}

                      {product.availableQuantity != null && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span>{product.availableQuantity} {product.unit || "kg"} available</span>
                        </div>
                      )}

                      {product.location && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{product.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProductModal(product)}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-purple-700 text-white hover:bg-purple-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(String(product.id))}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements} products
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                    .reduce<(number | "ellipsis")[]>((acc, i, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== i - 1) acc.push("ellipsis");
                      acc.push(i);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <span key={`e-${idx}`} className="px-2 text-gray-400 dark:text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === item
                              ? "bg-purple-700 text-white shadow-sm"
                              : "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {item + 1}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-950 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingProduct ? "Edit product" : "Add new product"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter product details to list it on the marketplace.</p>
              </div>
              <button
                onClick={() => {
                  resetNewProductForm();
                  setShowCreateModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {createError && (
                <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    value={newProduct.name}
                    onChange={(e) => updateNewProduct("name", e.target.value)}
                    placeholder="Organic Tomatoes"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    value={newProduct.category}
                    onChange={(e) => updateNewProduct("category", e.target.value)}
                    placeholder="Vegetables"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => updateNewProduct("description", e.target.value)}
                    placeholder="Fresh organic tomatoes from our farm"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => updateNewProduct("price", e.target.value)}
                    placeholder="45.00"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <input
                    value={newProduct.unit}
                    onChange={(e) => updateNewProduct("unit", e.target.value)}
                    placeholder="kg"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.availableQuantity}
                    onChange={(e) => updateNewProduct("availableQuantity", e.target.value)}
                    placeholder="500"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Order Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.minOrderQty}
                    onChange={(e) => updateNewProduct("minOrderQty", e.target.value)}
                    placeholder="5"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => updateNewProduct("status", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleSaveProduct}
                  disabled={createLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : (
                    "Create Product"
                  )}
                </button>
                <button
                  onClick={() => {
                    resetNewProductForm();
                    setShowCreateModal(false);
                  }}
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

export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductsContent />
    </AuthGuard>
  );
}

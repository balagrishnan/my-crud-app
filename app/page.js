"use client"

import { useEffect, useState } from 'react';

const API_URL = "http://localhost:8081/api/products";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Form State
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [editingId, setEditingId] = useState(null) // null = Create mode, Number = Edit mode

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      const sorted = [...data].sort((a, b) => b.id - a.id);
      //console.log("API Response:", JSON.stringify(json, null, 2));
      setProducts(sorted ?? []);
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── CREATE ─────────────────────────────────────────────
  async function createProduct() {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create product")
      await fetchProducts()// refresh list
      resetForm();
    } catch (error) {
      setError(error.message)
    }
  }

  // ─── UPDATE ─────────────────────────────────────────────
  async function updateProduct() {
    try {
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update product")
      await fetchProducts(); // refresh list
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteProduct(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed to delete product")
      fetchProducts(); //
    } catch (error) {
      setError(error.message);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
    });
    window.scrollTo({ top: 10, behavior: "smooth" })
  }

  function resetForm() {
    setForm({ name: "", description: "", price: "" });
    setEditingId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      updateProduct();
    } else {
      createProduct();
    }
  }

  function deleteConfirmation(id) {
    if (window.confirm(`Delete Product ${id}`)) {
      deleteProduct(id);
    }
  }

  return (
    <>
      <main className="max-w-3xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">🛒 Product Manager</h1>
        {/* ── FORM (Create / Edit) ── */}
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 mb-8 space-y-4">
          <h2 className="text-xl font-semibold">
            {editingId ? `✏️ Edit Product - ${form.name}` : "➕ Add New Product"}
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input type='text'
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              value={form.name}
              placeholder='e.g. Wireless Keyboard'
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"></input>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input type='number'
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              value={form.price}
              placeholder='e.g. 49.99'
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"></input>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Description</label>
            <textarea
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required value={form.description}
              placeholder='Short product description...'
              rows={2}
              maxLength={100}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">

            </textarea>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 font-medium"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {/* ── ERROR ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* ── PRODUCT LIST ── */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">All Products ({products.length})</h2>
            <button
              onClick={fetchProducts}
              className="text-sm text-blue-500 hover:underline"
            >
              🔄 Refresh
            </button>
          </div>
          {
            loading ? (
              <p className="text-center text-gray-400 py-10">Loading...</p>
            ) :
              products.length === 0 ?
                (
                  <p className="text-center text-gray-400 py-10">No products found. Add one above!</p>
                ) : (
                  <ul className="space-y-3">
                    {products.map((product) => (
                      <li key={product.id} className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{product.name}</p>
                          <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                          <p className="text-green-600 font-medium">${product.price}/- each</p>
                        </div>
                        <div>
                          <button onClick={() => startEdit(product)}
                            className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200">Edit</button>
                          <button onClick={() => deleteConfirmation(product.id)}
                            className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
        </div>
      </main>
    </>
  );
}

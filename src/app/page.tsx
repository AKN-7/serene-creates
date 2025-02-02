// app/page.tsx

"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  image: string;
  title: string;
  price: number;
};

export default function Home() {
  // Message card states
  const [favoriteMessage, setFavoriteMessage] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string>("");

  // Product states: dynamic list of products  
  // Default products if nothing is stored
  const defaultProducts: Product[] = [
    { image: "/images/card1.png", title: "Bunny's Milk", price: 10 },
    { image: "/images/card2.png", title: "Pikachu Pouch", price: 10 },
    { image: "/images/card3.png", title: "Palestine Watermelon", price: 10 },
  ];
  const [products, setProducts] = useState<Product[]>(defaultProducts);

  // Price change modal state
  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false);
  // We'll maintain a priceInputs array for editing; it will be rebuilt from products
  const [priceInputs, setPriceInputs] = useState<string[]>(
    defaultProducts.map((p) => p.price.toString())
  );

  // Add Product modal state
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [newProductTitle, setNewProductTitle] = useState<string>("");
  const [newProductPrice, setNewProductPrice] = useState<string>("10");
  const [newProductImage, setNewProductImage] = useState<string>(""); // stored as data URL
  const [addProductError, setAddProductError] = useState<string>("");

  // On mount, load saved message and products from localStorage
  useEffect(() => {
    const savedMessage = localStorage.getItem("favoriteMessage");
    if (savedMessage) {
      setFavoriteMessage(savedMessage);
      setInputMessage(savedMessage);
    }
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(parsedProducts);
        setPriceInputs(parsedProducts.map((p: Product) => p.price.toString()));
      } catch (e) {
        console.error("Error parsing saved products", e);
      }
    }
  }, []);

  // Whenever products change, update localStorage and rebuild the priceInputs array
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    setPriceInputs(products.map((p) => p.price.toString()));
  }, [products]);

  // Message form submit handler
  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) {
      setMessageError("Please enter a cute message.");
      return;
    }
    localStorage.setItem("favoriteMessage", inputMessage);
    setFavoriteMessage(inputMessage);
    setMessageError("");
    setIsEditingMessage(false);
  };

  // Price change form submit handler
  const handlePriceSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updatedProducts = products.map((product, i) => {
      const newPrice = parseFloat(priceInputs[i]);
      return { ...product, price: isNaN(newPrice) ? product.price : newPrice };
    });
    setProducts(updatedProducts);
    setIsEditingPrices(false);
  };

  // Add product form submit handler with synchronous update of priceInputs
  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newProductTitle.trim() || !newProductImage || !newProductPrice.trim()) {
      setAddProductError("All fields are required.");
      return;
    }
    const price = parseFloat(newProductPrice);
    if (isNaN(price)) {
      setAddProductError("Price must be a number.");
      return;
    }
    const newProduct: Product = {
      image: newProductImage,
      title: newProductTitle,
      price: price,
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    // Immediately update priceInputs from updatedProducts to avoid index mismatches
    setPriceInputs(updatedProducts.map((p) => p.price.toString()));
    setIsAddingProduct(false);
    // Reset fields
    setNewProductTitle("");
    setNewProductPrice("10");
    setNewProductImage("");
    setAddProductError("");
  };

  // Handle file upload for new product image
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewProductImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove product handler
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  return (
    <div className="container">
      {/* Top left "Change Prices" Button */}
      <button
        className="change-prices-btn"
        onClick={() => setIsEditingPrices(true)}
      >
        Change Prices
      </button>

      {/* Price Editing Modal */}
      <AnimatePresence>
        {isEditingPrices && (
          <motion.div
            className="price-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form className="price-form" onSubmit={handlePriceSubmit}>
              <h3>Update Prices</h3>
              {products.map((product, index) => (
                <div key={index} className="price-input-group">
                  <label>{product.title}:</label>
                  <input
                    type="number"
                    value={priceInputs[index] || ""}
                    onChange={(e) => {
                      const copy = [...priceInputs];
                      copy[index] = e.target.value;
                      setPriceInputs(copy);
                    }}
                  />
                </div>
              ))}
              <button type="submit" className="price-save-btn">
                Save Prices
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top right "Add Product" Trigger */}
      <div
        className="add-product-trigger"
        onClick={() => setIsAddingProduct(true)}
      >
        <span>+</span>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <motion.div
            className="add-product-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form className="add-product-form" onSubmit={handleAddProductSubmit}>
              <h3>Add New Product</h3>
              <label>Product Title:</label>
              <input
                type="text"
                value={newProductTitle}
                onChange={(e) => setNewProductTitle(e.target.value)}
              />
              <label>Price:</label>
              <input
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
              />
              <label>Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
              {addProductError && (
                <p className="error-text">{addProductError}</p>
              )}
              <button type="submit" className="price-save-btn">
                Add Product
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Section */}
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Serene Creates
      </motion.h1>

      {/* Enhanced, Sleek Intro (Message) Card */}
      <motion.div
        className="message-card enhanced"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isEditingMessage ? (
            <motion.form
              key="edit"
              onSubmit={handleMessageSubmit}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="message-form"
            >
              <textarea
                className="message-textarea"
                value={inputMessage}
                placeholder="Share your cute thought..."
                onChange={(e) => setInputMessage(e.target.value)}
                rows={3}
              />
              {messageError && (
                <p className="error-text">{messageError}</p>
              )}
              <button type="submit" className="message-save-btn">
                Save Message
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="message-display"
            >
              <p className="intro-message">
                {favoriteMessage ||
                  "Share a cute thought for your day!"}
              </p>
              <button
                onClick={() => {
                  setIsEditingMessage(true);
                  setMessageError("");
                }}
                className="message-save-btn"
              >
                {favoriteMessage ? "Edit Message" : "Add Message"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Products Cards */}
      <div className="cards-container">
        {products.map((product, index) => (
          <motion.div
            key={index}
            className="card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <button
              className="remove-product-btn"
              onClick={() => handleRemoveProduct(index)}
            >
              &times;
            </button>
            <img
              src={product.image}
              alt={product.title}
              className="card-image"
            />
            <div className="card-info">
              <h2 className="card-title">{product.title}</h2>
              <p className="card-price">${product.price.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

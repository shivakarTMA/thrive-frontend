import React, { useEffect, useState } from "react";
import { productsByType } from "../../DummyData/DummyData";


const ProductModal = ({ selectedType, onClose, onSubmit }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  console.log(selectedType,'selectedType')
  console.log(filteredProducts,'filteredProducts')

// normalize helper
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  useEffect(() => {
    setSelectedProduct(null); // clear selection when type changes

    if (!selectedType) {
      setFilteredProducts([]);
      return;
    }

    const input = norm(selectedType);

    // 1) Try direct key match (productsByType keys should ideally be normalized)
    if (productsByType[input]) {
      setFilteredProducts(productsByType[input]);
      return;
    }

    // 2) Try to find a category that contains a product matching the passed string
    const foundCategory = Object.keys(productsByType).find((key) =>
      productsByType[key].some((p) => {
        const pName = norm(p.productName);
        const pDesc = norm(p.shortDescription || "");
        return pName === input || pDesc === input || pName.includes(input) || pDesc.includes(input);
      })
    );

    if (foundCategory) {
      setFilteredProducts(productsByType[foundCategory]);
      return;
    }

    // 3) Nothing found
    setFilteredProducts([]);
    console.warn(`ProductModal: no products found for selectedType="${selectedType}"`);
  }, [selectedType]);

  const handleSubmit = () => {
    if (selectedProduct) {
      onSubmit(selectedProduct);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[999]">
      <div className="bg-white w-full max-w-xl rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Select Products</h2>

        <div className="max-h-72 overflow-y-auto space-y-3">
          {filteredProducts.map((product, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <label className="custom--checkbox">
                <input
                  type="radio"
                  name="selectedProduct"
                  checked={selectedProduct?.id === product.id}
                  onChange={() => setSelectedProduct(product)}
                  className="mt-1"
                />
                <span className="checkbox--custom--check"></span>
              </label>

              <div>
                <div className="font-semibold">{product.productName}</div>
                <div className="text-sm text-gray-500">
                  {product.shortDescription}
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {product.servicesDuration} | ₹{product.amount} |
                  Sessions: {product.sessions}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

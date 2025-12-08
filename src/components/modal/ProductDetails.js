import React, { useEffect, useState } from "react";
import { authAxios } from "../../config/config";


const ProductModal = ({ selectedType, onClose, onSubmit }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!selectedType) return;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        let response;

        // -------------------------------
        // CHECK PRODUCT TYPE & CALL API
        // -------------------------------
        if (selectedType === "MEMBERSHIP_PLAN") {
          response = await authAxios().get("/subscription-plan/list");
        }

        // (Add more conditions for other product types)
        // else if (selectedType === "SOMETHING_ELSE") {
        //   response = await authAxios().get("/other-endpoint");
        // }

        // If no API matched, fallback to empty
        if (!response) {
          setFilteredProducts([]);
          return;
        }

        // API success
        setFilteredProducts(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }

      setLoading(false);
    };

    fetchProducts();
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

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-3">
            {filteredProducts.map((product) => (
              <label
                key={product.id}
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
                  <div className="font-semibold">{product?.title}</div>
                  {/* <div className="text-sm text-gray-500">
                    {product?.shortDescription}
                  </div> */}
                  <div className="text-sm text-gray-600">
                    Duration: {product?.duration_value} {product?.duration_type} | Amount: ₹{product?.amount} |
                    Sessions: {product?.sessions ? product?.sessions : "N/A"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

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
            disabled={!selectedProduct}
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

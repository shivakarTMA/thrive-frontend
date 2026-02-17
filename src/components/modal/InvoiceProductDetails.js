import React, { useEffect, useState } from "react";
import { authAxios } from "../../config/config";
import { filterActiveItems } from "../../Helper/helper";
import { toast } from "react-toastify";

const InvoiceProductDetails = ({ 
  serviceId, 
  packageId,
  isVariationModal = false,
  onClose, 
  onSubmit 
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVariationModal) {
      // Fetch variations for Recovery service
      if (!packageId) return;
      fetchVariations();
    } else {
      // Fetch packages based on service
      if (!serviceId) return;
      fetchPackages();
    }
  }, [serviceId, packageId, isVariationModal]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await authAxios().get("/package/list", {
        params: { service_id: serviceId }
      });

      const data = response.data?.data || response.data || [];
      const activeOnly = filterActiveItems(data);
      setFilteredProducts(activeOnly);
    } catch (err) {
      console.error("Failed to fetch packages", err);
      toast.error("Failed to fetch packages");
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariations = async () => {
    setLoading(true);
    try {
      const response = await authAxios().get("/package/variation/list", {
        params: { package_id: packageId }
      });

      const data = response.data?.data || response.data || [];
      const activeOnly = filterActiveItems(data);
      setFilteredProducts(activeOnly);
    } catch (err) {
      console.error("Failed to fetch variations", err);
      toast.error("Failed to fetch variations");
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedProduct) {
      onSubmit(selectedProduct);
      onClose();
    } else {
      toast.error(isVariationModal ? "Please select a variation" : "Please select a product");
    }
  };

  const renderProductCard = (product) => {
    if (isVariationModal) {
      // Variation Card
      return (
        <label
          key={product.id}
          className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <label className="custom--checkbox mt-1">
            <input
              type="radio"
              name="selectedProduct"
              checked={selectedProduct?.id === product.id}
              onChange={() => setSelectedProduct(product)}
            />
            <span className="checkbox--custom--check"></span>
          </label>

          <div className="flex-1">
            <div className="flex items-start gap-3">
              {product?.image && (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg">{product?.name}</div>
                {product?.caption && (
                  <div className="text-sm text-gray-600 mt-1">{product?.caption}</div>
                )}
              </div>
            </div>

            {product?.recovery_goals && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Recovery Goals:</span> {product.recovery_goals}
              </div>
            )}

            {product?.description && (
              <div className="mt-1 text-sm text-gray-600">{product.description}</div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Sessions:</span> {product?.no_of_sessions || "N/A"}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {product?.session_duration || "N/A"} mins
              </div>
              <div>
                <span className="font-medium">Validity:</span> {product?.session_validity || "N/A"} days
              </div>
              <div>
                <span className="font-medium">Earn Coins:</span> {product?.earn_coin || 0}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through text-sm">₹{product?.amount}</span>
                <span className="font-bold text-lg text-green-600">₹{product?.total_amount}</span>
                {product?.discount && parseFloat(product.discount) > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Save ₹{product.discount}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                + GST ₹{product?.gst_amount} ({product?.gst}%)
              </div>
            </div>

            <div className="mt-2 text-right">
              <span className="font-bold text-xl">Total: ₹{product?.booking_amount}</span>
            </div>
          </div>
        </label>
      );
    } else {
      // Package Card
      return (
        <label
          key={product.id}
          className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <label className="custom--checkbox mt-1">
            <input
              type="radio"
              name="selectedProduct"
              checked={selectedProduct?.id === product.id}
              onChange={() => setSelectedProduct(product)}
            />
            <span className="checkbox--custom--check"></span>
          </label>

          <div className="flex-1">
            <div className="flex items-start gap-3">
              {product?.image && (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg">{product?.name}</div>
                {product?.caption && (
                  <div className="text-sm text-gray-600 mt-1">{product?.caption}</div>
                )}
              </div>
            </div>

            {product?.description && (
              <div className="mt-2 text-sm text-gray-600">{product.description}</div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {/* {product?.package_type && (
                <div>
                  <span className="font-medium">Type:</span> {product.package_type}
                </div>
              )}
              {product?.session_level && (
                <div>
                  <span className="font-medium">Level:</span> {product.session_level}
                </div>
              )} */}
              {product?.no_of_sessions > 0 && (
                <div>
                  <span className="font-medium">Sessions:</span> {product.no_of_sessions}
                </div>
              )}
              {product?.session_duration > 0 && (
                <div>
                  <span className="font-medium">Duration:</span> {product.session_duration} mins
                </div>
              )}
              {product?.session_validity > 0 && (
                <div>
                  <span className="font-medium">Validity:</span> {product.session_validity} days
                </div>
              )}
              {product?.max_capacity > 0 && (
                <div>
                  <span className="font-medium">Capacity:</span> {product.max_capacity}
                </div>
              )}
            </div>

            {product?.equipment && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Equipment:</span> {product.equipment}
              </div>
            )}

            {/* {product?.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )} */}

            <div className="mt-3 pt-3  flex items-center justify-between">
              <div className="flex items-center gap-2">
                {parseFloat(product?.amount) > 0 ? (
                  <>
                    <span className="text-gray-500 line-through text-sm">₹{product?.amount}</span>
                    <span className="font-bold text-lg text-green-600">₹{product?.total_amount}</span>
                    {product?.discount && parseFloat(product.discount) > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Save ₹{product.discount}
                      </span>
                    )}
                  </>
                ) : null}
              </div>
              {parseFloat(product?.gst_amount) > 0 && (
                <div className="text-sm text-gray-600">
                  + GST ₹{product?.gst_amount} ({product?.gst}%)
                </div>
              )}
            </div>

            {parseFloat(product?.booking_amount) > 0 && (
              <div className="mt-2 text-right">
                <span className="font-bold text-xl">Total: ₹{product?.booking_amount}</span>
              </div>
            )}

            {/* <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
              {product?.club_name && <span>📍 {product.club_name}</span>}
              {product?.studio_name && <span>🏢 {product.studio_name}</span>}
              {product?.staff_name && <span>👤 {product.staff_name}</span>}
            </div> */}
          </div>
        </label>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
      <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-lg max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4">
          {isVariationModal ? "Select Variation" : "Select Product"}
        </h2>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            {isVariationModal ? "No variations found" : "No products found"}
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredProducts.map((product) => renderProductCard(product))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedProduct}
          >
            {isVariationModal ? "Select Variation" : "Add Selected"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceProductDetails;
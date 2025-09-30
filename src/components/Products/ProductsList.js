import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../common/Tooltip";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import CreateProduct from "./CreateProduct";
import Switch from "react-switch";

const productTypeOptions = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "service", label: "Service" },
];

const listingStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const ProductsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [submittedProducts, setSubmittedProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductType, setSelectedProductType] = useState(null);

  const centreNameOptions = Array.from(
    new Set(submittedProducts.map((p) => p.centreName))
  ).map((name) => ({ value: name, label: name }));

  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedListingStatus, setSelectedListingStatus] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedProductType, submittedProducts]);

  // Filtered + paginated data
  const filteredData = submittedProducts.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedProductType
      ? product.productType === selectedProductType.value
      : true;
    const matchesCentre = selectedCentre
      ? product.centreName === selectedCentre.value
      : true;
    const matchesListing = selectedListingStatus
      ? product.listingStatus === selectedListingStatus.value
      : true;
    return matchesSearch && matchesType && matchesCentre && matchesListing;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleProductCreated = (productData) => {
    if (editingProduct) {
      setSubmittedProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id ? { ...p, ...productData } : p
        )
      );
      toast.success("Product updated successfully!");
    } else {
      const newProduct = { id: Date.now(), ...productData };
      setSubmittedProducts((prev) => [...prev, newProduct]);
      toast.success("Product added successfully!");
    }
    setShowModal(false);
    setEditingProduct(null);
  };

const handleStatusToggle = (productId) => {
  let newStatus = "";

  setSubmittedProducts((prev) =>
    prev.map((item) => {
      if (item.id === productId) {
        newStatus = item.listingStatus === "active" ? "inactive" : "active";
        return { ...item, listingStatus: newStatus };
      }
      return item;
    })
  );

  // Toast after state update logic
  toast.success(`Product marked as ${newStatus}`);
};


  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Products`}</p>
          <h1 className="text-3xl font-semibold">All Products</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Create Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Product Name Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name"
          className="custom--input"
        />

        {/* Product Type */}
        <Select
          options={productTypeOptions}
          value={selectedProductType}
          onChange={setSelectedProductType}
          isClearable
          placeholder="Product Type"
          styles={customStyles}
        />

        {/* Centre Name */}
        <Select
          options={centreNameOptions}
          value={selectedCentre}
          onChange={setSelectedCentre}
          isClearable
          placeholder="Centre Name"
          styles={customStyles}
        />

        {/* Listing Status */}
        <Select
          options={listingStatusOptions}
          value={selectedListingStatus}
          onChange={setSelectedListingStatus}
          isClearable
          placeholder="Listing Status"
          styles={customStyles}
        />
      </div>

      {/* Table */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">Product ID</th>
                <th className="px-2 py-4">Product Name</th>
                <th className="px-2 py-4">Product Type</th>
                <th className="px-2 py-4">Centre Name</th>
                <th className="px-2 py-4">Quantity</th>
                <th className="px-2 py-4">MRP</th>
                <th className="px-2 py-4">Selling Price</th>
                <th className="px-2 py-4">Listing Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id}
                  className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                >
                  <td className="px-2 py-4">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-2 py-4">{row.productName}</td>
                  <td className="px-2 py-4">{row.productType}</td>
                  <td className="px-2 py-4">{row.centreName}</td>
                  <td className="px-2 py-4">{row.quantity}</td>
                  <td className="px-2 py-4">₹{row.mrp}</td>
                  <td className="px-2 py-4">₹{row.sellingPrice}</td>
                  <td className="px-2 py-4">
                    <Switch
                      onChange={() => handleStatusToggle(row.id)}
                      checked={row.listingStatus === "active"}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onColor="#000"
                      offColor="#e5e7eb"
                      handleDiameter={22}
                      height={25}
                      width={50}
                      className="custom-switch"
                    />
                  </td>
                  <td className="px-2 py-4">
                    <Tooltip
                      id={`edit-product-${row.id}`}
                      content="Edit Product"
                      place="left"
                    >
                      <div
                        onClick={() => {
                          setEditingProduct(row);
                          setShowModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <LiaEdit className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2">
        <p className="text-gray-700">
          Showing {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}{" "}
          to {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
          {filteredData.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            <FaAngleLeft />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1 ? "bg-gray-200" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            <FaAngleRight />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateProduct
          setShowModal={setShowModal}
          onProductCreated={handleProductCreated}
          initialData={editingProduct}
        />
      )}
    </div>
  );
};

export default ProductsList;

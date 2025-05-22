import React, { useState } from "react";
import { servicesData } from "../DummyData/DummyData";
import Select from "react-select";
import { customStyles } from "../Helper/helper";
import { Link } from "react-router-dom";

const priceOptions = [
  { value: "All", label: "All Prices" },
  { value: "0-200", label: "₹0 - ₹200" },
  { value: "201-300", label: "₹201 - ₹300" },
  { value: "301+", label: "₹301+" },
];

const gxSubCategoryOptions = [
  { value: "Group Class", label: "Group Class" },
  { value: "Event", label: "Event" },
];

const tabs = ["Sports", "Trainers", "GX"];

const ServicesList = () => {
  const [activeTab, setActiveTab] = useState("Sports");

  const [filters, setFilters] = useState({
    Sports: { type: null, price: null },
    Trainers: { type: null, price: null },
    GX: { subCategory: null, type: null, price: null },
  });

  const handleSubCategoryChange = (selectedSub) => {
    setFilters((prev) => ({
      ...prev,
      GX: { ...prev.GX, subCategory: selectedSub, type: null }, // reset type on subCategory change
    }));
  };

  const handleTypeChange = (selectedType) => {
    setFilters((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], type: selectedType },
    }));
  };

  const handlePriceChange = (selectedPrice) => {
    setFilters((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], price: selectedPrice },
    }));
  };

  const tabServices = servicesData.filter(
    (service) => service.category === activeTab
  );

  // Unique types based on GX subCategory
  const gxTypes = (() => {
    if (activeTab !== "GX" || !filters.GX.subCategory) return [];
    const sub = filters.GX.subCategory.value;
    const filtered = tabServices.filter((s) => s.subCategory === sub);
    return [
      { value: "All", label: "All Types" },
      ...Array.from(new Set(filtered.map((s) => s.type))).map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    ];
  })();

  // Generic type options for Sports & Trainers
  const defaultTypes =
    activeTab !== "GX"
      ? [
          { value: "All", label: "All Types" },
          ...Array.from(new Set(tabServices.map((s) => s.type))).map(
            (type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
            })
          ),
        ]
      : [];

  const filteredServices = tabServices.filter((service) => {
    const tabFilter = filters[activeTab];
    const { type, price } = tabFilter;
    const matchesType =
      !type || type.value === "All" || service.type === type.value;

    const matchesPrice = (() => {
      if (!price || price.value === "All") return true;
      const p = service.price;
      if (price.value === "0-200") return p <= 200;
      if (price.value === "201-300") return p > 200 && p <= 300;
      if (price.value === "301+") return p > 300;
      return true;
    })();

    const matchesSubCategory =
      activeTab !== "GX" ||
      !filters.GX.subCategory ||
      service.subCategory === filters.GX.subCategory.value;

    return matchesType && matchesPrice && matchesSubCategory;
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; All Services</p>
          <h1 className="text-3xl font-semibold">All Services</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="list--services flex items-center gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="w-full flex flex-wrap gap-2 mb-4">
        {/* GX SubCategory Dropdown */}
        {activeTab === "GX" && (
          <Select
            options={gxSubCategoryOptions}
            value={filters.GX.subCategory}
            onChange={handleSubCategoryChange}
            placeholder="Select Category"
            isClearable
            styles={customStyles}
          />
        )}

        {/* Type Dropdown */}
        {/* Type Dropdown - Show only when GX has subCategory or for non-GX tabs */}
        {(activeTab !== "GX" || filters.GX.subCategory) && (
          <Select
            options={activeTab === "GX" ? gxTypes : defaultTypes}
            value={filters[activeTab].type}
            onChange={handleTypeChange}
            placeholder="Filter by Type"
            isClearable
            styles={customStyles}
            className="capitalize"
          />
        )}

        {/* Price Dropdown */}
        <Select
          options={priceOptions}
          value={filters[activeTab].price}
          onChange={handlePriceChange}
          placeholder="Filter by Price"
          isClearable
          styles={customStyles}
        />
      </div>

      {/* Services List */}
      <div className="block mt-5">
        {filteredServices.length === 0 ? (
          <div className="text-center text-gray-600 mt-10 text-lg">
            ❌ No services found for the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="service--box flex lg:flex-nowrap bg-white border rounded-lg overflow-hidden"
              >
                <div className="service--thumb min-h-[150px] w-[150px] flex-1">
                  <img
                    src={service.images?.[0]}
                    alt="Service Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="servce--content p-4 flex-1">
                  <h2 className="text-xl font-semibold">{service.title}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {service.description}
                  </p>
                  <div className="service--price mt-3">
                    <p className="text-sm font-semibold">
                      Price: ₹{service.price}
                    </p>
                    <Link
                      to={`/book-service/${service.id}`}
                      className="block w-fit bg-black text-white px-4 py-2 rounded mt-3"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesList;

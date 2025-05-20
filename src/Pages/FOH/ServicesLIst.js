import React, { useState } from "react";
import { servicesData } from "../../DummyData/DummyData";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { Link } from "react-router-dom";


const serviceTypes = [
  { value: "All", label: "All Types" },
  { value: "Outdoor", label: "Outdoor" },
  { value: "Indoor", label: "Indoor" },
  { value: "Wellness", label: "Wellness" },
];

const priceOptions = [
  { value: "All", label: "All Prices" },
  { value: "0-200", label: "₹0 - ₹200" },
  { value: "201-300", label: "₹201 - ₹300" },
  { value: "301+", label: "₹301+" },
];

const ServicesLIst = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  

  const serviceTypes = [
    { value: "All", label: "All Types" },
    ...Array.from(new Set(servicesData.map((s) => s.type))).map((type) => ({
      value: type,
      label: type,
    })),
  ];

  const filteredServices = servicesData.filter((service) => {
    const matchesType =
      !selectedType ||
      selectedType.value === "All" ||
      service.type === selectedType.value;

    const matchesPrice = (() => {
      if (!selectedPrice || selectedPrice.value === "All") return true;
      const price = service.price;
      if (selectedPrice.value === "0-200") return price <= 200;
      if (selectedPrice.value === "201-300") return price > 200 && price <= 300;
      if (selectedPrice.value === "301+") return price > 300;
      return true;
    })();

    return matchesType && matchesPrice;
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; All Services</p>
          <h1 className="text-3xl font-semibold">All Services</h1>
        </div>
      </div>

      <div className="w-full flex gap-2">
        <Select
          options={serviceTypes}
          value={selectedType}
          onChange={setSelectedType}
          placeholder="Filter by Type"
          isClearable
          styles={customStyles}
          className="capitalize"
        />
        <Select
          options={priceOptions}
          value={selectedPrice}
          onChange={setSelectedPrice}
          placeholder="Filter by Price"
          isClearable
          styles={customStyles}
        />
      </div>

      <div className="block mt-5">
        {filteredServices.length === 0 ? (
          <div className="text-center text-gray-600 mt-10 text-lg">
            ❌ No services found for the selected type.
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
                    src={service.images ? service.images[0] : service.image}
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

export default ServicesLIst;

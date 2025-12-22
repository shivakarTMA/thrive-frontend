import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateProduct from "./CreateProduct";
import { authAxios } from "../../config/config";
import { IoIosSearch } from "react-icons/io";
import Pagination from "../common/Pagination";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

const ProductsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [service, setService] = useState([]);
  const [productCategory, setProductCategory] = useState([]);
  const [productFilter, setProductFilter] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchService = async (search = "") => {
    try {
      const res = await authAxios().get("/service/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setService(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch service");
    }
  };

  const productServices = service?.filter((item) => item.type === "PRODUCT");

  const serviceOptions =
    productServices?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
  console.log(service, "service service");

  const fetchProductCategory = async (search = "") => {
    try {
      const res = await authAxios().get("/product/category/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setProductCategory(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch product");
    }
  };

  const productCategoryOptions =
    productCategory
      ?.sort((a, b) => a.position - b.position)
      .map((item) => ({
        label: item.title,
        value: item.id,
        position: item.position,
      })) || [];

  const fetchProductList = async (
    search = searchTerm,
    currentPage = page,
    category = productFilter
  ) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      // Search param
      if (search) params.search = search;

      if (category?.value) params.product_category_id = category.value;

      const res = await authAxios().get("/product/list", { params });
      const responseData = res.data;
      const data = responseData?.data || [];

      setPackages(data);

      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Package not found");
    }
  };

  // Fetch packages again when search or service filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProductList(searchTerm, 1, productFilter);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, productFilter]);

  // Initial fetch
  useEffect(() => {
    fetchProductList();
    fetchService();
    fetchProductCategory();
  }, []);

  const validationSchema = Yup.object().shape({
    image: Yup.mixed()
      .required("Image is required")
      .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
        if (!value || typeof value === "string") return true;
        return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
      }),
    // service_id: Yup.string().required("Service is required"),
    product_category_id: Yup.string().required("Product category is required"),
    name: Yup.string().required("Name is required"),
    caption: Yup.string().required("Caption is required"),
    // sku: Yup.string().required("sku is required"),
    product_type: Yup.string().required("Product type is required"),
    food_type: Yup.string().required("Food type is required"),
    // short_description: Yup.string().required("Short Description is required"),
    calorie: Yup.string().required("Calorie is required"),
    protein: Yup.string().required("Protein is required"),
    carbohydrate: Yup.string().required("Carbohydrate is required"),
    fat: Yup.string().required("Fat is required"),
    description: Yup.string().required("Description is required"),
    allergens: Yup.string().required("Allergens is required"),
    amount: Yup.string().required("Amount is required"),
    discount: Yup.string().required("Discount is required"),
    gst: Yup.string().required("GST is required"),
    stock_quantity: Yup.string().required("Stock Quantity is required"),
    earn_coin: Yup.string().required("Thrive Coins is required"),
    position: Yup.string().required("Position is required"),

    status: Yup.string().when("editingOption", {
      is: (val) => val === null, // when editingOption is null
      then: (schema) => schema.notRequired(), // not required
      otherwise: (schema) => schema.required("Status is required"), // required otherwise
    }),
    editingOption: Yup.mixed().nullable(),
  });

  const initialValues = {
    image: "",
    // service_id: "",
    product_category_id: "",
    product_category_id: "",
    name: "",
    caption: "",
    sku: "",
    product_type: "",
    food_type: "",
    short_description: "",
    calorie: "",
    protein: "",
    carbohydrate: "",
    fat: "",
    description: "",
    allergens: "",
    hsn_sac_code: "",
    amount: "",
    discount: "",
    gst: "",
    stock_quantity: "",
    earn_coin: "",
    position: "",
    status: "",
    editingOption: null,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          // ✅ Skip image key if it is just a string (URL from DB)
          if (key === "image" && typeof values.image === "string") return;
          if (key === "editingOption") return;

          formData.append(key, values[key]);
        });

        // if file exists, append it (instead of just file name)
        if (values.image instanceof File) {
          formData.append("file", values.image);
        }

        // 🟡 Create or Update API call
        if (editingOption) {
          await authAxios().put(`/product/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/product/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        // ✅ If everything passes, refresh and reset
        fetchProductList();
        resetForm();
        setEditingOption(null);
        setShowModal(false);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        const message = err.response?.data?.message?.toLowerCase() || "";
        toast.error(message);
      }
    },
  });

  console.log(formik.errors, "errorchecking");

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Nourish Products`}</p>
          <h1 className="text-3xl font-semibold">Nourish Products</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingOption(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Create Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="mb-4 w-full max-w-[250px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Category"
            options={productCategoryOptions}
            value={productFilter}
            onChange={(option) => setProductFilter(option)}
            isClearable
            styles={customStyles}
          />
        </div>
      </div>
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4">Module ID</th> */}
                <th className="px-2 py-4 min-w-[70px]">Image</th>
                <th className="px-2 py-4 min-w-[200px]">Title</th>
                <th className="px-2 py-4 min-w-[100px]">Category</th>
                <th className="px-2 py-4 min-w-[120px]">Product Type</th>
                <th className="px-2 py-4 min-w-[100px]">Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Discount</th>
                <th className="px-2 py-4 min-w-[110px]">Total Amount</th>
                <th className="px-2 py-4 min-w-[90px]">GST</th>
                <th className="px-2 py-4 min-w-[100px]">GST Amount</th>
                <th className="px-2 py-4 min-w-[110px]">Final Amount</th>
                <th className="px-2 py-4 text-center min-w-[80px]">Position</th>
                <th className="px-2 py-4 min-w-[100px]">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-4">
                    No nourish products found.
                  </td>
                </tr>
              ) : (
                packages.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{item?.id || "—"}</td> */}
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        <img
                          src={item.image}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.name}</td>
                    <td className="px-2 py-4">{item?.product_category_name}</td>
                    <td className="px-2 py-4">{item?.product_type}</td>
                    <td className="px-2 py-4">₹{item?.amount}</td>
                    <td className="px-2 py-4">₹{item?.discount}</td>
                    <td className="px-2 py-4">₹{item?.total_amount}</td>
                    <td className="px-2 py-4">{item?.gst}%</td>
                    <td className="px-2 py-4">₹{item?.gst_amount}</td>
                    <td className="px-2 py-4">₹{item?.booking_amount}</td>
                    <td className="px-2 py-4 text-center">{item.position}</td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${
                          item?.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <FaCircle />
                        {item?.status
                          ? item.status.charAt(0) +
                            item.status.slice(1).toLowerCase()
                          : ""}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="w-fit">
                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Club"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setEditingOption(item.id);
                              setShowModal(true);
                            }}
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </div>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={packages.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchProductList(searchTerm, newPage);
          }}
        />
      </div>
      {showModal && (
        <CreateProduct
          setShowModal={setShowModal}
          editingOption={editingOption}
          serviceOptions={serviceOptions}
          productCategoryOptions={productCategoryOptions}
          formik={formik}
        />
      )}
    </div>
  );
};

export default ProductsList;

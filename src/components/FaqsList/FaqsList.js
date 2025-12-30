import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateFaqs from "./CreateFaqs";
import { authAxios } from "../../config/config";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { IoSearchOutline } from "react-icons/io5";
import Pagination from "../common/Pagination";

const FaqsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [faqList, setFaqList] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);
  const [productCategory, setProductCategory] = useState([]);
  const [productFilter, setProductFilter] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProductCategory = async (search = "") => {
    try {
      const res = await authAxios().get("/faqcategory/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeOnly = filterActiveItems(data);
      setProductCategory(activeOnly);
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

  const fetchFaqsList = async (
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

      if (category?.value) params.category_id = category.value;

      const res = await authAxios().get("/faqs/list", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      setFaqList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  // Fetch packages again when search or service filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFaqsList(searchTerm, 1, productFilter);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, productFilter]);

  useEffect(() => {
    fetchFaqsList();
    fetchProductCategory();
  }, []);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      faqcategory_id: null,
      question: "",
      answer: "",
      top_search: null,
      position: null,
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      faqcategory_id: Yup.string().required("Category is required"),
      question: Yup.string().required("Question is required"),
      answer: Yup.string().required("Answer is required"),
      top_search: Yup.boolean()
        .nullable()
        .oneOf([true, false], "Top Search is required"),
      position: Yup.number().required("Position is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values };

        if (editingOption && editingOption) {
          await authAxios().put(`/faqs/${editingOption}`, payload);
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/faqs/create", payload);
          toast.success("Created Successfully");
        }

        fetchFaqsList();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save faq");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > FAQ List`}</p>
          <h1 className="text-3xl font-semibold">FAQ List</h1>
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
            <FiPlus /> Create FAQ
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 ">
        <div className="mb-4 w-full max-w-[250px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search by question..."
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
                <th className="px-2 py-4">Category</th>
                <th className="px-2 py-4">Question</th>
                <th className="px-2 py-4">Top Search</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {faqList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No data found.
                  </td>
                </tr>
              ) : (
                faqList.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td className="px-2 py-4">{item?.faq_category_name}</td>
                    <td className="px-2 py-4">{item?.question}</td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${
                          item?.top_search === true
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <FaCircle />
                        {item?.top_search === true ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td className="px-2 py-4">{item.position}</td>
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
                          id={`tooltip-edit-${item.id || index}`}
                          content="Edit Category"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setEditingOption(item?.id);
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
        currentDataLength={faqList.length}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchFaqsList(searchTerm, newPage);
        }}
      />
      </div>
      {showModal && (
        <CreateFaqs
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          productCategoryOptions={productCategoryOptions}
        />
      )}
    </div>
  );
};

export default FaqsList;

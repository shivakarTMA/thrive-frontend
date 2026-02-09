import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateProductCategory from "./CreateProductCategory";
import { authAxios } from "../../config/config";
import { useSelector } from "react-redux";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { IoSearchOutline } from "react-icons/io5";
import Pagination from "../common/Pagination";

const ProductCategoryList = () => {
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const [club, setClub] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchClub = async (search = "") => {
    try {
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeClub = data.filter((item) => item.status === "ACTIVE");
      setClub(activeClub);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  const fetchProductCategoryList = async (search = "", currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      if (statusFilter?.value) {
        params.status = statusFilter.value;
      }

      const res = await authAxios().get("/product/category/list", { params });
      let data = res.data?.data || res.data || [];
      console.log(res.data,'res.data')
      setPackages(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchProductCategoryList();
    fetchClub();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name, // Show club name
      value: item.id, // Store club_id as ID
    })) || [];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchProductCategoryList(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, clubFilter, statusFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      icon: "",
      position: "",
      status: "ACTIVE",
      club_id: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      icon: Yup.string().required("Icon is required"),
      position: Yup.number().required("Position is required"),
      status: Yup.string().required("Status is required"),
      club_id: Yup.string().required("Club is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("position", values.position);
        formData.append("status", values.status);
        formData.append("club_id", values.club_id);

        // if file exists, append it (instead of just file name)
        if (values.iconFile instanceof File) {
          formData.append("file", values.iconFile);
        }

        if (editingOption && editingOption) {
          // Update
          await authAxios().put(
            `/product/category/${editingOption}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/product/category/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchProductCategoryList();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save package");
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
          <p className="text-sm">{`Home > Nourish Category`}</p>
          <h1 className="text-3xl font-semibold">Nourish Category</h1>
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
            <FiPlus /> Create Category
          </button>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="mb-4 w-full max-w-[250px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
        </div>
        <div className="w-fit min-w-[180px]">
          <Select
            placeholder="Filter by club"
            options={clubOptions}
            value={clubFilter}
            onChange={setClubFilter}
            isClearable={userRole === "ADMIN" ? true : false}
            styles={customStyles}
          />
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
            value={statusFilter}
            onChange={(option) => setStatusFilter(option)}
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
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">Title</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No packages added yet.
                  </td>
                </tr>
              ) : (
                packages.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{item?.id || "—"}</td> */}
                    <td>
                      <div className="bg-gray-100 rounded-lg p-3 w-14 h-14">
                        <img
                          src={item.icon}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.title}</td>
                    <td>{item.position}</td>
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
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={packages.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchProductCategoryList(searchTerm, newPage);
          }}
        />
      </div>
      {showModal && (
        <CreateProductCategory
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          clubOptions={clubOptions}
        />
      )}
    </div>
  );
};

export default ProductCategoryList;

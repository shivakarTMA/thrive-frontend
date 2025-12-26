import React, { useEffect } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { MdOutlineContentPasteSearch } from "react-icons/md";

const CreateFaqs = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  productCategoryOptions,
}) => {

  // ✅ Fetch role details when selectedId changes
  useEffect(() => {
    if (!editingOption) return;

    const fetchPackageById = async (id) => {
      try {
        const res = await authAxios().get(`/faqs/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            faqcategory_id: data.faqcategory_id || null,
            question: data.question || "",
            answer: data.answer || "",
            top_search: typeof data.top_search === "boolean" ? data.top_search : null,
            position: data.position || null,
            status: data.status || "ACTIVE",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch faq details");
      }
    };

    fetchPackageById(editingOption);
  }, [editingOption]);

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-[600px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit FAQ" : "Create FAQ"}
          </h2>
          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              formik.resetForm();
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block">Category</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>

                      <Select
                        options={productCategoryOptions}
                        value={productCategoryOptions.find(
                          (option) =>
                            option.value === formik.values.faqcategory_id
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("faqcategory_id", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("faqcategory_id", true)
                        }
                        styles={selectIcon}
                        placeholder="Select Category"
                      />
                    </div>
                    {formik.touched.faqcategory_id &&
                      formik.errors.faqcategory_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.faqcategory_id}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Question<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="question"
                        value={formik.values.question}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.question && formik.errors.question && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.question}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">Top Search</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <MdOutlineContentPasteSearch />
                      </span>
                      <Select
                        name="top_search"
                        value={{
                          label: formik.values.top_search
                            ? "ACTIVE"
                            : "INACTIVE", // Handling label based on boolean value
                          value: formik.values.top_search,
                        }}
                        options={[
                          { label: "Active", value: true },
                          { label: "Inactive", value: false },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("top_search", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("top_search", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.top_search && formik.errors.top_search && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.top_search}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  {editingOption && editingOption && (
                    <div>
                      <label className="mb-2 block">Status</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                          <LuPlug />
                        </span>
                        <Select
                          name="status"
                          value={{
                            label: formik.values.status,
                            value: formik.values.status,
                          }}
                          options={[
                            { label: "Active", value: "ACTIVE" },
                            { label: "Inactive", value: "INACTIVE" },
                          ]}
                          onChange={(option) =>
                            formik.setFieldValue("status", option.value)
                          }
                          onBlur={() => formik.setFieldTouched("status", true)}
                          styles={selectIcon}
                          className="!capitalize"
                        />
                      </div>
                      {formik.touched.status && formik.errors.status && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.status}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="mb-2 block">
                      Answer<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        name="answer"
                        value={formik.values.answer}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.answer && formik.errors.answer && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                {editingOption ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFaqs;

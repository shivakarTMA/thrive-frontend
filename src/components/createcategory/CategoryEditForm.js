import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const CategoryEditForm = () => {
  const formik = useFormik({
    initialValues: {
      categoryName: "",
      types: "",
      trp: "",
    },
    validationSchema: Yup.object({
      categoryName: Yup.string().required("Required"),
      trp: Yup.number().required("Required"),
    }),
    onSubmit: (values) => console.log("Category Edit", values),
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <input name="categoryName" placeholder="Category Name" onChange={formik.handleChange} value={formik.values.categoryName} />
      <input name="types" placeholder="Types (comma-separated)" onChange={formik.handleChange} value={formik.values.types} />
      <input name="trp" type="number" placeholder="TRP %" onChange={formik.handleChange} value={formik.values.trp} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default CategoryEditForm;
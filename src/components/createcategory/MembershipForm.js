import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const MembershipForm = () => {
  const formik = useFormik({
    initialValues: {
      name: "",
      shortDescription: "",
      duration: "",
      longDescription: "",
      price: "",
      tax: "",
      totalPrice: "",
      visibility: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      duration: Yup.string().required("Required"),
      price: Yup.number().required("Required"),
      tax: Yup.number(),
      totalPrice: Yup.number().required("Required"),
    }),
    onSubmit: (values) => console.log("Membership", values),
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <input name="name" placeholder="Name" onChange={formik.handleChange} value={formik.values.name} />
      <input name="shortDescription" placeholder="Short Description" onChange={formik.handleChange} value={formik.values.shortDescription} />
      <input name="duration" placeholder="Duration" onChange={formik.handleChange} value={formik.values.duration} />
      <textarea name="longDescription" placeholder="Long Description" onChange={formik.handleChange} value={formik.values.longDescription} />
      <input name="price" type="number" placeholder="Price" onChange={formik.handleChange} value={formik.values.price} />
      <input name="tax" type="number" placeholder="Tax" onChange={formik.handleChange} value={formik.values.tax} />
      <input name="totalPrice" type="number" placeholder="Total Price" onChange={formik.handleChange} value={formik.values.totalPrice} />
      <label><input type="checkbox" name="visibility" onChange={formik.handleChange} checked={formik.values.visibility} /> Visible</label>
      <button type="submit">Submit</button>
    </form>
  );
};
export default MembershipForm;
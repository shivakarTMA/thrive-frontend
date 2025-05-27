import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const SportCourtForm = () => {
  const formik = useFormik({
    initialValues: {
      name: "",
      shortDescription: "",
      sportType: "",
      slotDuration: "",
      longDescription: "",
      image: "",
      price: "",
      tax: "",
      totalPrice: "",
      operationalTiming: "",
      visibility: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      sportType: Yup.string().required("Required"),
    }),
    onSubmit: (values) => console.log("Sport Court", values),
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <input name="name" placeholder="Name" onChange={formik.handleChange} value={formik.values.name} />
      <input name="sportType" placeholder="Sport Type" onChange={formik.handleChange} value={formik.values.sportType} />
      <input name="slotDuration" placeholder="Slot Duration" onChange={formik.handleChange} value={formik.values.slotDuration} />
      <textarea name="longDescription" placeholder="Long Description" onChange={formik.handleChange} value={formik.values.longDescription} />
      <input name="price" type="number" placeholder="Price" onChange={formik.handleChange} value={formik.values.price} />
      <input name="totalPrice" type="number" placeholder="Total Price" onChange={formik.handleChange} value={formik.values.totalPrice} />
      <input name="operationalTiming" placeholder="Operational Timing" onChange={formik.handleChange} value={formik.values.operationalTiming} />
      <label><input type="checkbox" name="visibility" onChange={formik.handleChange} checked={formik.values.visibility} /> Visible</label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default SportCourtForm;
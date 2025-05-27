import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const MerchandiseForm = () => {
  const formik = useFormik({
    initialValues: {
      name: "",
      shortDescription: "",
      itemType: "",
      image: "",
      longDescription: "",
      price: "",
      tax: "",
      totalPrice: "",
      remarks: "",
      visibility: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      price: Yup.number(),
    }),
    onSubmit: (values) => console.log("Merchandise", values),
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <input name="name" placeholder="Name" onChange={formik.handleChange} value={formik.values.name} />
      <input name="itemType" placeholder="Item Type" onChange={formik.handleChange} value={formik.values.itemType} />
      <input name="price" type="number" placeholder="Price" onChange={formik.handleChange} value={formik.values.price} />
      <textarea name="remarks" placeholder="Remarks" onChange={formik.handleChange} value={formik.values.remarks} />
      <label><input type="checkbox" name="visibility" onChange={formik.handleChange} checked={formik.values.visibility} /> Visible</label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default MerchandiseForm;
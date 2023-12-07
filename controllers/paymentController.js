import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/paymentModel.js";

// export const checkout = async (req, res) => {
//   const options = {
//     amount: Number(req.body.amount * 100),
//     currency: "INR",
//   };
//   const order = await instance.orders.create(options);

//   res.status(200).json({
//     success: true,
//     order,
//   });
// };

// export const paymentVerification = async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
//     .update(body.toString())
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;

//   if (isAuthentic) {
//     // Database comes here

//     await Payment.create({
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     });

//     res.redirect(
//       `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
//     );
//   } else {
//     res.status(400).json({
//       success: false,
//     });
//   }
// };
export const checkout = async (req, res) => {
  try {
    var options = {
      amount: 48000, // amount in the smallest currency unit
      currency: "INR",
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await instance.orders.create(options);

    console.log("Razorpay order created successfully:", order);

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);

    // Log the full error object
    console.error("Full error object:", err);

    res.status(500).json({ msg: "Internal server error", error: err });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    console.log(razorpay_payment_id);
    console.log(razorpay_order_id);
    console.log(razorpay_signature);

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const isAuthentic = generated_signature === razorpay_signature;

    if (isAuthentic) {
      const paymentData = {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      };

      // Assuming you have a Mongoose model named Payment
      const newPayment = new Payment(paymentData);

      // Save the payment details to the database
      await newPayment.save();
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

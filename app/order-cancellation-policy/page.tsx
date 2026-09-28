
import PolicyPage from "@/components/PolicyPage";

export default function OrderCancellationPolicy() {
  return (
    <PolicyPage
      title="Order & Cancellation Policy"
      intro="Wholesale orders at Mahakal A To Z are confirmed directly with buyers after product details, quantities, pricing and shipping arrangements are agreed upon."
      sections={[
        {
          heading: "1. Enquiry Is Not an Order",
          paragraphs: [
            "Submitting an enquiry through the website or WhatsApp does not automatically create a confirmed order. Our team will confirm availability, quantity, pricing and delivery arrangements."
          ]
        },
        {
          heading: "2. Order Confirmation",
          bullets: [
            "The product name and specifications must be confirmed.",
            "Quantity and minimum order requirements must be agreed upon.",
            "Product price and shipping charges must be communicated.",
            "The buyer must agree to the final order details and complete the required prepaid payment."
          ]
        },
        {
          heading: "3. Prepaid Orders Only",
          paragraphs: [
            "All orders require advance payment. Cash on Delivery is not available. Orders are processed after payment is received and verified."
          ]
        },
        {
          heading: "4. Cancellation Before Dispatch",
          paragraphs: [
            "Buyers should contact us as soon as possible if they wish to cancel an order before dispatch. Cancellation requests will be reviewed based on the order status, product availability and any sourcing or packing already completed.",
            "If cancellation is accepted, any refund due will be processed in accordance with the confirmed cancellation terms and applicable law."
          ]
        },
        {
          heading: "5. Cancellation After Dispatch",
          paragraphs: [
            "Once an order has been dispatched, cancellation may not be possible. Wrong, defective, damaged or undelivered goods will be handled under our applicable replacement, shipping and legal obligations."
          ]
        },
        {
          heading: "6. Cancellation by Mahakal A To Z",
          paragraphs: [
            "If we cannot fulfil a confirmed and paid order, we will inform the buyer and arrange the applicable refund or other legally required remedy."
          ]
        },
        {
          heading: "7. Changes to an Order",
          paragraphs: [
            "Requests to change size, colour, quantity, address or product should be made before dispatch. Changes are subject to stock availability and confirmation by our team."
          ]
        }
      ]}
    />
  );
}

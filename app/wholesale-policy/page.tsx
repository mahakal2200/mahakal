
import PolicyPage from "@/components/PolicyPage";

export default function WholesalePolicy() {
  return (
    <PolicyPage
      title="Wholesale Pricing & MOQ Policy"
      intro="Mahakal A To Z supplies men's wear to retailers, shopkeepers and bulk buyers. Wholesale prices and minimum order quantities depend on the product and order requirements."
      sections={[
        {
          heading: "1. Wholesale Pricing",
          paragraphs: [
            "Product prices displayed on the website are indicative unless expressly confirmed as final. The final wholesale rate will be communicated before payment.",
            "Prices may change due to stock availability, sourcing costs, quantity and supplier conditions. A quotation is valid for the period communicated by our team."
          ]
        },
        {
          heading: "2. Minimum Order Quantity",
          paragraphs: [
            "Minimum order quantity (MOQ) may vary by product, size, colour, design and available stock. Buyers should confirm the MOQ with our team before placing an order."
          ]
        },
        {
          heading: "3. Bulk Quantity Pricing",
          paragraphs: [
            "Different quantities may qualify for different wholesale rates. Any quantity-based discount or special quotation must be confirmed in writing before payment."
          ]
        },
        {
          heading: "4. Taxes and Invoicing",
          paragraphs: [
            "Applicable taxes, where required, will be communicated and reflected in the invoice in accordance with applicable law. Buyers should provide accurate billing details and GSTIN where applicable."
          ]
        },
        {
          heading: "5. Shipping Charges",
          paragraphs: [
            "Courier and transportation charges are separate from product prices and are payable by the buyer. The applicable shipping amount will be communicated before order confirmation."
          ]
        },
        {
          heading: "6. Stock Availability",
          paragraphs: [
            "Product listings and photos are intended to help buyers explore available collections. Stock, sizes and colours must be reconfirmed before payment, especially for large or mixed orders."
          ]
        },
        {
          heading: "7. Special and Bulk Orders",
          paragraphs: [
            "Special sourcing, large quantity orders or customised requirements may require a separate quotation, lead time and order-specific terms. Such terms will be confirmed before payment."
          ]
        }
      ]}
    />
  );
}

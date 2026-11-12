import TitleBlock from "../features/site/components/TitleBlock";
import Marquee from "../features/site/components/Marquee";
import Customers from "../features/site/components/Customers";
import Description from "../features/site/components/Description";
import ProductList from "../features/site/components/ProductList";
import EnquiryCard from "../features/inquiries/EnquiryCard";

// Listing-style layout: details on the left, contact/enquiry card on the right.
export default function HomePage() {
  return (
    <>
      <TitleBlock />
      <Marquee />
      <Customers />
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 pt-8 sm:px-6 sm:pt-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Description />
          <ProductList />
        </div>
        <EnquiryCard />
      </div>
    </>
  );
}

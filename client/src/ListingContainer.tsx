import { Listing } from "./interfaces";

interface IListingContainer {
  listing: Listing
}

function ListingContainer({ listing }: IListingContainer) {
  return (
    <a
      className="grid grid-cols-7 gap-4 mb-1 bg-slate-700 w-700px hover:bg-sky-700 items-center mx-6"
      href={listing.link}
      target="_blank"
    >
      <div>{listing.district}</div>
      <div>{listing.street}</div>
      <div>{listing.area}</div>
      <div>{listing.roomNum}</div>
      <div>{listing.floor}</div>
      <div>{listing.pricePM}</div>
      <div>{listing.price}</div>
    </a>
  );
}

export default ListingContainer;
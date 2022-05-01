export interface Listing {
  district: string,
  street: string,
  price: string,
  pricePM: string,
  roomNum: number,
  area: number,
  floor: string,
  link?: string,
  imageList: string[],
}

export interface DocumentListing {
  data: Listing[]
}
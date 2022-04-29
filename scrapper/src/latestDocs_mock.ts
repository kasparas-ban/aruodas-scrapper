const listings1 = [
  {
    district: 'Žvėrynas',
    street: 'Studentų g.',
    price: '80 000 €',
    pricePM: '4 703 €/m²',
    roomNum: 1,
    area: 17.01,
    floor: '5/5',
    link: 'https://www.aruodas.lt/butai-vilniuje-zveryne-studentu-g-parduodamas-naujai-irengtas-1k-studijos-tipo-1-3204475/',
    imageList: ['test', 'test']
  },
  {
    district: 'Žvėrynas',
    pricePM: '3 321 €/m²',
    link: 'https://www.aruodas.lt/butai-vilniuje-zveryne-saltoniskiu-g-vilniaus-centrineje-dalyje-zveryne-1-3204473/',
    street: 'Saltoniškių g.',
    roomNum: 1,
    floor: '9/9',
    price: '113 000 €',
    area: 34.03,
    imageList: ['test', 'test']
  },
  {
    pricePM: '821 €/m²',
    floor: '1/5',
    district: 'Grigiškės',
    street: 'Jaunimo skg.',
    roomNum: 3,
    price: '62 000 €',
    link: 'https://www.aruodas.lt/butai-vilniuje-grigiskese-jaunimo-skg-parduodamas-3-kambariu-butas-7556-kvm-su-1-3204465/',
    area: 75.56,
    imageList: []
  },
];

const listings2 = [
  {
    district: 'Žvėrynas',
    street: 'Studentų g.',
    price: '80 000 €',
    pricePM: '4 703 €/m²',
    roomNum: 1,
    area: 17.01,
    floor: '5/5',
    link: 'https://www.aruodas.lt/butai-vilniuje-zveryne-studentu-g-parduodamas-naujai-irengtas-1k-studijos-tipo-1-3204475/',
    imageList: ['test', 'test']
  },
  {
    district: 'Žvėrynas',
    pricePM: '3 321 €/m²',
    link: 'https://www.aruodas.lt/butai-vilniuje-zveryne-saltoniskiu-g-vilniaus-centrineje-dalyje-zveryne-1-3204473/',
    street: 'Saltoniškių g.',
    roomNum: 1,
    floor: '9/9',
    price: '113 000 €',
    area: 34.03,
    imageList: ['test', 'test']
  },
  {
    district: 'Antakalnis',
    pricePM: '2 070 €/m²',
    link: 'https://www.aruodas.lt/butai-vilniuje-antakalnyje-p-vileisio-g-parduodamas-3k-butas-pvileisio-g-1-3204519/',
    street: 'P. Vileišio g',
    roomNum: 3,
    floor: '2/5',
    price: '118 000 €',
    area: 57,
    imageList: ['test', 'test']
  },
];

const latestDocsMock = {
  latestDoc: { data: listings1 },
  secondDoc: { data: listings2 },
};

export default latestDocsMock;
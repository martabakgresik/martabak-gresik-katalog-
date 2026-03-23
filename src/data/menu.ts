import { formatPrice } from "../hooks/useCart";
import type { Addon } from "../hooks/useCart";

const ASSET_BASE_URL = "/images"; // "https://raw.githubusercontent.com/username/martabak-gresik-assets/main/images";

export const MENU_SWEET = [
  {
    category: "Terang Bulan Standard",
    items: [
      { name: "Kacang", price: 12000, image: `${ASSET_BASE_URL}/sweet/kacang.jpg` },
      { name: "Coklat", price: 12000, image: `${ASSET_BASE_URL}/sweet/coklat.jpg` },
      { name: "Kacang + Coklat", price: 14000, image: `${ASSET_BASE_URL}/sweet/kacang-coklat.jpg` },
      { name: "Kacang + Coklat + Keju", price: 19000, isBestSeller: true, image: `${ASSET_BASE_URL}/sweet/kacang-coklat-keju.jpg` },
      { name: "Keju", price: 17000, isBestSeller: true, highlight: true, image: `${ASSET_BASE_URL}/sweet/keju.jpg` },
      { name: "Keju + Kacang", price: 18000, highlight: true, image: `${ASSET_BASE_URL}/sweet/keju-kacang.jpg` },
      { name: "Keju + Coklat", price: 18000, highlight: true, image: `${ASSET_BASE_URL}/sweet/keju-coklat.jpg` },
    ],
  },
  {
    category: "Terang Bulan Pandan",
    items: [
      { name: "Pandan Kacang", price: 13000, image: `${ASSET_BASE_URL}/sweet/pandan-kacang.jpg` },
      { name: "Pandan Coklat", price: 13000, image: `${ASSET_BASE_URL}/sweet/pandan-coklat.jpg` },
      { name: "Pandan Kacang + Coklat", price: 15000, image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat.png` },
      { name: "Pandan Kacang + Coklat + Keju", price: 21000, image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat-keju.jpg` },
      { name: "Pandan Keju", price: 20000, highlight: true, isBestSeller: true, image: `${ASSET_BASE_URL}/sweet/pandan-keju.jpg` },
      { name: "Pandan Coklat Keju", price: 20000, highlight: true, image: `${ASSET_BASE_URL}/sweet/pandan-coklat-keju.jpg` },
      { name: "Pandan Kacang + Keju", price: 20000, highlight: true, image: `${ASSET_BASE_URL}/sweet/pandan-kacang-keju.jpg` },
    ],
  },
  {
    category: "Terang Bulan Red Velvet",
    items: [
      { name: "Red Velvet Kacang", price: 14000, image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang.png` },
      { name: "Red Velvet Coklat", price: 14000, image: `${ASSET_BASE_URL}/sweet/redvelvet-coklat.png` },
      { name: "Red Velvet Kacang Coklat", price: 16000, image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat.jpg` },
      { name: "Red Velvet Kacang Coklat Keju", price: 21000, image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat-keju.jpg` },
      { name: "Red Velvet Keju", price: 20000, highlight: true, image: `${ASSET_BASE_URL}/sweet/redvelvet-keju.jpg` },
      { name: "Red Velvet Keju + Coklat", price: 21000, highlight: true, image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-coklat.png` },
      { name: "Red Velvet Keju + Kacang", price: 21000, highlight: true, image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-kacang.png` },
    ],
  },
  {
    category: "Terang Bulan Blackforest",
    items: [
      { name: "Blackforest Kacang", price: 25000, image: `${ASSET_BASE_URL}/sweet/blackforest-kacang.jpg` },
      { name: "Blackforest Coklat", price: 25000, image: `${ASSET_BASE_URL}/sweet/blackforest-coklat.jpg` },
      { name: "Blackforest Kacang Coklat", price: 26000, image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat.jpg` },
      { name: "Blackforest Kacang Coklat Keju", price: 29000, image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat-keju.jpg` },
      { name: "Blackforest Keju", price: 27000, highlight: true, isBestSeller: true, image: `${ASSET_BASE_URL}/sweet/blackforest-keju.jpg` },
      { name: "Blackforest Keju Kacang", price: 28000, highlight: true, image: `${ASSET_BASE_URL}/sweet/blackforest-keju-kacang.jpg` },
      { name: "Blackforest Keju Coklat", price: 28000, highlight: true, image: `${ASSET_BASE_URL}/sweet/blackforest-keju-coklat.jpg` },
    ],
  },
];

export const MENU_SAVORY = [
  {
    title: "Daging Sapi",
    variants: [
      {
        type: "Telor Ayam",
        prices: [
          { qty: 2, price: 25000, isBestSeller: true, highlight: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 3, price: 34000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 4, price: 42000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 5, price: 45000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
      {
        type: "Telor Bebek",
        prices: [
          { qty: 2, price: 26000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 3, price: 35000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 4, price: 44000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 5, price: 50000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
    ],
  },
  {
    title: "Daging Ayam",
    variants: [
      {
        type: "Telor Ayam",
        prices: [
          { qty: 2, price: 22000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 3, price: 30000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 4, price: 35000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 5, price: 40000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
      {
        type: "Telor Bebek",
        prices: [
          { qty: 2, price: 24000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 3, price: 32000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 4, price: 40000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 5, price: 45000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
    ],
  },
  {
    title: "Menu Pedas",
    variants: [
      {
        type: "Samyang Ayam Pedas",
        prices: [
          { qty: 2, price: 30000, desc: "2 Telor Bebek + Daging Ayam", image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
      {
        type: "Samyang Sapi Pedas",
        prices: [
          { qty: 2, price: 32000, desc: "2 Telor Bebek + Daging Sapi", isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
    ],
  },
];

export const ADDONS_SWEET: Addon[] = [
  { name: 'Tambah Coklat', price: 3000 },
  { name: 'Tambah Kacang', price: 2000 },
  { name: 'Tambah Keju', price: 7000 },
  { name: 'Tambah Milo', price: 5000 },
];

export const ADDONS_SAVORY: Addon[] = [
  { name: 'Tambah Sosis', price: 2000, minQty: 1, maxQty: 20, defaultQty: 3 },
  { name: 'Tambah Kornet', price: 13000, disabled: true },
  { name: 'Tambah Jamur', price: 10000, disabled: true },
  { name: 'Tambah Acar', price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: 'Tambah Irisan Cabe', price: 400, minQty: 1, maxQty: 20, defaultQty: 5 },
  { name: 'Tambah Saus', price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: 'Tambah Sambal Pedas', price: 5000, minQty: 1, maxQty: 20, defaultQty: 1 },
];

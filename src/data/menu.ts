import { formatPrice } from "../hooks/useCart";
import type { Addon } from "../hooks/useCart";

export const MENU_SWEET = [
  {
    category: "Terang Bulan Standard",
    items: [
      { name: "Kacang", price: 12000 },
      { name: "Coklat", price: 12000 },
      { name: "Kacang + Coklat", price: 14000 },
      { name: "Kacang + Coklat + Keju", price: 19000 },
      { name: "Keju", price: 17000, highlight: true },
      { name: "Keju + Kacang", price: 18000, highlight: true },
      { name: "Keju + Coklat", price: 18000, highlight: true },
    ],
  },
  {
    category: "Terang Bulan Pandan",
    items: [
      { name: "Pandan Kacang", price: 13000 },
      { name: "Pandan Coklat", price: 13000 },
      { name: "Pandan Kacang + Coklat", price: 15000 },
      { name: "Pandan Kacang + Coklat + Keju", price: 21000 },
      { name: "Pandan Keju", price: 20000, highlight: true },
      { name: "Pandan Coklat Keju", price: 20000, highlight: true },
      { name: "Pandan Kacang + Keju", price: 20000, highlight: true },
    ],
  },
  {
    category: "Terang Bulan Red Velvet",
    items: [
      { name: "Red Velvet Kacang", price: 14000 },
      { name: "Red Velvet Coklat", price: 14000 },
      { name: "Red Velvet Kacang Coklat", price: 16000 },
      { name: "Red Velvet Kacang Coklat Keju", price: 21000 },
      { name: "Red Velvet Keju", price: 20000, highlight: true },
      { name: "Red Velvet Keju + Coklat", price: 21000, highlight: true },
      { name: "Red Velvet Keju + Kacang", price: 21000, highlight: true },
    ],
  },
  {
    category: "Terang Bulan Blackforest",
    items: [
      { name: "Blackforest Kacang", price: 25000 },
      { name: "Blackforest Coklat", price: 25000 },
      { name: "Blackforest Kacang Coklat", price: 26000 },
      { name: "Blackforest Kacang Coklat Keju", price: 29000 },
      { name: "Blackforest Keju", price: 27000, highlight: true },
      { name: "Blackforest Keju Kacang", price: 28000, highlight: true },
      { name: "Blackforest Keju Coklat", price: 28000, highlight: true },
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
          { qty: 2, price: 25000 },
          { qty: 3, price: 34000 },
          { qty: 4, price: 42000 },
          { qty: 5, price: 45000 },
        ],
      },
      {
        type: "Telor Bebek",
        prices: [
          { qty: 2, price: 26000 },
          { qty: 3, price: 35000 },
          { qty: 4, price: 44000 },
          { qty: 5, price: 50000 },
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
          { qty: 2, price: 22000 },
          { qty: 3, price: 30000 },
          { qty: 4, price: 35000 },
          { qty: 5, price: 40000 },
        ],
      },
      {
        type: "Telor Bebek",
        prices: [
          { qty: 2, price: 24000 },
          { qty: 3, price: 32000 },
          { qty: 4, price: 40000 },
          { qty: 5, price: 45000 },
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
          { qty: 2, price: 30000, desc: "2 Telor Bebek + Daging Ayam" },
        ],
      },
      {
        type: "Samyang Sapi Pedas",
        prices: [
          { qty: 2, price: 32000, desc: "2 Telor Bebek + Daging Sapi" },
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

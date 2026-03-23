import { formatPrice } from "../hooks/useCart";
import type { Addon } from "../hooks/useCart";

const ASSET_BASE_URL = "/images"; // "https://raw.githubusercontent.com/username/martabak-gresik-assets/main/images";

export const MENU_SWEET = [
  {
    category: "Terang Bulan Standard",
    items: [
      { name: "Kacang", price: 12000, description: "Perpaduan klasik kacang tanah sangrai yang gurih dan manis.", image: `${ASSET_BASE_URL}/sweet/kacang.jpg` },
      { name: "Coklat", price: 12000, description: "Coklat butiran premium yang meleleh sempurna di setiap gigitan.", image: `${ASSET_BASE_URL}/sweet/coklat.jpg` },
      { name: "Kacang + Coklat", price: 14000, description: "Kombinasi legendaris kacang gurih dan coklat manis yang melimpah.", image: `${ASSET_BASE_URL}/sweet/kacang-coklat.jpg` },
      { name: "Kacang + Coklat + Keju", price: 19000, isBestSeller: true, description: "Trio maut! Kacang, coklat, dan keju dalam satu balutan adonan lembut.", image: `${ASSET_BASE_URL}/sweet/kacang-coklat-keju.jpg` },
      { name: "Keju", price: 17000, isBestSeller: true, highlight: true, description: "Keju cheddar pilihan yang melimpah, lumer, dan super gurih.", image: `${ASSET_BASE_URL}/sweet/keju.jpg` },
      { name: "Keju + Kacang", price: 18000, highlight: true, description: "Gurihnya keju berpadu dengan renyahnya kacang tanah pilihan.", image: `${ASSET_BASE_URL}/sweet/keju-kacang.jpg` },
      { name: "Keju + Coklat", price: 18000, highlight: true, description: "Harmoni sempurna antara manisnya coklat dan gurihnya keju premium.", image: `${ASSET_BASE_URL}/sweet/keju-coklat.jpg` },
    ],
  },
  {
    category: "Terang Bulan Pandan",
    items: [
      { name: "Pandan Kacang", price: 13000, description: "Adonan aroma pandan asli yang wangi dengan topping kacang gurih.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang.jpg` },
      { name: "Pandan Coklat", price: 13000, description: "Aroma pandan yang khas berpadu dengan coklat butiran yang manis.", image: `${ASSET_BASE_URL}/sweet/pandan-coklat.jpg` },
      { name: "Pandan Kacang + Coklat", price: 15000, description: "Wangi pandan, renyah kacang, dan manis coklat dalam satu gigitan.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat.png` },
      { name: "Pandan Kacang + Coklat + Keju", price: 21000, description: "Paket lengkap pandan dengan perpaduan topping premium favorit.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat-keju.jpg` },
      { name: "Pandan Keju", price: 20000, highlight: true, isBestSeller: true, description: "Favorit pelanggan! Wangi pandan alami dengan keju melimpah.", image: `${ASSET_BASE_URL}/sweet/pandan-keju.jpg` },
      { name: "Pandan Coklat Keju", price: 20000, highlight: true, description: "Coklat dan keju melimpah di atas adonan pandan hijau yang lembut.", image: `${ASSET_BASE_URL}/sweet/pandan-coklat-keju.jpg` },
      { name: "Pandan Kacang + Keju", price: 20000, highlight: true, description: "Kacang renyah dan keju gurih dengan aroma pandan yang menggoda.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang-keju.jpg` },
    ],
  },
  {
    category: "Terang Bulan Red Velvet",
    items: [
      { name: "Red Velvet Kacang", price: 14000, description: "Adonan coklat merah yang mewah dengan taburan kacang sangrai.", image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang.png` },
      { name: "Red Velvet Coklat", price: 14000, description: "Manisnya coklat berpadu dengan adonan Red Velvet yang lembut.", image: `${ASSET_BASE_URL}/sweet/redvelvet-coklat.png` },
      { name: "Red Velvet Kacang Coklat", price: 16000, description: "Klasik kacang coklat kini hadir dengan gaya Red Velvet yang elegan.", image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat.jpg` },
      { name: "Red Velvet Kacang Coklat Keju", price: 21000, description: "Kombinasi topping paling lengkap khusus untuk pecinta Red Velvet.", image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat-keju.jpg` },
      { name: "Red Velvet Keju", price: 20000, highlight: true, description: "Kontras warna merah yang cantik dengan gurihnya keju melimpah.", image: `${ASSET_BASE_URL}/sweet/redvelvet-keju.jpg` },
      { name: "Red Velvet Keju + Coklat", price: 21000, highlight: true, description: "Adonan mewah Red Velvet dengan topping favorit keju dan coklat.", image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-coklat.png` },
      { name: "Red Velvet Keju + Kacang", price: 21000, highlight: true, description: "Perpaduan tekstur kacang renyah dan lembutnya keju Red Velvet.", image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-kacang.png` },
    ],
  },
  {
    category: "Terang Bulan Blackforest",
    items: [
      { name: "Blackforest Kacang", price: 25000, description: "Adonan coklat pekat yang rich dengan taburan kacang renyah.", image: `${ASSET_BASE_URL}/sweet/blackforest-kacang.jpg` },
      { name: "Blackforest Coklat", price: 25000, description: "Double chocolate! Adonan coklat dengan limpahan coklat butiran.", image: `${ASSET_BASE_URL}/sweet/blackforest-coklat.jpg` },
      { name: "Blackforest Kacang Coklat", price: 26000, description: "Sensasi coklat hitam yang mewah dengan duo kacang dan coklat.", image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat.jpg` },
      { name: "Blackforest Kacang Coklat Keju", price: 29000, description: "Varian premium terlengkap dengan adonan coklat Blackforest.", image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat-keju.jpg` },
      { name: "Blackforest Keju", price: 27000, highlight: true, isBestSeller: true, description: "Hitam manis berpadu dengan putih gurihnya keju cheddar pilihan.", image: `${ASSET_BASE_URL}/sweet/blackforest-keju.jpg` },
      { name: "Blackforest Keju Kacang", price: 28000, highlight: true, description: "Coklat rich, keju gurih, dan kacang renyah dalam satu perpaduan.", image: `${ASSET_BASE_URL}/sweet/blackforest-keju-kacang.jpg` },
      { name: "Blackforest Keju Coklat", price: 28000, highlight: true, description: "Kenikmatan maksimal bagi pecinta coklat tingkat tinggi.", image: `${ASSET_BASE_URL}/sweet/blackforest-keju-coklat.jpg` },
    ],
  },
];

export const MENU_SAVORY = [
  {
    title: "Daging Sapi",
    variants: [
      {
        type: "Telor Ayam",
        description: "Martabak telor klasik dengan isian daging sapi bumbu rempah dan telor ayam segar.",
        prices: [
          { qty: 2, price: 25000, isBestSeller: true, highlight: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 3, price: 34000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 4, price: 42000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 5, price: 45000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
      {
        type: "Telor Bebek",
        description: "Rasa lebih gurih dan mantap dengan isian daging sapi dan telor bebek pilihan.",
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
        description: "Martabak isian daging ayam cincang yang empuk, dibalut telor ayam berkualitas.",
        prices: [
          { qty: 2, price: 22000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 3, price: 30000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 4, price: 35000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
          { qty: 5, price: 40000, image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
      {
        type: "Telor Bebek",
        description: "Martabak telor bebek dengan isian daging ayam istimewa yang gurih maksimal.",
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
        description: "Paduan unik Martabak Telor dengan Mie Samyang pedas dan daging ayam pilihan.",
        prices: [
          { qty: 2, price: 30000, desc: "2 Telor Bebek + Daging Ayam", image: `${ASSET_BASE_URL}/savory/martabak.png` },
        ],
      },
      {
        type: "Samyang Sapi Pedas",
        description: "Sensasi pedas Samyang berpadu dengan daging sapi gurih dalam satu kulit martabak renyah.",
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

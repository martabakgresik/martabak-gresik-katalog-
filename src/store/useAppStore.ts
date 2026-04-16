import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  STORE_NAME, 
  STORE_ADDRESS, 
  STORE_PHONE, 
  OPEN_HOUR, 
  CLOSE_HOUR, 
  PROMO_CODE, 
  PROMO_PERCENT, 
  SHIPPING_RATE_PER_KM, 
  MAX_SHIPPING_DISTANCE,
  HOLIDAYS
} from '../data/config';
import { UI_COPY } from '../data/i18n/appCopy';

export type UiLang = "id" | "en";

const detectBrowserLanguage = (): UiLang => {
  if (typeof navigator === "undefined") return "id";
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "id";
};

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  openHour: number;
  closeHour: number;
  activePromoCode: string;
  activePromoPercent: number;
  shippingRate: number;
  maxDistance: number;
  holidays: string[];
  isEmergencyClosed: boolean;
  promoStartAt: string | null;
  promoEndAt: string | null;
}

interface MenuState {
  menuSweet: any[];
  menuSavory: any[];
}

interface UIState {
  isDarkMode: boolean;
  activeTab: 'cart' | 'favorites';
  showPromo: boolean;
  isCheckoutPhase: boolean;
  currentView: 'catalog' | 'blog' | 'about' | 'faq' | 'terms' | 'privacy' | 'deletion' | 'app-download' | 'cart';
  isOpen: boolean;
  isHoliday: boolean;
  showBackToTop: boolean;
  showCookieConsent: boolean;
  uiLang: UiLang;
  searchQuery: string;
  isSearchOpen: boolean;
  isGeneralShareOpen: boolean;
  isOrderConfirmationOpen: boolean;
  isMapOpen: boolean;
  shareItem: { name: string; price: number; category?: string } | null;
  zoomedImage: { src: string; alt: string } | null;
  copied: boolean;
}

interface CheckoutState {
  customerName: string;
  customerAddress: string;
  deliveryMethod: 'delivery' | 'pickup';
  distance: number;
  coordinates: { lat: number, lng: number } | null;
  addressNotes: string;
  promoCodeInput: string;
  promoMessage: { status: 'success' | 'error', text: string } | null;
  isAiProcessing: boolean;
  isLocationConfirmed: boolean;
}

interface AppState {
  // Store Settings
  storeSettings: StoreSettings;
  setStoreSettings: (settings: Partial<StoreSettings>) => void;

  // Menu Data
  menuState: MenuState;
  setMenuState: (state: Partial<MenuState>) => void;

  // UI State
  uiState: UIState;
  setUiState: (state: Partial<UIState>) => void;
  toggleDarkMode: () => void;
  toggleCartOpen: () => void;
  setCurrentView: (view: UIState['currentView']) => void;
  setUiLang: (lang: UiLang) => void;
  setSearchQuery: (query: string) => void;
  t: any; // Type-safe translation object

  // Checkout State
  checkoutState: CheckoutState;
  setCheckoutState: (state: Partial<CheckoutState>) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        storeSettings: {
          storeName: STORE_NAME,
          storeAddress: STORE_ADDRESS,
          storePhone: STORE_PHONE,
          openHour: OPEN_HOUR,
          closeHour: CLOSE_HOUR,
          activePromoCode: PROMO_CODE,
          activePromoPercent: PROMO_PERCENT,
          shippingRate: SHIPPING_RATE_PER_KM,
          maxDistance: MAX_SHIPPING_DISTANCE,
          holidays: [...HOLIDAYS],
          isEmergencyClosed: false,
          promoStartAt: null,
          promoEndAt: null,
        },
        
        setStoreSettings: (settings) =>
          set((state) => ({
            storeSettings: { ...state.storeSettings, ...settings },
          })),

        menuState: {
          menuSweet: [],
          menuSavory: [],
        },

        setMenuState: (state) =>
          set((menuState) => ({
            menuState: { ...menuState.menuState, ...state },
          })),

        uiState: {
          isDarkMode: false,
          activeTab: 'cart' as const,
          showPromo: true,
          isCheckoutPhase: false,
          currentView: 'catalog' as const,
          isOpen: false,
          isHoliday: false,
          showBackToTop: false,
          showCookieConsent: false,
          uiLang: detectBrowserLanguage(),
          searchQuery: "",
          isSearchOpen: false,
          isGeneralShareOpen: false,
          isOrderConfirmationOpen: false,
          isMapOpen: false,
          shareItem: null,
          zoomedImage: null,
          copied: false,
        },

        checkoutState: {
          customerName: "",
          customerAddress: "",
          deliveryMethod: 'delivery',
          distance: 0,
          coordinates: null,
          addressNotes: "",
          promoCodeInput: "",
          promoMessage: null,
          isAiProcessing: false,
          isLocationConfirmed: false,
        },

        setCheckoutState: (state) =>
          set((current) => ({
            checkoutState: { ...current.checkoutState, ...state }
          })),

        get t() {
          return UI_COPY[get().uiState.uiLang];
        },

        setUiState: (state) =>
          set((current) => ({
            uiState: { ...current.uiState, ...state },
          })),

        toggleDarkMode: () =>
          set((state) => ({
            uiState: { ...state.uiState, isDarkMode: !state.uiState.isDarkMode },
          })),

        setCurrentView: (view) =>
          set((state) => ({
            uiState: { ...state.uiState, currentView: view },
          })),

        setUiLang: (lang) => {
          set((state) => ({
            uiState: { ...state.uiState, uiLang: lang }
          }));
          document.documentElement.lang = lang;
        },

        setSearchQuery: (query) =>
          set((state) => ({
            uiState: { ...state.uiState, searchQuery: query }
          })),
      }),
      {
        name: 'martabak-app-store',
        partialize: (state) => ({
          uiState: {
            isDarkMode: state.uiState.isDarkMode,
            uiLang: state.uiState.uiLang,
          },
          checkoutState: {
            customerName: state.checkoutState.customerName,
            customerAddress: state.checkoutState.customerAddress,
            addressNotes: state.checkoutState.addressNotes,
            coordinates: state.checkoutState.coordinates,
            distance: state.checkoutState.distance,
            isLocationConfirmed: state.checkoutState.isLocationConfirmed,
          }
        }),
      }
    )
  )
);

/** 
 * Hook helper untuk menghitung status promo & toko secara reaktif
 */
export const useStoreComputed = () => {
  const { uiState, storeSettings } = useAppStore();
  const { isHoliday, isOpen } = uiState;
  const { promoStartAt, promoEndAt, isEmergencyClosed } = storeSettings;

  const isPromoScheduledActive = (() => {
    if (isHoliday || isEmergencyClosed) return false;
    if (!promoStartAt && !promoEndAt) return true;
    const now = new Date();
    const start = promoStartAt ? new Date(promoStartAt) : null;
    const end = promoEndAt ? new Date(promoEndAt) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  })();

  return { isPromoScheduledActive };
};

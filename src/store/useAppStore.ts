import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
  dbLoading: boolean;
}

interface UIState {
  isDarkMode: boolean;
  isCartOpen: boolean;
  activeTab: 'cart' | 'favorites';
  showPromo: boolean;
  isCheckoutPhase: boolean;
  currentView: 'catalog' | 'blog' | 'dashboard' | 'lab';
  isOpen: boolean;
  isHoliday: boolean;
  showBackToTop: boolean;
  showCookieConsent: boolean;
  showAdminLogin: boolean;
  isAdminAuthenticated: boolean;
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
  setCurrentView: (view: 'catalog' | 'blog' | 'dashboard') => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        storeSettings: {
          storeName: 'Martabak Gresik',
          storeAddress: 'Jl. Usman Sadar No 10, Gresik',
          storePhone: '081330763633',
          openHour: 10,
          closeHour: 22,
          activePromoCode: 'MARTABAKBARU',
          activePromoPercent: 10,
          shippingRate: 2000,
          maxDistance: 10,
          holidays: [],
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
          dbLoading: true,
        },

        setMenuState: (state) =>
          set((menuState) => ({
            menuState: { ...menuState.menuState, ...state },
          })),

        uiState: {
          isDarkMode: false,
          isCartOpen: false,
          activeTab: 'cart' as const,
          showPromo: true,
          isCheckoutPhase: false,
          currentView: 'catalog' as const,
          isOpen: false,
          isHoliday: false,
          showBackToTop: false,
          showCookieConsent: false,
          showAdminLogin: false,
          isAdminAuthenticated: false,
        },

        setUiState: (state) =>
          set((current) => ({
            uiState: { ...current.uiState, ...state },
          })),

        toggleDarkMode: () =>
          set((state) => ({
            uiState: { ...state.uiState, isDarkMode: !state.uiState.isDarkMode },
          })),

        toggleCartOpen: () =>
          set((state) => ({
            uiState: { ...state.uiState, isCartOpen: !state.uiState.isCartOpen },
          })),

        setCurrentView: (view) =>
          set((state) => ({
            uiState: { ...state.uiState, currentView: view },
          })),
      }),
      {
        name: 'martabak-app-store',
        partialize: (state) => ({
          uiState: {
            isDarkMode: state.uiState.isDarkMode,
          },
        }),
      }
    )
  )
);

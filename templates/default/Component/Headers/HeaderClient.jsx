"use client";
import CustomNextImage from "@/GlobalComponents/Shared/Common/CustomNextImage";
import HeaderFunctions from "@/GlobalComponents/Hooks/useHeaders/useHeaderFunctions";
import { resolveStoreLogo, getDefaultStoreLogo } from "@/utilities/mediaResolver";
import { isValue } from "@/utilities/helper";
import Link from "next/link";
import SignInModal from "../SignIn/Index";
import ForgotPasswordModal from "../ForgotPassword/Index";
import SignUpModal from "../SignUp/Index";
import LanguageList from "@/GlobalComponents/Hooks/useLanguageList";
import MyProfileDropdown from "@/GlobalComponents/Hooks/useUser/useMyProfileDropdown";
import MyAccount from "@/GlobalComponents/Hooks/useUser/useMyAccount";
import ChangePasswordModal from "../ChangePassword/Index";
import MobileViewMenu from "@/GlobalComponents/Hooks/useMobileViewMenu";
import UseProductSearchFun from "@/GlobalComponents/Hooks/useProduct/useProductSearch";
import URLTokenLogin from "../URLTokenLogin";
import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import SearchProductsDropdown from "@/GlobalComponents/Reused/SearchProductsDropdown";
import { useGlobalProvider } from "@/GlobalComponents/Shared/Common";
import TopCategory from "@/GlobalComponents/Features/TopCategories";
import CommonButton from "@/GlobalComponents/Reused/CommonButton";
import HoverTooltip from "@/GlobalComponents/Shared/Common/HoverTooltip";
import IconButton from "@/GlobalComponents/Reused/IconButton";
import CheckoutHeader from "@/GlobalComponents/Core/Checkout/CheckoutComponent/CheckoutHeader";
import { wishiListApiCount, wishiListTotalCountApi } from "@/api/cartApi";
import { getClientAuthToken, getValidAuthToken } from "@/utilities/tokenHelper";
const HeaderClient = ({
  storeSettings,
  token,
  allProductsList,
  languageList,
}) => {
  const {
    pathname,
    searchParamToken,
    menuOpen,
    t,
    setMenuOpen,
    isQuickOrderModal,
    setIsQuickOrderModal,
    isSigninModal,
    setIsSigninModal,
    isSignupModal,
    setIsSignupModal,
    isChangePasswordModal,
    setIsChangePasswordModal,
    isForgotPasswordModal,
    setIsForgotPasswordModal,
    isMyAccountModal,
    setIsMyAccountModal,
    UpdatedToken,
    setIsChangePasswordModalFunc,
    setIsChangeForgotPasswordModalFunc,
    customerProfile,
    isCustomerProfileLoading,
    handleCustomerLogout,
    customerProfileApi,
    isProductSearchModal,
    setIsProductSearchModal,
  } = HeaderFunctions({
    token,
    storeSettings,
  });

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [clientToken, setClientToken] = useState("");

  const readClientToken = useCallback(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = getClientAuthToken();
      const valid = getValidAuthToken(raw);
      if (!valid && raw) {
        try {
          [
            "BearerToken",
            "token",
            "medusa_auth_token",
            "opencart_auth_token",
            "customer_auth_token",
            "spurt_token",
            "woocommerce_auth_token",
            "customerProfile",
            "customerUser",
            "customer_avatar",
            "customer_avatar_path",
          ].forEach((k) => localStorage.removeItem(k));
        } catch (_) {}
      }
      return valid || "";
    } catch (_) {
      return "";
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setClientToken(readClientToken());

    const handleSync = () => {
      setClientToken(readClientToken());
    };
    const handleLogout = () => {
      setClientToken("");
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("user_logged_out", handleLogout);
    window.addEventListener("customer_logged_out", handleLogout);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("user_logged_out", handleLogout);
      window.removeEventListener("customer_logged_out", handleLogout);
    };
  }, [readClientToken]);

  useEffect(() => {
    if (UpdatedToken !== undefined) {
      if (!UpdatedToken) {
        setClientToken("");
      } else {
        setClientToken(getValidAuthToken(UpdatedToken));
      }
    }
  }, [UpdatedToken]);

  const activeToken = mounted
    ? getValidAuthToken(
        UpdatedToken !== "" && UpdatedToken !== null && UpdatedToken !== undefined
          ? UpdatedToken
          : clientToken
      )
    : getValidAuthToken(token || "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_required") === "1" && !activeToken) {
      setIsSigninModal(true);
      if (window.history?.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete("auth_required");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  }, [activeToken, setIsSigninModal]);
  const dispatch = useDispatch();

  const fetchedWishlistTokenRef = useRef(null);

  useEffect(() => {
    if (activeToken) {
      if (fetchedWishlistTokenRef.current === activeToken) return;
      fetchedWishlistTokenRef.current = activeToken;
      wishiListTotalCountApi(() => { }, dispatch);
    } else {
      fetchedWishlistTokenRef.current = null;
      if (typeof window !== "undefined" && !clientToken) {
        localStorage.removeItem("medusa_wishlist_ids");
        localStorage.removeItem("wishlist_product_ids");
        window.dispatchEvent(new Event("medusa_wishlist_updated"));
      }
    }
  }, [activeToken, clientToken, dispatch]);

  const selectedLanguageReduxState = useSelector(
    (state) => state.storeReducer.selectedLanguageRedux,
  );
  const ArabicLang = selectedLanguageReduxState === "Arabic";

  const display = {
    products: true,
  }; // To diplay which part of quick order

  const handleRouteToProductDetail = (product) => {
    router?.push(`/products/${product?.productSlug}`);
    setIsProductSearchModal(false);
  };
  const { Permission } = useGlobalProvider();

  const wishCount = useSelector((state) => state.storeReducer.wishCount);
  const CartData = useSelector((state) => state.storeReducer.cardpopCount);

  // Unified icon config for wishlist, cart, quotation, shopping list
  const headerIcons = [
    {
      id: "wishlist",
      icon: "/img/heART.svg",
      alt: "heart",
      label: t("wishList"),
      href: activeToken ? "/settings/wishlist" : undefined,
      onClick: (e) => {
        if (!activeToken) {
          e?.preventDefault?.();
          e?.stopPropagation?.();
          setIsSigninModal(true);
        }
      },
      count: activeToken ? wishCount : 0,
      show: true,
    },
    {
      id: "cart",
      icon: "/img/cartlist.svg",
      alt: "cartlist",
      label: t("cart"),
      href: "/cart",
      count: CartData?.length || 0,
      show: true,
    },
  ].filter((item) => item.show);

  const directPathname = usePathname();
  const activePath = pathname || directPathname || "";

  const isCheckoutStepperRoute = [
    "/checkout",
    "/cart",
    "/choose-address",
    "/payment",
    "/stock-checkout",
  ].some((r) => activePath === r || activePath.startsWith(`${r}/`));

  if (pathname?.startsWith("/manage")) {
    return null;
  }

  return (
    <>
      {/* updated */}
      <section className="sticky top-0 z-50 bg-[var(--color-white)]">
        <header className="border-b border-[var(--color-e5e7eb)] bg-[var(--color-white)]">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-[16px] px-[16px] py-[12px] md:px-[20px]">
            {/* Logo + Tagline */}
            <div className="flex items-center space-x-[16px] md:space-x-[20px]">
              <CommonButton
                variant="ghost"
                size="icon"
                className="flex md:hidden"
                onClick={() => setMenuOpen(true)}
              >
                <img src="/img/burger-menu.svg" alt="burgerMenu" />
              </CommonButton>

              <Link href="/" className="flex items-center">
                <img
                  src="/img/spurt-logo.svg"
                  alt={storeSettings?.[0]?.storeName ?? "Spurtcommerce"}
                  className="max-h-[52px] max-w-[150px] object-contain"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/img/spurt-logo.svg";
                  }}
                />
              </Link>
            </div>

            {/* products search bar */}
            <div className="mx-auto w-full max-w-[600px] max-md:hidden [&>div>div]:mb-0">
              <SearchProductsDropdown
                display={display}
                handleClickedProduct={handleRouteToProductDetail}
              />
            </div>

            <div className="flex items-center space-x-[16px] md:space-x-[20px]">
              {/* language select box */}
              <LanguageList languageList={languageList} />

              <div className="flex flex-1 items-center justify-between gap-0">
                {headerIcons.map((item) => (
                  <HoverTooltip key={item.id} label={item.label} color={item.color}>
                    <IconButton
                      variant="ghost"
                      size="xl"
                      color="var(--color)"
                      ariaLabel={item.alt}
                      className="group/favourite"
                      href={item.href}
                      onClick={item.onClick}
                      icon={
                        <>
                          <img src={item.icon} alt={item.alt} width={18} height={18} />
                          {typeof item.count === "number" && item.count > 0 &&
                            (item.countLoading ? null : (
                              <span className={`absolute top-0 right-1 flex h-4 ${item.count > 9 ? "w-6" : "w-4"} p-1 text-[8px] items-center justify-center rounded-md bg-[var(--color-red-500)] p-0 text-[10px] font-normal text-[var(--color-white)] outline outline-1 outline-[var(--color-white)] group-hover/favourite:outline-[var(--color-e8e8e8)]`}>
                                {item.count}
                              </span>
                            ))}
                        </>
                      }
                    />
                  </HoverTooltip>
                ))}
              </div>

              {/* Login and My Profile */}

              {activeToken ? (
                // My Profile
                <MyProfileDropdown
                  from={"Header"}
                  customerProfile={customerProfile}
                  customerProfileApi={customerProfileApi}
                  setIsMyAccountModal={setIsMyAccountModal}
                  handleCustomerLogout={handleCustomerLogout}
                  setIsChangePasswordModalFunc={setIsChangePasswordModalFunc}
                />
              ) : (
                // Login Icon
                <span
                  onClick={() => setIsSigninModal(true)}
                  className="block cursor-pointer"
                >
                  <img src="/img/user.svg" alt="User" />
                </span>
              )}

            </div>

            <SignInModal
              isSigninModal={isSigninModal}
              setIsSigninModal={setIsSigninModal}
              setIsSignupModal={setIsSignupModal}
              setIsChangeForgotPasswordModalFunc={
                setIsChangeForgotPasswordModalFunc
              }
              token={activeToken}
              storeSettings={storeSettings}
              logo={
                <img
                  src="/img/spurt-logo.svg"
                  alt="Spurtcommerce"
                  className="h-12 max-w-[200px] object-contain"
                />
              }
            />
            <SignUpModal
              isSignupModal={isSignupModal}
              setIsSignupModal={setIsSignupModal}
              setIsSigninModal={setIsSigninModal}
              setIsChangeForgotPasswordModalFunc={
                setIsChangeForgotPasswordModalFunc
              }
              token={activeToken}
              storeSettings={storeSettings}
              logo={
                <img
                  src="/img/spurt-logo.svg"
                  alt="Spurtcommerce"
                  className="h-12 max-w-[200px] object-contain"
                />
              }
            />
            <ForgotPasswordModal
              isForgotPasswordModal={isForgotPasswordModal}
              setIsForgotPasswordModal={setIsForgotPasswordModal}
              setIsSigninModal={setIsSigninModal}
              logo={
                <img
                  src="/img/spurt-logo.svg"
                  alt="Spurtcommerce"
                  className="h-12 max-w-[200px] object-contain"
                />
              }
            />
            <ChangePasswordModal
              isChangePasswordModal={isChangePasswordModal}
              setIsChangePasswordModal={setIsChangePasswordModal}
              setIsMyAccountModal={setIsMyAccountModal}
              logo={
                <img
                  src="/img/spurt-logo.svg"
                  alt="Spurtcommerce"
                  className="h-12 max-w-[200px] object-contain"
                />
              }
            />
            <MobileViewMenu
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              languageList={languageList}
            />
            <UseProductSearchFun
              isProductSearchModal={isProductSearchModal}
              setIsProductSearchModal={setIsProductSearchModal}
            />
            {searchParamToken && (
              <URLTokenLogin
                searchParamToken={searchParamToken}
                token={activeToken}
              />
            )}
          </div>
        </header>

        <TopCategory />
      </section>
      {isCheckoutStepperRoute && (
        <CheckoutHeader storeSettings={storeSettings} stepperOnly />
      )}
    </>
  );
};

export default HeaderClient;

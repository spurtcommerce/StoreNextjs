"use client";
import CustomNextImage from "@/GlobalComponents/useCustomNextImage";
import HeaderFunctions from "@/GlobalComponents/useHeaders/useHeaderFunctions";
import { resolveStoreLogo, getDefaultStoreLogo } from "@/utilities/mediaResolver";
import { isValue } from "@/utilities/helper";
import Link from "next/link";
import SignInModal from "../SignIn/Index";
import ForgotPasswordModal from "../ForgotPassword/Index";
import SignUpModal from "../SignUp/Index";
import LanguageList from "@/GlobalComponents/useLanguageList";
import MyProfileDropdown from "@/GlobalComponents/useMyProfileDropdown";
import MyAccount from "@/GlobalComponents/useMyAccount";
import ChangePasswordModal from "../ChangePassword/Index";
import MobileViewMenu from "@/GlobalComponents/useMobileViewMenu";
import UseProductSearchFun from "@/GlobalComponents/useProductSearchFunc";
import URLTokenLogin from "../URLTokenLogin";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import SearchProductsDropdown from "@/GlobalComponents/Reused/SearchProductsDropdown";
import { useAddons } from "@/GlobalComponents/useCommon/AddonProvider";
import TopCategory from "@/GlobalComponents/TopCategories";
import CommonButton from "@/GlobalComponents/Reused/CommonButton";
import HoverTooltip from "@/GlobalComponents/useCommon/HoverTooltip";
import IconButton from "@/GlobalComponents/Reused/IconButton";
import CheckoutHeader from "@/GlobalComponents/Checkout/CheckoutHeader";
import ThemeToggle from "@/GlobalComponents/ThemeToggle";
import { wishiListApiCount } from "@/api/cartApi";
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
  const activeToken = token || UpdatedToken;
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeToken) {
      wishiListApiCount(() => {}, dispatch);
    }
  }, [activeToken, dispatch]);

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
  const { Permission, addons } = useAddons();

  const wishCount = useSelector((state) => state.storeReducer.wishCount);
  const CartData = useSelector((state) => state.storeReducer.cardpopCount);

  // Unified icon config for wishlist, cart, quotation, shopping list
  const headerIcons = [
    {
      id: "wishlist",
      icon: "/img/heART.svg",
      alt: "heart",
      label: t("wishList"),
      href: activeToken ? "/settings/wishlist" : "/",
      onClick: !activeToken ? () => setIsSigninModal(true) : undefined,
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

  if (["/checkout", "/cart", "/choose-address", "/payment", "/stock-checkout"].includes(pathname)) {
    return <CheckoutHeader storeSettings={storeSettings} />;
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
                  src={resolveStoreLogo(storeSettings) || getDefaultStoreLogo()}
                  alt={storeSettings?.[0]?.storeName ?? "Logo"}
                  className="max-h-[52px] max-w-[150px] object-contain"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = getDefaultStoreLogo();
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

              {/* Dark / Light theme toggle */}
              <ThemeToggle className="hover:bg-black/5 dark:hover:bg-white/10" />

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
            />
                        <ForgotPasswordModal
              isForgotPasswordModal={isForgotPasswordModal}
              setIsForgotPasswordModal={setIsForgotPasswordModal}
              setIsSigninModal={setIsSigninModal}
            />
                        <ChangePasswordModal
              isChangePasswordModal={isChangePasswordModal}
              setIsChangePasswordModal={setIsChangePasswordModal}
              setIsMyAccountModal={setIsMyAccountModal}
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
    </>
  );
};

export default HeaderClient;

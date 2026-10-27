"use client";
import useSigninModalFunc from "@/GlobalComponents/useSigninModalFunc";
import React, { Fragment } from "react";
import dynamic from "next/dynamic";

const loadHeadlessui = (ui) =>
  dynamic(() => import("@headlessui/react").then((mod) => mod[ui]));

const Dialog = loadHeadlessui("Dialog");
const DialogPanel = loadHeadlessui("DialogPanel");
const DialogTitle = loadHeadlessui("DialogTitle");
const Transition = loadHeadlessui("Transition");
const TransitionChild = loadHeadlessui("TransitionChild");

import FormInput from "@/GlobalComponents/FormInput";
import { getDefaultStoreLogo } from "@/utilities/mediaResolver";
import ButtonSpinnerLoader from "@/GlobalComponents/useCommon/ButtonSpinnerLoader";
import CommonButton from "@/GlobalComponents/Reused/CommonButton";
import CommonLink from "@/GlobalComponents/Reused/CommonLink";

const SignInModal = ({
  isSigninModal,
  setIsSigninModal,
  setIsSignupModal,
  setIsChangeForgotPasswordModalFunc,
  token,
  storeSettings,
}) => {
  const {
    value,
    setValue,
    handleInputChange,
    handleInputBlur,
    handleInputKeyUp,
    handleSubmit,
    isSubmitLoading,
    errorType,
    t,
    ArabicLang,
    Logosrc,
    handleCloseSigninModal,
    addons,
  } = useSigninModalFunc({
    isSigninModal,
    setIsSigninModal,
    setIsSignupModal,
    setIsChangeForgotPasswordModalFunc,
    storeSettings,
  });
  

  return (
    <Transition show={isSigninModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { }}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[var(--color-black)]/50" />
        </TransitionChild>

        {/* Offcanvas Panel */}
        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transform transition duration-300"
            enterFrom={ArabicLang ? "translate-x-0" : "translate-x-full"}
            enterTo="translate-x-0"
            leave="transform transition duration-200"
            leaveFrom="translate-x-0"
            leaveTo={ArabicLang ? "-translate-x-full" : "translate-x-full"}
          >
            <DialogPanel className="flex h-full w-full max-w-md flex-col rounded-[8px_0_0_8px] bg-[var(--color-white)]">
              <div className="border-b border-solid border-[var(--color-e9e9e9)] p-[16px_24px] max-md:p-4">
                <DialogTitle className="flex items-center text-[20px] leading-[27px] font-semibold text-[var(--color-161d25)]">
                  {t("title")}
                  <span
                    className="ms-auto cursor-pointer"
                    onClick={handleCloseSigninModal}
                  >
                    {" "}
                    <img src="/img/close.svg" alt="close" />{" "}
                  </span>
                </DialogTitle>
              </div>
              <div className="w-full max-w-md grow transform overflow-auto rounded-xl p-[40px_24px] text-center align-middle shadow-xl transition-all max-md:p-4">
                <div className="mb-6 flex justify-center">
                  <img
                    src={Logosrc || getDefaultStoreLogo()}
                    alt="Logo"
                    className="h-12 max-w-[200px] object-contain"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = getDefaultStoreLogo();
                    }}
                  />
                </div>

                {/* Heading  */}
                <div>
                  <h2 className="text-[1.5rem] font-bold text-[var(--color-171d26)]">
                    {t("title")}
                  </h2>
                  {/* <p className="text-[0.875rem] text-[var(--color-171d26)] mt-2">
                    Lorem ipsum dolor sit amet, consectetur sadipscing
                  </p> */}
                </div>

                <form className="my-10">
                  {/* Email Input  */}
                  <FormInput
                    name={"email"}
                    type={"email"}
                    placeholder={t("emailPlaceholder")}
                    autoComplete={"email"}
                    inputMode={"email"}
                    value={value?.email}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyUp={handleInputKeyUp}
                    className={`mb-6 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none`}
                    errorType={errorType?.email}
                    errorMessages={{
                      1: t("emailRequired"),
                      2: t("emailInvalid"),
                      3: t("emailNotRegistered"),
                    }}
                    allowSpace={false}
                  />

                  {/* Password input */}
                  <FormInput
                    name={"password"}
                    type={"password"}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    value={value?.password}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyUp={handleInputKeyUp}
                    className={`mb-6 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none`}
                    errorType={errorType?.password}
                    errorMessages={{
                      1: t("passwordRequired"),
                      2: t("passwordIncorrect"),
                    }}
                    allowSpace={false}
                  />
                  <div className="mb-6 flex justify-end">
                    <CommonLink
                      href="#"
                      underline={true}
                      onClick={() => setIsChangeForgotPasswordModalFunc()}
                      className="text-sm font-normal"
                    >
                      {t("forgotPasswordLabel")}
                    </CommonLink>
                  </div>

                  <CommonButton
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitLoading}
                  >
                    {isSubmitLoading ? (
                      ""
                    ) : (
                      <>{t("continueButton")}</>
                    )}
                  </CommonButton>
                </form>

                {/* Footer */}
                {/* Signup button */}
                <p className="mt-6 text-sm text-[var(--color-gray-500)]">
                  {t("dontHaveAccount")}{" "}
                  <CommonLink
                    href="#"
                    underline={true}
                    onClick={() => {
                      setIsSignupModal(true);
                      handleCloseSigninModal();
                    }}
                    className="text-sm"
                  >
                    {t("signUpLinkText")}
                  </CommonLink>
                </p>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition >
  );
};

export default SignInModal;

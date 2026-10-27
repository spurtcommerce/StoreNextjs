"use client";
import useSignupModalFunc from "@/GlobalComponents/useSignupModalFunc";
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
const SignUpModal = ({
  isSignupModal,
  setIsSigninModal,
  setIsSignupModal,
  setIsChangeForgotPasswordModalFunc,
  token,
  storeSettings,
}) => {
  const {
    value,
    errorType,
    isOtpSent,
    isStandardAuth,
    handleInputChange,
    handleInputBlur,
    handleInputKeyUp,
    handleEmailBlur,
    handleEmailKeyUp,
    handleSendOtp,
    handleSubmit,
    isSendOtpLoading,
    isSubmitLoading,
    handleCloseSignupModal,
    t,
    ArabicLang,
    Logosrc,
  } = useSignupModalFunc({
    isSignupModal,
    setIsSigninModal,
    setIsSignupModal,
    setIsChangeForgotPasswordModalFunc,
    storeSettings,
  });
  return (
    <>
      <Transition show={isSignupModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
                    {/* {t("title")} */}
                    {t("signupNoGap")}
                    <span
                      className="ms-auto cursor-pointer"
                      onClick={handleCloseSignupModal}
                    >
                      {" "}
                      <img src="/img/close.svg" alt="close" />{" "}
                    </span>
                  </DialogTitle>
                </div>
                {/* p-[40px_24px] */}
                <div className="w-full max-w-md grow transform overflow-auto rounded-xl p-[24px_24px] text-center align-middle shadow-xl transition-all max-md:p-4">
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
                  {/* <div>
                  <h2 className="text-[1.5rem] text-[var(--color-171d26)] font-bold">
                    {t("title")}
                    Signup
                  </h2>
                  <p className="text-[0.875rem] text-[var(--color-171d26)] mt-2">
                    Lorem ipsum dolor sit amet, consectetur sadipscing
                  </p>
                </div> */}

                  {/* className="my-10" */}
                  <form className="my-8">
                    {isStandardAuth ? (
                      <FormInput
                        name={"email"}
                        type={"email"}
                        placeholder={t("emailPlaceholder")}
                        autoComplete={"email"}
                        inputMode={"email"}
                        value={value?.email}
                        onChange={handleInputChange}
                        onBlur={handleEmailBlur}
                        onKeyUp={handleEmailKeyUp}
                        className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none ${
                          errorType?.email != 0 ? "mb-6!" : ""
                        }`}
                        errorType={errorType?.email}
                        errorMessages={{
                          1: t("emailRequired"),
                          2: t("emailInvalid"),
                          3: t("emailNotRegistered"),
                        }}
                        allowSpace={false}
                      />
                    ) : (
                      <div className="grid grid-cols-[1fr_96px] gap-2">
                        {/* Email Input  */}
                        <FormInput
                          name={"email"}
                          type={"email"}
                          placeholder={t("emailPlaceholder")}
                          autoComplete={"email"}
                          inputMode={"email"}
                          value={value?.email}
                          onChange={handleInputChange}
                          onBlur={handleEmailBlur}
                          onKeyUp={handleEmailKeyUp}
                          className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none ${
                            errorType?.email != 0 ? "mb-6!" : ""
                          }`}
                          errorType={errorType?.email}
                          errorMessages={{
                            1: t("emailRequired"),
                            2: t("emailInvalid"),
                            3: t("emailNotRegistered"),
                          }}
                          allowSpace={false}
                        />

                        {/* Send OTP Button */}
                        <CommonButton
                          onClick={handleSendOtp}
                          disabled={isSendOtpLoading}
                          variant="primary"
                          size="lg"
                          loading={isSendOtpLoading}
                          className="h-[46px] w-full"
                        >
                          {isSendOtpLoading ? (
                            <ButtonSpinnerLoader />
                          ) : isOtpSent ? (
                            <>{t("resendOtp")}</>
                          ) : (
                            <>{t("sendOtp")}</>
                          )}
                        </CommonButton>
                      </div>
                    )}

                    {/* OTP Input */}
                    {!isStandardAuth && (
                      <FormInput
                        name={"otp"}
                        type={"text"}
                        placeholder={"OTP"}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={value?.otp}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyUp={handleInputKeyUp}
                        className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none ${
                          errorType?.otp != 0 ? "mb-6!" : ""
                        }`}
                        errorType={errorType?.otp}
                        errorMessages={{
                          1: <>{t("otpRequired")}</>,
                          2: <>{t("otpLengthError")}</>,
                          3: <>{t("otpInvalid")}</>,
                        }}
                        allowSpace={false}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {/* First Name Input */}
                      <FormInput
                        name={"firstName"}
                        type={"text"}
                        placeholder={t("firstNamePlaceholder")}
                        autoComplete="given-name"
                        maxLength={32}
                        value={value?.firstName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyUp={handleInputKeyUp}
                        className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none ${
                          errorType?.firstName != 0 ? "mb-6!" : ""
                        }`}
                        errorType={errorType?.firstName}
                        errorMessages={{
                          1: <>{t("firstNameRequired")}</>,
                        }}
                      />

                      {/* Last Name Input */}
                      <FormInput
                        name={"lastName"}
                        type={"text"}
                        placeholder={t("LastNamePlaceholder")}
                        autoComplete="family-name"
                        maxLength={32}
                        value={value?.lastName}
                        onChange={handleInputChange}
                        onKeyUp={handleInputKeyUp}
                        className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none`}
                      />
                    </div>

                    {/* Company Name input */}
                    {!isStandardAuth && (
                      <FormInput
                        name={"companyName"}
                        type={"text"}
                        placeholder={t("CompanyNamePlaceholder")}
                        autoComplete="organization"
                        maxLength={100}
                        value={value?.companyName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyUp={handleInputKeyUp}
                        className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none ${
                          errorType?.companyName != 0 ? "mb-6!" : ""
                        }`}
                        errorType={errorType?.companyName}
                        errorMessages={{
                          1: <>{t("companyNameRequired")}</>,
                        }}
                      />
                    )}

                    {/* Tax Number input */}
                    {!isStandardAuth && (
                      <FormInput
                        name={"taxNumber"}
                        type={"text"}
                        placeholder={t("TaxNumberPlaceholder")}
                        value={value?.taxNumber}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyUp={handleInputKeyUp}
                        className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none`}
                      />
                    )}

                    {/* Password input */}
                    <FormInput
                      name={"password"}
                      type={"password"}
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="new-password"
                      maxLength={128}
                      value={value?.password}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyUp={handleInputKeyUp}
                      className={`mb-4 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none ${
                        errorType?.password == 2
                          ? "mb-10!"
                          : errorType?.password != 0
                            ? "mb-6!"
                            : ""
                      }`}
                      errorType={errorType?.password}
                      errorMessages={{
                        1: t("passwordRequired"),
                        2: t("passwordRequirements"),
                      }}
                    />

                    {/* Continue/Submit button */}
                    <CommonButton
                      onClick={handleSubmit}
                      disabled={isSubmitLoading}
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitLoading}
                      className="mt-2 h-[46px]"
                    >
                      {isSubmitLoading ? (
                        <ButtonSpinnerLoader />
                      ) : (
                        <>{t("continueButton")}</>
                      )}
                    </CommonButton>
                  </form>

                  {/* Footer  */}
                  {/* Signup button */}
                  <p className="mt-6 text-sm text-[var(--color-gray-500)]">
                    {t("alreadyAccount")}{" "}
                    <CommonLink
                      href="#"
                      underline={true}
                      onClick={() => {
                        handleCloseSignupModal();
                        setIsSigninModal(true);
                      }}
                      className="text-sm"
                    >
                      {t("signIn")}
                    </CommonLink>
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default SignUpModal;

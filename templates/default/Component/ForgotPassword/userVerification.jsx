"use client";
import React, { useEffect, useState, Suspense } from "react";
import ButtonSpinnerLoader from "@/GlobalComponents/useCommon/ButtonSpinnerLoader";
import FormInput from "@/GlobalComponents/FormInput";
import useAccountVerificationFunc from "@/GlobalComponents/useForgotPasswordFunc/useAccountVerificationFunc/Index";
import { getDefaultStoreLogo } from "@/utilities/mediaResolver";

function PageLoader() {
  return (
    <>
      <div className="flex justify-center items-center min-h-[calc(100vh-9.6rem)] bg-[var(--color-gray-100)] overflow-hidden">
        <a
          className="block w-full max-w-sm p-4 bg-[var(--color-white)] rounded-2xl shadow-sm animate-pulse"
          id="card-link"
          target="_blank"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gray-300)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--color-gray-300)] rounded w-3/4" />
              <div className="h-4 bg-[var(--color-gray-300)] rounded w-1/2" />
            </div>
          </div>

          {/* Body */}
          <div className="mb-4">
            <div className="h-3 bg-[var(--color-gray-300)] rounded mb-2 w-full" />
            <div className="h-3 bg-[var(--color-gray-300)] rounded w-5/6" />
          </div>

          {/* Image */}
          <div className="w-full h-40 bg-[var(--color-gray-300)] rounded-xl mb-4" />

          {/* Footer */}
          <div className="h-3 bg-[var(--color-gray-300)] rounded w-1/3" />
        </a>
      </div>
    </>
  );
}

function PageContent() {
  const {
    value,
    handleInputChange,
    handleInputBlur,
    handleInputKeyUp,
    handleSubmit,
    errorType,
    isSubmitLoading,
    loader,
    showPasswordChangeForm,
    errorMessages,
    showsuccessMessage,
    countdown,
    Logosrc,
    ArabicLang,
    t,
  } = useAccountVerificationFunc({});

  return (
    <>
       {loader ? (
        <PageLoader />
      ) : (
        <div className="flex justify-center items-center min-h-[calc(100vh-9.6rem)]  overflow-hidden">
          <div className="overflow-auto grow max-md:p-4 text-center shadow-xl p-[40px_24px] rounded-xl w-full max-w-md align-middle transition-all transform">
            <div className="flex justify-center mb-6">
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

            <div className={`${errorMessages ? "hidden" : ""}`}>
              <h2 className="text-[1.5rem] text-[var(--color-171d26)] font-bold">
                {t("createNewPassword")}
              </h2>
            </div>

            <form
              className={`my-10 ${
                showPasswordChangeForm && !showsuccessMessage ? "" : "hidden"
              }`}
            >
              <label className="text-[14px] leading-4.75 text-[var(--color-171d26)] font-normal mb-1.25 flex items-center gap-1.25">
                {t("newPasswordLabel")}
              </label>
              <FormInput
                name="password"
                type="password"
                placeholder={t("newPasswordPlaceholder")}
                value={value.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyUp={handleInputKeyUp}
                className="w-full h-11.5 border border-[var(--color-gray-300)] rounded-[5px] px-2 focus:outline-none focus:ring-0 focus:border-[var(--color-gray-300)] text-sm mb-6"
                errorType={errorType.password}
                errorMessages={{
                  1: t("newPasswordRequiredError"),
                  2: t("passwordLengthError"),
                  3: t("passwordUppercaseError"),
                  4: t("passwordLowercaseError"),
                  5: t("passwordNumberError"),
                  6: t("passwordSpecialcharError"),
                  7: t("passwordSameError"),
                }}
                allowSpace={false}
              />

              <label className="text-[14px] leading-4.75 text-[var(--color-171d26)] font-normal mb-1.25 flex items-center gap-1.25">
                {t("confirmNewPassword")}
              </label>
              <FormInput
                name="confirmpassword"
                type="password"
                placeholder={t("confirmPasswordLabel")}
                value={value.confirmpassword}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyUp={handleInputKeyUp}
                className="w-full h-11.5 border border-[var(--color-gray-300)] rounded-[5px] px-2 focus:outline-none focus:ring-0 focus:border-[var(--color-gray-300)] text-sm mb-6"
                errorType={errorType.confirmpassword}
                errorMessages={{
                  1: t("confirmPasswordPlaceholder"),
                  2: t("passwordMismatchError"),
                }}
                allowSpace={false}
              />

              <button
                onClick={handleSubmit}
                className={`w-full h-11.5 bg-[var(--btn-bg,var(--color-primary))] text-[var(--btn-text,var(--color-primary-foreground))] text-sm rounded-[5px] focus:outline-none`}
                style={{ fontFamily: "var(--btn-font-family, var(--font-sans, 'Noto Sans', sans-serif))", cursor: isSubmitLoading ? "default" : "pointer" }}
              >
                {isSubmitLoading ? (
                  <ButtonSpinnerLoader />
                ) : (
                  <>{t("submitButton")}</>
                )}
              </button>
            </form>
            <h2
              className={`text-[var(--color-171d26)] text-[1rem]  mt-4 capitalize ${
                showPasswordChangeForm ? "hidden" : ""
              }`}
            >
              {errorMessages}
            </h2>

            <div
              className={`text-[var(--color-171d26)] text-[1rem] mt-4 capitalize transition-all duration-500 ${
                showsuccessMessage ? "" : "hidden"
              }`}
            >
              {t("passwordChangeSuccess")}
              {showsuccessMessage && (
                <p className="text-[var(--color-47c11c)] text-sm mt-2">
                  {t("redirectingMessage")} {countdown}{" "}
                  {countdown <= 1 ? t("secondLabel") : t("secondsLabel")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UserVerification() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PageContent />
    </Suspense>
  );
}

export default UserVerification;

"use client";
import useChangePasswordFunc from "@/GlobalComponents/useChangePasswordFunc";
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

const ChangePasswordModal = ({
  isChangePasswordModal,
  setIsChangePasswordModal,
  setIsMyAccountModal,
}) => {
  const {
    value,
    errorType,
    isSubmitLoading,
    ArabicLang,
    t,
    Logosrc,
    handleInputChange,
    handleInputBlur,
    handleInputKeyUp,
    handleSubmit,
    handleCloseChangePasswordModal,
  } = useChangePasswordFunc({
    isChangePasswordModal,
    setIsChangePasswordModal,
    setIsMyAccountModal,
  });

  return (
    <>
      <Transition show={isChangePasswordModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
                    <div className="flex items-center gap-3">
                      <span
                        className="ms-auto cursor-pointer"
                        onClick={() => {
                          (handleCloseChangePasswordModal(),
                            setIsMyAccountModal(true));
                        }}
                      >
                        <img src="/img/back-arrow.svg" alt="backarrow" />
                      </span>
                      <div className="flex items-center gap-2">
                        {t("changePasswordTitle")}
                      </div>
                    </div>
                    <span
                      className="ms-auto cursor-pointer"
                      onClick={handleCloseChangePasswordModal}
                    >
                      <img src="/img/close.svg" alt="close" />
                    </span>
                  </DialogTitle>
                </div>

                <div className="w-full max-w-md grow transform overflow-auto rounded-xl p-[40px_24px] text-center align-middle shadow-xl transition-all max-md:p-4">
                  <div className="mb-6 flex justify-center">
                    <img
                      src={Logosrc || getDefaultStoreLogo()}
                      alt="Logo"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = getDefaultStoreLogo();
                      }}
                      className="h-12 max-w-[200px] object-contain"
                    />
                  </div>

                  <div>
                    <h2 className="text-[1.5rem] font-bold text-[var(--color-171d26)]">
                      {t("changePasswordTitle")}
                    </h2>
                  </div>

                  <form className="my-10">
                    <label className="mb-[5px] flex items-center gap-[5px] text-[14px] leading-[19px] font-normal text-[var(--color-171d26)]">
                      {t("oldPasswordLabel")}
                    </label>
                    <FormInput
                      name="oldpassword"
                      type="password"
                      placeholder={t("oldPasswordPlaceholder")}
                      value={value.oldpassword}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyUp={handleInputKeyUp}
                      className="mb-6 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none"
                      errorType={errorType.oldpassword}
                      errorMessages={{
                        1: t("oldPasswordRequiredError"),
                        2: t("oldPasswordIncorrectError"),
                      }}
                      allowSpace={false}
                    />

                    <label className="mb-[5px] flex items-center gap-[5px] text-[14px] leading-[19px] font-normal text-[var(--color-171d26)]">
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
                      className="mb-6 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none"
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

                    <label className="mb-[5px] flex items-center gap-[5px] text-[14px] leading-[19px] font-normal text-[var(--color-171d26)]">
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
                      className="mb-6 h-[46px] w-full rounded-[5px] border border-[var(--color-gray-300)] px-2 text-sm focus:border-[var(--color-gray-300)] focus:ring-0 focus:outline-none"
                      errorType={errorType.confirmpassword}
                      errorMessages={{
                        1: t("confirmPasswordPlaceholder"),
                        2: t("passwordMismatchError"),
                      }}
                      allowSpace={false}
                    />

                    <button
                      onClick={handleSubmit}
                      className={`h-[46px] w-full rounded-[5px] bg-[var(--btn-bg,var(--color-primary))] text-sm text-[var(--btn-text,var(--color-primary-foreground))] focus:outline-none`}
                      style={{ fontFamily: "var(--btn-font-family, var(--font-sans, 'Noto Sans', sans-serif))", cursor: isSubmitLoading ? "default" : "pointer" }}
                    >
                      {isSubmitLoading ? (
                        <ButtonSpinnerLoader />
                      ) : (
                        <>{t("changePasswordTitle")}</>
                      )}
                    </button>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ChangePasswordModal;

"use client";
import useForgotPasswordFunc from '@/GlobalComponents/useForgotPasswordFunc/Index';
import React, { Fragment } from 'react';
import dynamic from 'next/dynamic';

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

const ForgotPasswordModal = ({
  isForgotPasswordModal,
  setIsForgotPasswordModal,
  setIsSigninModal,
}) => {
  const {
    value,
    setValue,
    t,
    ArabicLang,
    Logosrc,
    handleInputChange,
    handleInputBlur,
    handleInputKeyUp,
    handleSubmit,
    isSubmitLoading,
    errorType,
    suscessMessageType,
    successMessage,
    setSuccessMessage,
    handleCloseForgotPasswordModal,
  } = useForgotPasswordFunc({
    isForgotPasswordModal,
    setIsForgotPasswordModal,
    setIsSigninModal,
  });

  return (
     <Transition show={isForgotPasswordModal} as={Fragment}>
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
            <DialogPanel className="max-w-md rounded-[8px_0_0_8px] w-full h-full bg-[var(--color-white)] flex flex-col">
              <div className="p-[16px_24px] border-b border-solid border-[var(--color-e9e9e9)] max-md:p-4">
                <DialogTitle className="text-[20px] leading-[27px] text-[var(--color-161d25)] font-semibold flex items-center">
                  <div className="flex items-center gap-3">
                    <span
                      className="cursor-pointer ms-auto"
                      onClick={() => {
                        handleCloseForgotPasswordModal(),
                          setIsSigninModal(true);
                      }}
                    >
                      <img src="/img/back-arrow.svg" alt="backarrow" />
                    </span>
                    <div className="flex items-center gap-2">
                      {t("forgotPasswordTitle")}
                    </div>
                  </div>
                  <span
                    className="cursor-pointer ms-auto"
                    onClick={() => handleCloseForgotPasswordModal()}
                  >
                    <img src="/img/close.svg" alt="close" />
                  </span>
                </DialogTitle>
              </div>

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

                <div>
                  <h2 className="text-[1.5rem] text-[var(--color-171d26)] font-bold">
                    {t("forgotPasswordTitle")}
                  </h2>
                  {!successMessage && (
                    <p className="text-sm text-[var(--color-6b7280)] mt-2">
                      {t("forgotPasswordInstruction")}
                    </p>
                  )}
                </div>

                {successMessage ? (
                  <p className="font-normal text-[var(--color-47c11c)] text-sm my-10">
                    {t("passwordResetMessage")}
                  </p>
                ) : (
                  <form className="my-10">
                    <label className="text-[14px] leading-[19px] text-[var(--color-171d26)] font-normal mb-[5px] flex items-center gap-[5px]">
                      {t("registeredEmailLabel")}
                    </label>
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
                      className={`w-full h-[46px] border border-[var(--color-gray-300)] rounded-[5px] px-2 focus:outline-none focus:ring-0 focus:border-[var(--color-gray-300)] text-sm mb-6`}
                      errorType={errorType?.email}
                      errorMessages={{
                        1: t("emailRequired"),
                        2: t("emailInvalid"),
                        3: t("emailNotRegistered"),
                      }}
                      suscessMessageType={suscessMessageType?.email}
                      successMessage={{
                        1: t("passwordResetMessage"),
                      }}
                      allowSpace={false}
                    />
                    <button
                      onClick={handleSubmit}
                      className={`w-full h-[46px] bg-[var(--btn-bg,var(--color-primary))] text-[var(--btn-text,var(--color-primary-foreground))] text-sm rounded-[5px] focus:outline-none`}
                      style={{ fontFamily: "var(--btn-font-family, var(--font-sans, 'Noto Sans', sans-serif))", cursor: isSubmitLoading ? "default" : "pointer" }}
                    >
                      {isSubmitLoading ? (
                        <ButtonSpinnerLoader />
                      ) : (
                        <>{t("submitButton")}</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};


export default ForgotPasswordModal;

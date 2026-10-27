const SettingsSkeleton = () => {   

  return (
    <section className="mx-auto min-h-[calc(100vh-105px)] w-full max-w-360 p-4 md:p-[24px_20px]">
      <h1 className="font-inter mb-4 h-6 w-32 animate-pulse rounded bg-[var(--color-e2e8f0)] text-[18px] leading-5.25 font-semibold text-[var(--color-161d25)]"></h1>

      <div className="grid grid-cols-1 gap-4 min-[1920px]:grid-cols-[repeat(auto-fit,minmax(430px,1fr))] sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-full animate-pulse items-start gap-4 rounded-[5px] border border-solid border-[var(--color-e9e9e9)] bg-[var(--color-white)] p-4 shadow-[0px_1px_2px_#00000015]"
          >
            <div className="h-10 w-10 min-w-10 rounded-[5px] bg-[var(--color-cbd5e1)]"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[var(--color-cbd5e1)]"></div>
              <div className="h-3 w-full rounded bg-[var(--color-e2e8f0)]"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SettingsSkeleton;

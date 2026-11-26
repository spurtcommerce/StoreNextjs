import { getHeaderData } from '@/GlobalComponents/Hooks/useHeaders/useHeaderDataServer';
import dynamic from 'next/dynamic';

const HeaderClient = dynamic(() => import('./HeaderClient'), { ssr: true })

const Header = async ({ storeSettings, token: propToken }) => {
  const { token: fetchedToken, allProductsList, languageList } = await getHeaderData(storeSettings);
  const token = propToken || fetchedToken;

  return (
    <HeaderClient
      storeSettings={storeSettings}
      token={token}
      allProductsList={allProductsList}
      languageList={languageList}
    />
  );
};

export default Header;

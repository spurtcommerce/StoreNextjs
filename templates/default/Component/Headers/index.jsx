import { getHeaderData } from '@/GlobalComponents/useHeaders/useHeaderDataServer';
import dynamic from 'next/dynamic';

const HeaderClient = dynamic(()=>import('./HeaderClient'), {ssr:true}) 

const Header = async ({ storeSettings }) => {
  const { token, allProductsList,languageList } = await getHeaderData(storeSettings);
  
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

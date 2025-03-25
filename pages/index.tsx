'use client';
import React, { useState, useEffect } from 'react';
import RightComp from '@/components/RightComp/RightComp';
import { UiLayout } from '@/components/UiLayout/UiLayout';
import { NftRegisterContext } from '@/contexts/solana/NftRegisterProvider';

const FormLayout = () => {
  const { isRegistered } = React.useContext(NftRegisterContext);
  const [clientRendered, setClientRendered] = useState(false);
  const [tempIsRegistered, setTempIsRegistered] = useState(isRegistered);

  useEffect(() => {
    setClientRendered(true);
    setTempIsRegistered(isRegistered); // Update after client render
  }, [isRegistered]);

  if (!clientRendered) {
    return null; // Prevent server-side render from being displayed
  }

  return (
    <div className="overflow-hidden z-10 min-w-full min-h-screen relative bg-[#000] after:content-[''] after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-[#0000003A] after:absolute flex flex-col items-center justify-center h-full w-full text-white ">
      <UiLayout>
        <div className='flex items-center flex-col w-full min-h-screen gap-8 px-2 md:px-8 z-10 relative'>
          <div className='z-10 mt-10 md:mt-16 gap-6 px-2 py-2 w-full md:max-w-[1200px] relative'>
            <RightComp />
          </div>
        </div>
      </UiLayout>
    </div>
  )
}

export default FormLayout
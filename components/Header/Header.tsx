import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogPanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { WalletButton } from '../solana/solana-provider'
import { isAdminWallet } from '../utils/isAdminWallet'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const wallet = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const connection = useConnection();

  useEffect(() => {
    const asynFunc = async () => {
      const walletAddy = wallet?.publicKey?.toString();
      console.log(wallet?.publicKey?.toString(), "wallet?.publicKey?.toString()");
      const adminWalletAddy = await isAdminWallet(walletAddy);
      if (adminWalletAddy) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    if (wallet && wallet.publicKey) {
      asynFunc();
    }
  }, [wallet, connection])

  return (

    <header className="backdrop-blur-md bg-[#000] z-30 border-b border-[#444] text-[#aaa]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-2 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Meta Tune Club</span>
            <img className="h-16 w-auto" src="/header_logo.png" alt="" />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#aaa]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 text-[#ddd]">

          {/* <a href="/" className="text-sm font-semibold leading-6">
            Create Raffle
          </a> */}

          {/* <a href="/" target='_blank' className="text-sm font-semibold leading-6">
            Supervise Raffles
          </a> */}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <WalletButton />
        </div>
      </nav>
      <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto  px-6 py-6 sm:max-w-sm sm:ring-1 backdrop-blur-md sm:ring-[#cccccc33]">
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-[#aaa]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-[#f9f5ff] 0/10">
              <div className="space-y-2 py-6">
                {/* <a
                  href="/"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-[#888] leading-7  hover:bg-[#f9f5ff]"
                >
                  Raffle
                </a> */}
                {/* <a
                  href="/"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-[#888] leading-7  hover:bg-[#f9f5ff]"
                >
                  Supervise Raffles
                </a> */}
              </div>
              <div className="py-6">
                <WalletButton />
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}

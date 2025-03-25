import React, { useEffect, useRef, useState } from "react"
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { Snackbar } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { AlertState } from '@/components/utils/misc';
import { VscSymbolNamespace } from "react-icons/vsc";
import { GoNumber } from "react-icons/go";
import { RiNftFill } from "react-icons/ri";
import { FcCalendar, FcTwoSmartphones, FcViewDetails } from "react-icons/fc";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LiaDoorOpenSolid } from "react-icons/lia";
import { GiTrophyCup } from "react-icons/gi";
import { FaRegImage } from "react-icons/fa6";
import { isAdminWallet } from "../utils/isAdminWallet";


type ValuePiece = Date | null;

type Value = ValuePiece;

interface entryFeeType {
  sol: number,
  usdc: number,
  sshib: number,
  puff: number
}

interface prizeType {
  sol?: number,
  usdc?: number,
  sshib?: number,
  puff?: number,
  physicalProduct?: string
}

export default function RightComp() {
  const wallet = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const connection = useConnection();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });
  const [raffleName, setRaffleName] = useState("");
  const [valueTo, onChangeTo] = useState<Value>(new Date());
  const [ticketSupply, setTicketSupply] = useState(1);
  const [entrySol, setEntrySol] = useState(0);
  const [entryUSDC, setEntryUSDC] = useState(0);
  const [entryPuff, setEntryPuff] = useState(0);
  const [entrySshib, setEntrySshib] = useState(0);

  const [prizeSol, setPrizeSol] = useState(0);
  const [prizeUSDC, setPrizeUSDC] = useState(0);
  const [prizePuff, setPrizePuff] = useState(0);
  const [prizeSshib, setPrizeSshib] = useState(0);
  const [prizePhysicProduct, setPrizePhysicProduct] = useState("");

  const [logoImage, setLogoImage] = useState('');

  const [nfts, setNfts] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzYzVjYjdlMi1lYTA5LTQyZjEtYjVhMC01YTRjYWUzZmE2OGUiLCJlbWFpbCI6InB1ZmZkb2djb2luQG91dGxvb2suY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImM5Y2U4YTIwNDAzNzhlYjliMDA3Iiwic2NvcGVkS2V5U2VjcmV0IjoiZGE4OWJmM2YxMjFiMDlhNGRlODI3ZWU3YWVjZTkwZDRmOGY1MjQ4OTM0ODY2NzVkYzZiYjEyZWU0NjUyMmI4MSIsImV4cCI6MTc3MjAwMTc4M30.bo6EMavK7oe742v_6PpGdpQKjb5SuRuj7OEAja3XRdI"

  // Image Display 
  const handleBig = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = Object.values(files).map((file) => URL.createObjectURL(file));
      setLogoImage(imageUrls[0]);
    }
  };

  //Upload Image
  async function pinFileToIPFS(blob) {
    try {
      const data = new FormData();
      data.append("file", blob);
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: data,
        });
      const resData = await res.json();
      return resData;
    } catch (error) {
      console.log(error);
    }
  };

  const uploadBlobToPinata = async (blob: Blob) => {
    const imageFile = new File([blob], 'image.png', { type: 'image/png' });
    const resData = await pinFileToIPFS(imageFile);
    return resData;
  }

  // Write Data on DB
  const writeData = async (
    raffleName: string,
    description: string,
    entry_fee: entryFeeType,
    prize: prizeType,
    end_time: Date,
    max_tickets: number,
    image: string,
    nfts?: string,
  ) => {
    try {
      console.log(image, "image");
      const responseImage = await fetch(image);
      const blobLogo = await responseImage.blob();
      const logoData = await uploadBlobToPinata(blobLogo);
      console.log(`https://gateway.pinata.cloud/ipfs/${logoData.IpfsHash}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createRaffle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raffleName: raffleName, description: description, entry_fee: entry_fee, prize: prize, end_time: end_time, max_tickets, nfts: nfts, image: `https://gateway.pinata.cloud/ipfs/${logoData.IpfsHash}`, purchasedTickets: 0 }),
      });

      const returnValue = await response.json();
      setIsLoading(false);
      setAlertState({
        open: true,
        message: 'Created!',
        severity: 'success',
      })
      // return returnValue;
    } catch (error) {
      setIsLoading(false);
      setAlertState({
        open: true,
        message: 'Failed',
        severity: 'error',
      })
      console.error('Error fetching the dbUrl:', error);
      return false;
    }
  };


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
    <>
      {!isAdmin ?
        <div className="`pt-10 pb-5 flex flex-col w-full px-1 gap-8">
          <div className="flex items-center gap-2 mb-3 mx-auto">
            <img
              src="/images/pdLogo.png"
              alt="logo"
              className="w-[25px] md:w-[40px]"
            />
            <p className="text-2xl md:text-4xl font-semibold ">Create Raffle</p>
          </div>
          <div className="text-3xl text-white mx-auto">
            This is not admin wallet
          </div>
        </div>
        :

        <div className={`pt-10 pb-5 flex flex-col w-full h-full px-1 gap-4 text-[white]`}>
          <div className="flex items-center gap-2 mb-3 mx-auto">
            <img
              src="/images/pdLogo.png"
              alt="logo"
              className="w-[25px] md:w-[40px]"
            />
            <p className="text-2xl md:text-4xl font-semibold ">Create Raffle</p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center  md:text-lg gap-1">
                <VscSymbolNamespace className="text-xl mb-1" />
                <p className="font-semibold ">Raffle Name</p>
              </div>
              <input
                className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                placeholder="Input Raffle Name"
                value={raffleName}
                onChange={(e) => setRaffleName(e.target.value)}
              />

              {/* NFT  */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center  md:text-lg gap-1">
                  <RiNftFill className="text-xl mb-1" />
                  <p className="font-semibold">NFT Entry(optional)</p>
                </div>
                <textarea
                  className="h-[110px] bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                  placeholder="Input NFT Collections, seperate them by comma"
                  value={nfts}
                  onChange={(e) => setNfts(e.target.value)}
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center  md:text-lg gap-1">
                  <FcCalendar className="mb-1" />
                  <p className="font-semibold ">End Time</p>
                </div>
                <DateTimePicker onChange={onChangeTo} value={valueTo} className="text-[white] font-semibold border border-[#aaaaaa55] p-2" minDate={new Date()} />
              </div>
            </div>

            {/* Image Upload  */}
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center  md:text-lg gap-1">
                <FaRegImage className="text-xl mb-1" />
                <p className="font-semibold">Raffle Image</p>
              </div>
              <div className={`w-[280px] h-[280px] flex items-center justify-center lg:w-[300px] lg:h-[300px] aspect-square duration-500 hover:bg-[#f5c835a5] border border-[#aaaaaa55] hover:border-[#f562353b] cursor-pointer relative p-[1px] mx-auto`}
                onClick={handleBig}
              >
                {
                  logoImage ? (
                    <img src={logoImage}
                      className={`text-2xl font-semibold py-1  text-[#f56235d2] text-white h-full rounded-xl`}
                    // onClick={handleBig}
                    />
                  ) : (
                    <div className="text-center font-semibold text-[white] relative text-lg"
                    // onClick={handleBig}
                    >Select Logo</div>
                  )
                }
                {/* <div className="w-full absolute h-full " ></div> */}
                <input type='file' accept='image/*' onChange={handleFileChange} className='opacity-0 z-30 min-h-full min-w-full cursor-pointer' style={{ display: 'none' }} ref={fileInputRef} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex flex-col gap-3 w-full">
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center  md:text-lg gap-1">
                  <GoNumber className="text-xl mb-1" />
                  <p className="font-semibold">Tickets Supply</p>
                </div>
                <input
                  type="number"
                  min={1}
                  onChange={(e) => setTicketSupply(parseInt(e.target.value))}
                  className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                  placeholder="How Many Tickets"
                />
              </div>
              {/* Entry Fee */}
              <div className="font-semibold">
                <div className="flex items-center  md:text-lg gap-1 mb-2">
                  <LiaDoorOpenSolid className="text-xl mb-1" />
                  <p className="font-semibold">Entry Fee</p>
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-[2px] md:gap-3 ">
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <SiSolana className="text-sm mb-1" />
                            <p className="font-semibold">SOL</p>
                        </div> */}
                    <input
                      type="number"
                      min={1}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="SOL"
                      // value={entrySol}
                      onChange={(e) => setEntrySol(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <IoLogoUsd className="text-lg mb-1" />
                            <p className="font-semibold">USDC</p>
                        </div> */}
                    <input
                      type="number"
                      min={1}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="USDC"
                      // value={entryUSDC}
                      onChange={(e) => setEntryUSDC(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <SiSolana className="text-sm mb-1" />
                            <p className="font-semibold">SSHIB</p>
                        </div> */}
                    <input
                      type="number"
                      min={1}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="SSHIB"
                      // value={entrySshib}
                      onChange={(e) => setEntrySshib(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <IoLogoUsd className="text-lg mb-1" />
                            <p className="font-semibold">PUFF</p>
                        </div> */}
                    <input
                      type="number"
                      min={1}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="PUFF"
                      // value={entryPuff}
                      onChange={(e) => setEntryPuff(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {/* Prize */}
              <div className="font-semibold">
                <div className="flex items-center  md:text-lg gap-1 mb-2">
                  <GiTrophyCup className="text-xl mb-1" />
                  <p className="font-semibold">Prize</p>
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-[2px] md:gap-3 ">
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <SiSolana className="text-sm mb-1" />
                            <p className="font-semibold">SOL</p>
                        </div> */}
                    <input
                      type="number"
                      min={0}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="SOL"
                      // value={prizeSol}
                      onChange={(e) => setPrizeSol(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <IoLogoUsd className="text-lg mb-1" />
                            <p className="font-semibold">USDC</p>
                        </div> */}
                    <input
                      type="number"
                      min={0}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="USDC"
                      // value={prizeUSDC}
                      onChange={(e) => setPrizeUSDC(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <SiSolana className="text-sm mb-1" />
                            <p className="font-semibold">SSHIB</p>
                        </div> */}
                    <input
                      type="number"
                      min={0}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="SSHIB"
                      // value={prizeSshib}
                      onChange={(e) => setPrizeSshib(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    {/* <div className="flex items-center  md:text-lg gap-1">
                            <IoLogoUsd className="text-lg mb-1" />
                            <p className="font-semibold">PUFF</p>
                        </div> */}
                    <input
                      type="number"
                      min={0}
                      className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold "
                      placeholder="PUFF"
                      // value={prizePuff}
                      onChange={(e) => setPrizePuff(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <input
                  className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold mt-[2px] md:mt-3 w-full"
                  placeholder="Physical Product"
                  value={prizePhysicProduct}
                  onChange={(e) => setPrizePhysicProduct(e.target.value)}
                />
              </div>
            </div>

          </div>

          <div className="w-full md:w-1/2 flex flex-col h-full mx-auto py-3">
            <div className="flex items-center  md:text-lg gap-1 mb-2">
              <FcViewDetails />
              <p className="font-semibold">General Notes</p>
            </div>
            <textarea
              className="bg-[#00000021] shadow-xl border border-[#aaaaaa55] p-2 text-[white] placeholder:text-[white] font-semibold h-[300px] md:h-full"
              placeholder="Write your description..."
              value={inputText}
              onChange={(e) => { setInputText(e.target.value) }}
            />
          </div>
          <button
            disabled={(isLoading || !(raffleName && valueTo && ticketSupply && entryUSDC && entrySol && entryPuff && entrySshib && (prizeSol || prizeUSDC || prizePuff || prizeSshib || prizePhysicProduct) && inputText && logoImage))}
            className={`${(isLoading || !(raffleName && valueTo && ticketSupply && entryUSDC && entrySol && entryPuff && entrySshib && (prizeSol || prizeUSDC || prizePuff || prizeSshib || prizePhysicProduct) && inputText && logoImage)) ? 'cursor-not-allowed text-[#aaaaaa55]' : 'hover:border-white cursor-pointer text-white'} border-[2px] border-[#aaaaaa55] duration-500 text-[#aaaaaa55] text-2xl font-semibold py-1 flex flex-row gap-3 w-[200px] mx-auto items-center justify-start pl-9 group shadow-[0px_5px_5px_0px] shadow-[#4154f166]`}
            onClick={() => {
              if (!inputText) {
                setAlertState({
                  open: true,
                  message: 'Text Required',
                  severity: 'error',
                })
                return;
              }
              setIsLoading(true);
              const image = logoImage;
              writeData(raffleName, inputText, { "sol": entrySol, "usdc": entryUSDC, "sshib": entrySshib, "puff": entryPuff }, { "sol": prizeSol, "usdc": prizeUSDC, "sshib": prizeSshib, "puff": prizePuff, "physicalProduct": prizePhysicProduct }, valueTo, ticketSupply, image, nfts)
            }}
          >
            {isLoading ? (
              <div
                className={`inline-block h-6 w-6 animate-spin text-[#943b3b] rounded-full border-4 border-solid border-[white] border-r-[transparent] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] `}
                role="status">
                <span
                  className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >Loading...</span>
              </div>
            ) :
              <div className="flex flex-row gap-2 items-center justify-start">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.44141 0.527344C7.99369 0.527344 8.44141 0.975059 8.44141 1.52734V6.52734H13.4414C13.9937 6.52734 14.4414 6.97506 14.4414 7.52734C14.4414 8.07963 13.9937 8.52734 13.4414 8.52734H8.44141V13.5273C8.44141 14.0796 7.99369 14.5273 7.44141 14.5273C6.88912 14.5273 6.44141 14.0796 6.44141 13.5273V8.52734H1.44141C0.889121 8.52734 0.441406 8.07963 0.441406 7.52734C0.441406 6.97506 0.889122 6.52734 1.44141 6.52734L6.44141 6.52734V1.52734C6.44141 0.975059 6.88912 0.527344 7.44141 0.527344Z" fill={`${(isLoading || !(raffleName && valueTo && ticketSupply && entryUSDC && entrySol && entryPuff && entrySshib && (prizeSol || prizeUSDC || prizePuff || prizeSshib || prizePhysicProduct) && inputText && logoImage)) ? '#aaaaaa55' : 'white'}`} />
                </svg>
                <p className={`${(isLoading || !(raffleName && valueTo && ticketSupply && entryUSDC && entrySol && entryPuff && entrySshib && (prizeSol || prizeUSDC || prizePuff || prizeSshib || prizePhysicProduct) && inputText && logoImage)) ? 'text-[#aaaaaa55]' : 'text-white'}`} >Create</p>
                <div className={`${(isLoading || !(raffleName && valueTo && ticketSupply && entryUSDC && entrySol && entryPuff && entrySshib && (prizeSol || prizeUSDC || prizePuff || prizeSshib || prizePhysicProduct) && inputText && logoImage)) ? 'pl-0' : 'group-hover:pl-3'} duration-500`}>
                  <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.599609 7.52754C0.599609 7.03048 1.00255 6.62754 1.49961 6.62754L14.2651 6.62754L9.27581 1.87629C8.91752 1.53177 8.90634 0.962034 9.25086 0.603739C9.59537 0.245445 10.1651 0.234273 10.5234 0.578787L17.1234 6.87879C17.2999 7.04847 17.3996 7.28272 17.3996 7.52754C17.3996 7.77235 17.2999 8.0066 17.1234 8.17629L10.5234 14.4763C10.1651 14.8208 9.59537 14.8096 9.25086 14.4513C8.90635 14.093 8.91752 13.5233 9.27581 13.1788L14.2651 8.42754L1.49961 8.42754C1.00255 8.42754 0.599609 8.02459 0.599609 7.52754Z" fill={`${(isLoading || !(raffleName && valueTo && ticketSupply && entryUSDC && entrySol && entryPuff && entrySshib && (prizeSol || prizeUSDC || prizePuff || prizeSshib || prizePhysicProduct) && inputText && logoImage)) ? '#aaaaaa55' : 'white'}`} />
                  </svg>
                </div>
              </div>
            }
          </button>
          <Snackbar
            open={alertState.open}
            autoHideDuration={6000}
            onClose={() => setAlertState({ ...alertState, open: false })}
          >
            <Alert
              onClose={() => setAlertState({ ...alertState, open: false })}
              severity={alertState.severity}
              className='text-[red]'
            >
              {alertState.message}
            </Alert>
          </Snackbar>
        </div>
      }

    </>
  )
}

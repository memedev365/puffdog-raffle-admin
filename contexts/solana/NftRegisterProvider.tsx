import { createContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@project-serum/anchor";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { getCreatorAddy } from "@/components/utils/getCreatorAddy";

interface Content {
  "Air Handlers": number;
  BTU1: number;
  BTU2: number;
  BTU3: number;
  BTU4: number;
  SEER1: number;
  SEER2: number;
  SEER3: number;
  SEER4: number;
  Occupants: number;
  "No. Car Chargers": number;
  Softner: string;
  Envelope: number;
  "Water Heater Efficiency": number;
  "Water Heater": string;
  Tank: string;
  Pump: string;
  "Pool Heater": string;
  Spa: boolean;
  "No. Lights": number;
  "Light Type": string;
  Fridges: number;
  "No. TVs": number;
  "No. PCs": number;
  "No. Fans": number;
  "No. Washer": number;
  "No. Dryer": number;
  "No. Microwaves": number;
  "No. Ovens": number;
  "Self Produced": number;
  "nftID"?: string;
  "ownerAddress"?: string;
  tuneup_date?: Date;
  service_date?: Date;
}
export interface requiredData {
  isTune: boolean,
  isService: boolean,
  mintAddress: string,
  uriImage: string,
  nftID: string;
  homeAddy: string;
  originObject: Content,
}
export const NftRegisterContext = createContext({
  isRegistered: false,
  getDataLoadingState: false,
  homeProfileNFT: [] as requiredData[],
  getOwnNfts: async () => { },
});

const NftRegisterProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const wallet = useWallet();

  const [getDataLoadingState, setGetDataLoadingState] = useState<boolean>(true);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [homeProfileNFT, setHomeProfileNFT] = useState([] as requiredData[]);

  function oneYearSurpassed(originalDate: string): boolean {
    // Get the current date
    const today = new Date();

    // Create a copy of the original date to manipulate
    const oneYearFromOriginal = new Date(originalDate);
    oneYearFromOriginal.setFullYear(oneYearFromOriginal.getFullYear() + 1);

    // Compare the dates
    return today.getTime() > oneYearFromOriginal.getTime();
  }
  // Get nfts from the wallet || Get collections added in the contract
  const getOwnNfts = async () => {
    setGetDataLoadingState(true);

    // const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));
    // const solConnection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
    const solConnection = new web3.Connection(process.env.NEXT_PUBLIC_DEVNET_RPC || "https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd", "confirmed");
    //     if (wallet.publicKey === null) return;
    try {
      const nftList = await getParsedNftAccountsByOwner({
        publicAddress: wallet.publicKey.toBase58(),
        connection: solConnection,
      });
      console.log(nftList, "nftList----");
      if (nftList.length > 0) {
        let tempHomeNFTData = [] as requiredData[];
        const createAddy = await getCreatorAddy();
        for (let item of nftList) {
          if (
            item.data?.name == "Meta Tune Club" &&
            createAddy == item.data.creators[0].address
          ) {
            // setMintAddress(item.mint);
            // let canTune = true;
            // let canService = true;
            try {
              if (item?.data.uri) {
                try {
                  const response = await fetch(`${item?.data.uri}`);
                  const homeData = await response.json();
                  if (homeData) {
                    if (homeData?.attributes && homeData?.attributes.ownerAddress == wallet.publicKey.toString()) {
                      // setUriImage(homeData?.image);
                      // setOriginObject(homeData?.attributes);
                      let canTune = true;
                      let canService = true;
                      Object.entries(homeData?.attributes).forEach(async ([key, value]) => {
                        if (key === "tuneup_date" && value) {
                          canTune = oneYearSurpassed(value as string);
                        } else if (key === "service_date" && value) {
                          canService = oneYearSurpassed(value as string);
                        }
                      });
                    }

                  }
                } catch (error) {
                  console.log(error, 'fetching error')
                }
              }

            }
            catch (error) {
              console.error(error);
              return;
            }
          }
        }

        if (tempHomeNFTData.length) {
          setHomeProfileNFT(tempHomeNFTData);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
        console.log(tempHomeNFTData, 'tempHomeNFTData>>>');

        setGetDataLoadingState(false);
      }
    } catch (error) {
      console.log("error>>>", error);
      setGetDataLoadingState(false);
    }
  };


  useEffect(() => {
    if (wallet.publicKey && wallet.connected) {
      getOwnNfts();
    }
    // eslint-disable-next-line
  }, [wallet.publicKey, wallet.connected]);

  return (
    <NftRegisterContext.Provider
      value={{
        isRegistered,
        getDataLoadingState,
        homeProfileNFT,
        getOwnNfts
      }}
    >
      {children}
    </NftRegisterContext.Provider>
  );
};
export default NftRegisterProvider;
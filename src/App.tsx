import { useState } from "react";
import {
  MsgExecuteMessages,
  MsgUpdateParams,
} from "@initia/opinit.proto/opinit/opchild/v1/tx";
import { useAddress, useWallet } from "@initia/react-wallet-widget";
import Axios from "axios";

export const App = () => {
  const address = useAddress();
  const { onboard, view, requestTx } = useWallet();

  const [gasPrices, setGasPrices] = useState({
    prices: "",
  });

  const handleGasPriceChange = (coinsInput: string) => {
    setGasPrices(() => ({
      prices: coinsInput,
    }));
  };

  if (address) {
    const send = async () => {
      const axios = Axios.create({
        timeout: 100000,
      });
      const opchild = await axios.get<ModuleAddress>(
        "https://lcd.stonewasm-14.initia.xyz/cosmos/auth/v1beta1/module_accounts/opchild" // change this to your lcd
      );

      const param = await axios.get<OpchildParam>(
        "https://lcd.stonewasm-14.initia.xyz/opinit/opchild/v1/params" // change this to your lcd
      );
      console.log(gasPrices.prices.split(",").map(convertStringToDecCoin));
      const moduleAddress = opchild.data.account.base_account.address;
      const updateParamsMsg: MsgUpdateParams = MsgUpdateParams.fromPartial({
        authority: moduleAddress,
        params: {
          maxValidators: param.data.params.max_validators,
          historicalEntries: param.data.params.historical_entries,
          minGasPrices: gasPrices.prices.split(",").map(convertStringToDecCoin),
          bridgeExecutor: param.data.params.bridge_executor,
        },
      });

      const msgs = [
        {
          typeUrl: "/opinit.opchild.v1.MsgExecuteMessages",
          value: MsgExecuteMessages.fromPartial({
            sender: address,
            messages: [
              {
                typeUrl: "/opinit.opchild.v1.MsgUpdateParams",
                value: MsgUpdateParams.encode(updateParamsMsg).finish(),
              },
            ],
          }),
        },
      ];

      const transactionHash = await requestTx({ messages: msgs });
      // need polling and show result here
      console.log(transactionHash);
    };

    return (
      <>
        <button onClick={view}>{address}</button>
        <input
          type="text"
          value={gasPrices.prices}
          onChange={(e) => handleGasPriceChange(e.target.value)}
          placeholder="0.15umin,0.1uinit... " // denom must be sorted
        />
        <button onClick={send}>Send</button>
      </>
    );
  }

  return <button onClick={onboard}>Connect</button>;
};

interface ModuleAddress {
  account: {
    "@type": string;
    base_account: {
      address: string;
      pub_key: null | string;
      account_number: string;
      sequence: string;
    };
    name: string;
    permissions: string[];
  };
}

interface OpchildParam {
  params: {
    max_validators: number;
    historical_entries: number;
    min_gas_prices: { denom: string; amount: string }[];
    bridge_executor: string;
  };
}

function convertStringToDecCoin(inputString: string) {
  const m = inputString.match(/^(-?[0-9]+(\.[0-9]+)?)([0-9a-zA-Z/]+)$/);
  if (m === null) {
    throw new Error(`failed to parse to Coin: ${inputString}`);
  }
  const amount = (Number(m[1]) * 10 ** 18).toString();
  const denom = m[3];
  return { denom, amount };
}

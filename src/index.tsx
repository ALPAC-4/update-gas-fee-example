import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import {
  WalletWidgetProvider,
  initWalletWidget,
} from "@initia/react-wallet-widget";

const chain = {
  chain_id: "stonewasm-14",
  chain_name: "stonewasm",
  apis: {
    rpc: [{ address: "https://rpc.stonewasm-14.initia.xyz" }],
    rest: [{ address: "https://lcd.stonewasm-14.initia.xyz" }],
  },
  fees: {
    fee_tokens: [
      {
        denom:
          "l2/2588fd87a8e081f6a557f43ff14f05dddf5e34cb27afcefd6eaf81f1daea30d0",
        fixed_min_gas_price: 0.15,
      },
    ],
  },
  bech32_prefix: "init",
}; // change this to chain.json input

const initiaWalletWidget = initWalletWidget({
  layer: chain,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <WalletWidgetProvider widget={initiaWalletWidget}>
    <App />
  </WalletWidgetProvider>
);

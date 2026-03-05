export const clearWeb2Session = () => {
  localStorage.removeItem("welli_onboarded");
  localStorage.removeItem("welli_trial_start");
  localStorage.removeItem("userData");
};

export const clearWalletSession = () => {
  localStorage.removeItem("wallet_onboarded");
  localStorage.removeItem("wallet_trial_start");

  localStorage.removeItem("rk-latest-id");
  localStorage.removeItem("rk-recent");
  localStorage.removeItem("wagmi.store");
  localStorage.removeItem("wagmi.recentConnectorId");
};

export const clearWalletStorage = () => {
  // RainbowKit
  localStorage.removeItem("rk-latest-id");
  localStorage.removeItem("rk-recent");

  // Wagmi
  localStorage.removeItem("wagmi.store");
  localStorage.removeItem("wagmi.recentConnectorId");

  // App-specific
  localStorage.removeItem("welli_onboarded");
  localStorage.removeItem("welli_trial_start");

  // Optional: clear everything related to wagmi prefix
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("wagmi") || key.startsWith("rk-")) {
      localStorage.removeItem(key);
    }
  });
};
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can be null, so we explicitly check for false
      setIsOffline(state.isConnected === false);
    });

    return () => unsubscribe();
  }, []);

  return isOffline;
};

import { Linking, Platform } from 'react-native';
import { LocationData, ProviderName } from '../constants/providers';

interface DeepLinkConfig {
  appUrl: string;
  webUrl: string;
  packageName?: string;
}

function buildDeepLink(provider: ProviderName, pickup: LocationData, drop: LocationData): DeepLinkConfig {
  const pLat = pickup.latitude;
  const pLng = pickup.longitude;
  const dLat = drop.latitude;
  const dLng = drop.longitude;
  const pickupAddr = encodeURIComponent(pickup.address);
  const dropAddr = encodeURIComponent(drop.address);

  switch (provider) {
    case 'uber':
      return {
        appUrl: `uber://?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[formatted_address]=${pickupAddr}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[formatted_address]=${dropAddr}`,
        webUrl: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}`,
        packageName: 'com.ubercab',
      };

    case 'ola':
      return {
        appUrl: `olacabs://app/launch?lat=${pLat}&lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}`,
        webUrl: `https://book.olacabs.com/?lat=${pLat}&lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}`,
        packageName: 'com.olacabs.customer',
      };

    case 'rapido':
      return {
        appUrl: `rapido://ride?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}`,
        webUrl: `https://www.rapido.bike`,
        packageName: 'com.rapido.passenger',
      };

    case 'namma_yatri':
      return {
        appUrl: `nammayatri://ride?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_address=${pickupAddr}&drop_address=${dropAddr}`,
        webUrl: `https://nammayatri.in`,
        packageName: 'in.juspay.nammayatri',
      };
  }
}

export async function openRideApp(provider: ProviderName, pickup: LocationData, drop: LocationData): Promise<boolean> {
  const config = buildDeepLink(provider, pickup, drop);

  try {
    const canOpen = await Linking.canOpenURL(config.appUrl);
    if (canOpen) {
      await Linking.openURL(config.appUrl);
      return true;
    }
  } catch {}

  // Fallback: open Play Store or web
  if (Platform.OS === 'android' && config.packageName) {
    try {
      await Linking.openURL(`market://details?id=${config.packageName}`);
      return false;
    } catch {}
  }

  try {
    await Linking.openURL(config.webUrl);
  } catch {}

  return false;
}

export function getPlayStoreUrl(provider: ProviderName): string {
  const packages: Record<ProviderName, string> = {
    uber: 'com.ubercab',
    ola: 'com.olacabs.customer',
    rapido: 'com.rapido.passenger',
    namma_yatri: 'in.juspay.nammayatri',
  };
  return `https://play.google.com/store/apps/details?id=${packages[provider]}`;
}

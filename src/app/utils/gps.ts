export type GPSPosition = {
  lat: number;
  lng: number;
};

export function getCurrentGPS(): Promise<GPSPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalización no soportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  });
}

export function formatGPSBlock(pos: GPSPosition) {
  return `[GPS]
lat: ${pos.lat}
lng: ${pos.lng}
date: ${new Date().toISOString()}
[/GPS]\n\n`;
}

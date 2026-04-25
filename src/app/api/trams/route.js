import { NextResponse } from 'next/server';

const API_KEY = process.env.BKK_API_KEY;
const ARRIVALS_API = "https://go.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json";
const VEHICLES_API = "https://go.bkk.hu/api/query/v1/ws/otp/api/where/vehicles-for-route.json";


const STOPS = [
  { id: "BKK_F01397", route: "2", routeId: "BKK_3020", stopName: "MÜPA", lat: 47.471269 },
  { id: "BKK_F01399", route: "2B", routeId: "BKK_3022", stopName: "VÁGÓHÍD U.", lat: 47.474011 }
];

const ROUTE_IDS = ["BKK_3020", "BKK_3022"];
const HALLER_LIMIT = 47.4770;

export async function GET() {
  try {
    const currentTime = Math.floor(Date.now() / 1000);


    let gpsData = {};

    for (const rId of ROUTE_IDS) {
      const vRes = await fetch(
        `${VEHICLES_API}?routeId=${rId}&key=${API_KEY}`,
        { cache: 'no-store' }
      );
      const vData = await vRes.json();

      if (vData?.data?.list) {
        vData.data.list.forEach(v => {
          const info = {
            location: v.location,
            bearing: v.bearing
          };

          if (v.tripId) gpsData[v.tripId] = info;
          if (v.vehicleId) gpsData[v.vehicleId] = info;
        });
      }
    }


    let finalResults = [];
    const seenTrips = new Set();

    for (const stop of STOPS) {
      const res = await fetch(
        `${ARRIVALS_API}?stopId=${stop.id}&minutesBefore=2&minutesAfter=50&key=${API_KEY}`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      const stopTimes = data?.data?.entry?.stopTimes;
      const tripsRef = data?.data?.references?.trips || {};

      if (stopTimes) {
        stopTimes.forEach(st => {
          const tripId = st.tripId;
          const vehicleId = st.vehicleId;

          if (!tripId || seenTrips.has(tripId)) return;


          const actualRouteId = tripsRef[tripId]?.routeId;
          if (actualRouteId !== stop.routeId) return;

          const arrivalTime = st.predictedArrivalTime || st.arrivalTime;

          if (!arrivalTime) return;

          const diff = Math.floor((arrivalTime - currentTime) / 60);

          if (!Number.isFinite(diff) || diff < -2 || diff > 60) return;


          const vLoc = gpsData[tripId] || gpsData[vehicleId];
          const currentLat = vLoc?.location?.lat || null;
          const currentLon = vLoc?.location?.lon || null;


          if (currentLat !== null && currentLat > HALLER_LIMIT + 0.002) return;

          const isPast = currentLat !== null ? currentLat > (stop.lat + 0.0004) : false;

          seenTrips.add(tripId);

          finalResults.push({
            id: tripId,
            route: stop.route,
            minutes: diff,
            lat: currentLat,
            lon: currentLon,
            bearing: vLoc?.bearing || 0,
            stopName: stop.stopName,
            isPast
          });
        });
      }
    }

    const sorted = finalResults.sort((a, b) => a.minutes - b.minutes);

    return NextResponse.json({ vehicles: sorted });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'API Error' },
      { status: 500 }
    );
  }
}
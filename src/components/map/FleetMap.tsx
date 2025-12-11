// src/components/map/FleetMap.tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../ui/Button';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false });
import L from 'leaflet';

const truckIcon = new L.Icon({
  iconUrl: '/icons/ubicacion.png',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});
type LatLngExpression = [number, number];

type LiveVehicle = {
  vehicleId: string;
  vehiclePlate: string;
  timestamp: string;
  lat: number;
  lng: number;
  speedKmh?: number;
};

type HistoryPoint = {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  heading?: number;
  accuracyM?: number;
};

async function fetchLive() {
  const res = await apiClient.get('/locations/live');
  return res.data as LiveVehicle[];
}

async function fetchHistory(vehicleId: string) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  const from = start.toISOString();
  const to = end.toISOString();
  const res = await apiClient.get(`/locations/vehicles/${vehicleId}/history`, { params: { from, to } });
  return res.data as HistoryPoint[];
}

export function FleetMap() {
  const queryClient = useQueryClient();
  const liveQuery = useQuery({ queryKey: ['live-locations'], queryFn: fetchLive, refetchInterval: 15000 });
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const historyQuery = useQuery({
    queryKey: ['history', selectedVehicle],
    queryFn: () => fetchHistory(selectedVehicle || ''),
    enabled: !!selectedVehicle,
  });

  const center: LatLngExpression = useMemo(() => {
    if (liveQuery.data && liveQuery.data.length > 0) {
      return [liveQuery.data[0].lat, liveQuery.data[0].lng];
    }
    // Centro por defecto: Santiago, Chile
    return [-33.45, -70.6667];
  }, [liveQuery.data]);

  const zoom = liveQuery.data && liveQuery.data.length > 0 ? 12 : 11;

  const handleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    queryClient.invalidateQueries({ queryKey: ['history', vehicleId] });
  };

  return (
    <div className="grid h-[80vh] gap-4 lg:grid-cols-3">
      <div className="rounded-lg bg-white p-4 shadow lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Flota en vivo</h2>
          {liveQuery.isLoading && <span className="text-xs text-gray-500">Cargando...</span>}
          {liveQuery.isError && <span className="text-xs text-red-600">Error al cargar</span>}
        </div>
        <div className="space-y-2 overflow-auto">
          {liveQuery.data?.map((v) => {
            const moving = (v.speedKmh ?? 0) > 0;
            return (
              <div
                key={v.vehicleId}
                className="flex cursor-pointer items-center justify-between rounded border p-2 hover:bg-gray-50"
                onClick={() => handleSelect(v.vehicleId)}
              >
                <div>
                  <div className="text-sm font-semibold">{v.vehiclePlate}</div>
                  <div className="text-xs text-gray-500">
                    {moving ? 'En movimiento' : 'Detenido'} · {new Date(v.timestamp).toLocaleString()}
                  </div>
                </div>
                {selectedVehicle === v.vehicleId && <span className="text-xs text-blue-600">Seleccionado</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow lg:col-span-2">
        <MapContainer center={center} zoom={zoom} className="h-full min-h-[400px] w-full rounded-lg">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {liveQuery.data?.map((v) => (
            <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={truckIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{v.vehiclePlate}</div>
                  <div>Vel: {v.speedKmh ?? 0} km/h</div>
                  <div>{new Date(v.timestamp).toLocaleString()}</div>
                  <Button onClick={() => handleSelect(v.vehicleId)} className="mt-2 w-full">
                    Ver historial hoy
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
          {historyQuery.data && historyQuery.data.length > 1 && (
            <Polyline
              positions={historyQuery.data.map((p) => [p.lat, p.lng] as LatLngExpression)}
              pathOptions={{ color: 'blue' }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

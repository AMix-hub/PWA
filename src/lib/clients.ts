export type ClientIconType = 'default' | 'work' | 'home' | 'warehouse' | 'service';

export const CLIENT_ICON_COLORS: Record<ClientIconType, string> = {
  default: '#1d4ed8',
  work: '#f59e0b',
  home: '#22c55e',
  warehouse: '#a855f7',
  service: '#06b6d4',
};

export interface Client {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourly_rate: number;
  iconType?: ClientIconType;
}

export const defaultClients: Client[] = [
  {
    id: '1',
    name: 'Bygg AB Stockholm',
    address: 'Sveavägen 44, Stockholm',
    latitude: 59.336,
    longitude: 18.063,
    hourly_rate: 850,
    iconType: 'work',
  },
  {
    id: '2',
    name: 'El & VVS Göteborg',
    address: 'Avenyn 12, Göteborg',
    latitude: 57.699,
    longitude: 11.972,
    hourly_rate: 780,
    iconType: 'service',
  },
  {
    id: '3',
    name: 'Fastighets AB Malmö',
    address: 'Stortorget 1, Malmö',
    latitude: 55.605,
    longitude: 13.003,
    hourly_rate: 720,
    iconType: 'warehouse',
  },
];

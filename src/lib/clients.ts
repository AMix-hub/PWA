export interface Client {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourly_rate: number;
}

export const defaultClients: Client[] = [
  {
    id: '1',
    name: 'Bygg AB Stockholm',
    address: 'Sveavägen 44, Stockholm',
    latitude: 59.336, 
    longitude: 18.063,
    hourly_rate: 850,
  },
  {
    id: '2',
    name: 'El & VVS Göteborg',
    address: 'Avenyn 12, Göteborg',
    latitude: 57.699,
    longitude: 11.972,
    hourly_rate: 780,
  },
  {
    id: '3',
    name: 'Fastighets AB Malmö',
    address: 'Stortorget 1, Malmö',
    latitude: 55.605,
    longitude: 13.003,
    hourly_rate: 720,
  },
];

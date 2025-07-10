
import { useState, useEffect } from 'react';

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  province_id: string;
}

export const useIndonesiaRegions = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      console.log('Fetching provinces from Indonesia API...');
      const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Provinces data:', data);
      console.log('Total provinces fetched:', data.length);
      
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback: use manual province list with 38 provinces
      const fallbackProvinces = [
        { id: '11', name: 'ACEH' },
        { id: '12', name: 'SUMATERA UTARA' },
        { id: '13', name: 'SUMATERA BARAT' },
        { id: '14', name: 'RIAU' },
        { id: '15', name: 'JAMBI' },
        { id: '16', name: 'SUMATERA SELATAN' },
        { id: '17', name: 'BENGKULU' },
        { id: '18', name: 'LAMPUNG' },
        { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
        { id: '21', name: 'KEPULAUAN RIAU' },
        { id: '31', name: 'DKI JAKARTA' },
        { id: '32', name: 'JAWA BARAT' },
        { id: '33', name: 'JAWA TENGAH' },
        { id: '34', name: 'DI YOGYAKARTA' },
        { id: '35', name: 'JAWA TIMUR' },
        { id: '36', name: 'BANTEN' },
        { id: '51', name: 'BALI' },
        { id: '52', name: 'NUSA TENGGARA BARAT' },
        { id: '53', name: 'NUSA TENGGARA TIMUR' },
        { id: '61', name: 'KALIMANTAN BARAT' },
        { id: '62', name: 'KALIMANTAN TENGAH' },
        { id: '63', name: 'KALIMANTAN SELATAN' },
        { id: '64', name: 'KALIMANTAN TIMUR' },
        { id: '65', name: 'KALIMANTAN UTARA' },
        { id: '71', name: 'SULAWESI UTARA' },
        { id: '72', name: 'SULAWESI TENGAH' },
        { id: '73', name: 'SULAWESI SELATAN' },
        { id: '74', name: 'SULAWESI TENGGARA' },
        { id: '75', name: 'GORONTALO' },
        { id: '76', name: 'SULAWESI BARAT' },
        { id: '81', name: 'MALUKU' },
        { id: '82', name: 'MALUKU UTARA' },
        { id: '91', name: 'PAPUA BARAT' },
        { id: '92', name: 'PAPUA' },
        { id: '93', name: 'PAPUA TENGAH' },
        { id: '94', name: 'PAPUA PEGUNUNGAN' },
        { id: '95', name: 'PAPUA SELATAN' },
        { id: '96', name: 'PAPUA BARAT DAYA' }
      ];
      console.log('Using fallback provinces list:', fallbackProvinces.length, 'provinces');
      setProvinces(fallbackProvinces);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitiesByProvince = async (provinceId: string) => {
    setLoading(true);
    try {
      console.log(`Fetching cities for province ID: ${provinceId}`);
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Cities data:', data);
      console.log('Total cities fetched:', data.length);
      
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    provinces,
    cities,
    loading,
    fetchCitiesByProvince
  };
};

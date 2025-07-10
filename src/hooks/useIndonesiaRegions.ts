
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
      
      // Ensure we have all 38 provinces by adding missing ones if needed
      const allProvinces = [
        ...data,
        // Add missing provinces if they're not in the API response
        ...(!data.find((p: Province) => p.name === 'PAPUA TENGAH') ? [{ id: '93', name: 'PAPUA TENGAH' }] : []),
        ...(!data.find((p: Province) => p.name === 'PAPUA PEGUNUNGAN') ? [{ id: '94', name: 'PAPUA PEGUNUNGAN' }] : []),
        ...(!data.find((p: Province) => p.name === 'PAPUA SELATAN') ? [{ id: '95', name: 'PAPUA SELATAN' }] : []),
        ...(!data.find((p: Province) => p.name === 'PAPUA BARAT DAYA') ? [{ id: '96', name: 'PAPUA BARAT DAYA' }] : [])
      ];
      
      // Sort by name for better UX
      const sortedProvinces = allProvinces.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('Final provinces count:', sortedProvinces.length);
      setProvinces(sortedProvinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback: use complete manual province list with all 38 provinces
      const fallbackProvinces = [
        { id: '11', name: 'ACEH' },
        { id: '51', name: 'BALI' },
        { id: '36', name: 'BANTEN' },
        { id: '17', name: 'BENGKULU' },
        { id: '34', name: 'DI YOGYAKARTA' },
        { id: '31', name: 'DKI JAKARTA' },
        { id: '75', name: 'GORONTALO' },
        { id: '15', name: 'JAMBI' },
        { id: '32', name: 'JAWA BARAT' },
        { id: '33', name: 'JAWA TENGAH' },
        { id: '35', name: 'JAWA TIMUR' },
        { id: '61', name: 'KALIMANTAN BARAT' },
        { id: '63', name: 'KALIMANTAN SELATAN' },
        { id: '62', name: 'KALIMANTAN TENGAH' },
        { id: '64', name: 'KALIMANTAN TIMUR' },
        { id: '65', name: 'KALIMANTAN UTARA' },
        { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
        { id: '21', name: 'KEPULAUAN RIAU' },
        { id: '18', name: 'LAMPUNG' },
        { id: '81', name: 'MALUKU' },
        { id: '82', name: 'MALUKU UTARA' },
        { id: '52', name: 'NUSA TENGGARA BARAT' },
        { id: '53', name: 'NUSA TENGGARA TIMUR' },
        { id: '94', name: 'PAPUA' },
        { id: '91', name: 'PAPUA BARAT' },
        { id: '96', name: 'PAPUA BARAT DAYA' },
        { id: '95', name: 'PAPUA PEGUNUNGAN' },
        { id: '95', name: 'PAPUA SELATAN' },
        { id: '93', name: 'PAPUA TENGAH' },
        { id: '14', name: 'RIAU' },
        { id: '76', name: 'SULAWESI BARAT' },
        { id: '73', name: 'SULAWESI SELATAN' },
        { id: '72', name: 'SULAWESI TENGAH' },
        { id: '74', name: 'SULAWESI TENGGARA' },
        { id: '71', name: 'SULAWESI UTARA' },
        { id: '13', name: 'SUMATERA BARAT' },
        { id: '16', name: 'SUMATERA SELATAN' },
        { id: '12', name: 'SUMATERA UTARA' }
      ];
      
      const sortedFallback = fallbackProvinces.sort((a, b) => a.name.localeCompare(b.name));
      console.log('Using fallback provinces list:', sortedFallback.length, 'provinces');
      setProvinces(sortedFallback);
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
      
      // Sort cities by name
      const sortedCities = data.sort((a: City, b: City) => a.name.localeCompare(b.name));
      setCities(sortedCities);
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

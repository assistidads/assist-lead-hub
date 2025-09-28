
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MasterDataTable } from '@/components/Master/MasterDataTable';
import { MasterDataForm } from '@/components/Master/MasterDataForm';

export default function Master() {
  
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenForm = (tableName: string, data?: any) => {
    setActiveForm(tableName);
    setEditData(data || null);
  };

  const handleCloseForm = () => {
    setActiveForm(null);
    setEditData(null);
  };

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const masterDataConfig = [
    {
      key: 'profiles',
      title: 'User',
      tableName: 'profiles',
      columns: [
        { key: 'full_name', label: 'Nama Admin' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' }
      ],
      fields: [
        { key: 'full_name', label: 'Nama Admin', required: true },
        { key: 'email', label: 'Email', required: true },
        { key: 'password', label: 'Password (Opsional untuk edit)', required: false },
        { key: 'role', label: 'Role', required: true }
      ]
    },
    {
      key: 'layanan_assist',
      title: 'Layanan Assist',
      tableName: 'layanan_assist',
      columns: [
        { key: 'layanan', label: 'Layanan' }
      ],
      fields: [
        { key: 'layanan', label: 'Layanan', required: true }
      ]
    },
    {
      key: 'kode_ads',
      title: 'Kode Ads', 
      tableName: 'kode_ads',
      columns: [
        { key: 'kode', label: 'Kode Ads' }
      ],
      fields: [
        { key: 'kode', label: 'Kode Ads', required: true }
      ]
    },
    {
      key: 'sumber_leads',
      title: 'Sumber Leads',
      tableName: 'sumber_leads', 
      columns: [
        { key: 'sumber_leads', label: 'Sumber Leads' }
      ],
      fields: [
        { key: 'sumber_leads', label: 'Sumber Leads', required: true }
      ]
    },
    {
      key: 'tipe_faskes',
      title: 'Tipe Faskes',
      tableName: 'tipe_faskes',
      columns: [
        { key: 'tipe_faskes', label: 'Tipe Faskes' }
      ],
      fields: [
        { key: 'tipe_faskes', label: 'Tipe Faskes', required: true }
      ]
    },
    {
      key: 'status_leads',
      title: 'Status Leads',
      tableName: 'status_leads',
      columns: [
        { key: 'status_leads', label: 'Status Leads' }
      ],
      fields: [
        { key: 'status_leads', label: 'Status Leads', required: true }
      ]
    },
    {
      key: 'alasan_bukan_leads',
      title: 'Bukan Leads',
      tableName: 'alasan_bukan_leads',
      columns: [
        { key: 'bukan_leads', label: 'Bukan Leads' }
      ],
      fields: [
        { key: 'bukan_leads', label: 'Bukan Leads', required: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Master</h2>
        <p className="text-muted-foreground">
          Kelola master data sistem
        </p>
      </div>

      <Tabs defaultValue={masterDataConfig[0].key} className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          {masterDataConfig.map((config) => (
            <TabsTrigger key={config.key} value={config.key}>
              {config.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {masterDataConfig.map((config) => (
          <TabsContent key={config.key} value={config.key} className="space-y-4">
            <MasterDataTable
              table={config.tableName}
              title={config.title}
              onAdd={() => handleOpenForm(config.key)}
              onEdit={(data) => handleOpenForm(config.key, data)}
              refreshTrigger={refreshTrigger}
            />

            <MasterDataForm
              open={activeForm === config.key}
              onOpenChange={handleCloseForm}
              table={config.tableName}
              title={config.title}
              fields={config.fields}
              editData={editData}
              onSuccess={handleFormSuccess}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

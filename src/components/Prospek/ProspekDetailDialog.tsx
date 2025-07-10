
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Prospek } from '@/types/database';

interface ProspekDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospek: any | null;
  masterData: {
    statusLeads: any[];
    sumberLeads: any[];
    tipeFaskes: any[];
    layananAssist: any[];
    profiles: any[];
  };
}

export const ProspekDetailDialog: React.FC<ProspekDetailDialogProps> = ({
  open,
  onOpenChange,
  prospek,
  masterData,
}) => {
  if (!prospek) return null;

  // Helper functions to get display values using masterData
  const getStatusLeads = (statusId: string) => {
    const status = masterData.statusLeads.find(s => s.id === statusId);
    return status ? status.status_leads : '-';
  };

  const getSumberLeads = (sumberId: string) => {
    const sumber = masterData.sumberLeads.find(s => s.id === sumberId);
    return sumber ? sumber.sumber_leads : '-';
  };

  const getTipeFaskes = (tipeId: string) => {
    const tipe = masterData.tipeFaskes.find(t => t.id === tipeId);
    return tipe ? tipe.tipe_faskes : '-';
  };

  const getLayananAssist = (layananId: string) => {
    const layanan = masterData.layananAssist.find(l => l.id === layananId);
    return layanan ? layanan.layanan : '-';
  };

  const getPicName = (picId: string) => {
    const pic = masterData.profiles.find(p => p.id === picId);
    return pic ? pic.full_name : '-';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Prospek</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created Date</label>
                <p className="text-sm">
                  {format(new Date(prospek.created_at), "dd/MM/yyyy HH:mm", { locale: id })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Prospek</label>
                <p className="text-sm">
                  {format(new Date(prospek.tanggal_prospek), "dd/MM/yyyy", { locale: id })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Prospek</label>
                <p className="text-sm font-medium">{prospek.nama_prospek}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">No. WhatsApp</label>
                <p className="text-sm">{prospek.no_whatsapp}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lead Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informasi Leads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Sumber Leads</label>
                <p className="text-sm">{getSumberLeads(prospek.sumber_leads_id || '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status Leads</label>
                <Badge variant="secondary" className="mt-1">
                  {getStatusLeads(prospek.status_leads_id || '')}
                </Badge>
              </div>
              {prospek.tanggal_perubahan_status_leads && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Perubahan Status</label>
                  <p className="text-sm">
                    {format(new Date(prospek.tanggal_perubahan_status_leads), "dd/MM/yyyy HH:mm", { locale: id })}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">PIC Leads</label>
                <p className="text-sm">{getPicName(prospek.pic_leads_id || '')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ads Information */}
          {(prospek.kode_ads?.kode || prospek.id_ads) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Informasi Ads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prospek.kode_ads?.kode && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kode Ads</label>
                      <p className="text-sm">{prospek.kode_ads.kode}</p>
                    </div>
                  )}
                  {prospek.id_ads && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID Ads</label>
                      <p className="text-sm">{prospek.id_ads}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Facility Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informasi Faskes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Faskes</label>
                <p className="text-sm font-medium">{prospek.nama_faskes}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipe Faskes</label>
                <p className="text-sm">{getTipeFaskes(prospek.tipe_faskes_id || '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kota</label>
                <p className="text-sm">{prospek.kota}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Provinsi</label>
                <p className="text-sm">{prospek.provinsi_nama}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informasi Layanan</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Layanan Assist</label>
                <p className="text-sm">{getLayananAssist(prospek.layanan_assist_id || '')}</p>
              </div>
            </div>
          </div>

          {/* Rejection Information */}
          {(prospek.alasan_bukan_leads?.bukan_leads || prospek.keterangan_bukan_leads) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Informasi Bukan Leads</h3>
                <div className="grid grid-cols-1 gap-4">
                  {prospek.alasan_bukan_leads?.bukan_leads && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Alasan Bukan Leads</label>
                      <p className="text-sm">{prospek.alasan_bukan_leads.bukan_leads}</p>
                    </div>
                  )}
                  {prospek.keterangan_bukan_leads && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Keterangan Bukan Leads</label>
                      <p className="text-sm">{prospek.keterangan_bukan_leads}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

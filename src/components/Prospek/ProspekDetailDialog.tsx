
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
}

export const ProspekDetailDialog: React.FC<ProspekDetailDialogProps> = ({
  open,
  onOpenChange,
  prospek,
}) => {
  if (!prospek) return null;

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
                <p className="text-sm">{prospek.sumber_leads?.sumber_leads || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status Leads</label>
                <Badge variant="secondary" className="mt-1">
                  {prospek.status_leads?.status_leads || '-'}
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
                <p className="text-sm">{prospek.pic_leads?.full_name || '-'}</p>
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
                <p className="text-sm">{prospek.tipe_faskes?.tipe_faskes || '-'}</p>
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
                <p className="text-sm">{prospek.layanan_assist?.layanan || '-'}</p>
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

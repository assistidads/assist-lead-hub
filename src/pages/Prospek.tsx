
import { useState } from 'react';
import { ProspekTableNew } from '@/components/Prospek/ProspekTableNew';
import { ProspekFormDialog } from '@/components/Prospek/ProspekFormDialog';
import { UpdateStatusDialog } from '@/components/Prospek/UpdateStatusDialog';
import type { Prospek } from '@/types/database';

export default function Prospek() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedProspek, setSelectedProspek] = useState<Prospek | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddProspek = () => {
    setSelectedProspek(null);
    setIsFormOpen(true);
  };

  const handleEditProspek = (prospek: Prospek) => {
    setSelectedProspek(prospek);
    setIsFormOpen(true);
  };

  const handleUpdateStatus = (prospek: Prospek) => {
    setSelectedProspek(prospek);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteProspek = (id: string) => {
    // Delete logic is handled in the table component
    console.log('Delete prospek:', id);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Prospek</h2>
          <p className="text-muted-foreground">
            Kelola data prospek dan leads Anda
          </p>
        </div>
      </div>

      {/* Prospek Table */}
      <ProspekTableNew
        onEdit={handleEditProspek}
        onDelete={handleDeleteProspek}
        onOpenForm={handleAddProspek}
        onUpdateStatus={handleUpdateStatus}
        refreshTrigger={refreshTrigger}
      />

      {/* Form Dialog */}
      <ProspekFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        prospek={selectedProspek}
        onSuccess={handleSuccess}
      />

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        prospek={selectedProspek}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

"use client"

import styles from "../../../app/[locale]/page.module.css"
import React, { useState, useEffect } from 'react';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/EditSharp'
import { deleteProductData, getProductsData } from '../../../api/api';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Snackbar,
  useMediaQuery,
  useTheme, 
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Alert, AlertTitle } from '@mui/material';
import { useRouter } from 'next/navigation';

const ProductGrid = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isSmScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [rows, setRows] = useState<{ id: string; title: string; description: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    setLoading(true);

    getProductsData()
      .then((data) => {
        const categoryRows = data.products.map((product: { _id: any; name: any; title: string; description: string; price: number }) => ({
          id: product._id,
          name: product.name,
          title: product.title,
          description: product.description,
          price: product.price
        }));
        setRows(categoryRows);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur dans l'extraction des données :", error);
        setRows([]);
        setLoading(false);
      });
  }, []);

  const handleDeleteButtonClick = (params: GridCellParams) => {
    const productId = params.row.id as string;
    setDeleteProductId(productId);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmDeleteOpen(false);
    setLoading(true);

    try {
      await deleteProductData(deleteProductId!);
      setRows((prevRows) =>
        prevRows.filter((row) => row.id !== deleteProductId)
      );
      setLoading(false);
      setAlertSeverity("success");
      setAlertMessage(t("alertMessageDelete.deleteProductSuccess"));
      setAlertOpen(true);
    } catch (error) {
      setLoading(false);
      setAlertSeverity("error");
      setAlertMessage(t("alertError.error"));
      setAlertOpen(true);
    }
  };
  
  const handleModifyButtonClick = (params: GridCellParams) => {
    const productId = params.id as string;
    router.push(`/products/${productId}`);
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("produits-grid.title"),
      width: 100,
      flex: 1,
    },
    !isSmScreen && {
      field: "description",
      headerName: t("produits-grid.description"),
      width: 250,
      flex: 1,
    },
    !isSmScreen && {
      field: "price",
      headerName: t("produits-grid.price"),
      type: "number",
      width: 110,
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "delete",
      width: 50,
      headerName: "",
      renderCell: (params: GridCellParams) => (
        <Button
          onClick={() => handleDeleteButtonClick(params)}
          className={styles.buttonGrid}
        >
          <DeleteIcon style={{ color: "grey" }} />
        </Button>
      ),
      headerAlign: "center",
      align: "center",
      filterable: false,
      sortable: false,
      minWidth: 50,
    },
    {
      field: "modify",
      headerName: "",
      width: 50,
      renderCell: (params: GridCellParams) => (
        <Button
          onClick={() => handleModifyButtonClick(params)}
          className={styles.buttonGrid}
        >
          <EditIcon style={{ color: "#2196F3" }} />
        </Button>
      ),
      headerAlign: "center",
      align: "center",
      filterable: false,
      sortable: false,
      minWidth: 50,
    },
  ].filter(Boolean) as GridColDef[];

  return (
    <Box sx={{ height: "auto", maxHeight: "100%", width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          loading={loading}
          disableColumnMenu
          disableRowSelectionOnClick
        />
      )}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("confirmAction.confirmTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("confirmAction.confirmMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            {t("confirmAction.confirmCancel")}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            {t("confirmAction.confirmDelete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alertSeverity}>
          <AlertTitle>{alertSeverity}</AlertTitle>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductGrid;

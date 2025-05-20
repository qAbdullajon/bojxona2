import {
  Box,
  Checkbox,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  alpha,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useShopProductsStore } from "../hooks/useModalState";
import $api from "../http/api";
import { useParams } from "react-router-dom";
import { notification } from "../components/notification";

// Asosiy rangga asoslangan tema yaratish
const theme = createTheme({
  palette: {
    primary: {
      main: "#249B73",
      light: alpha("#249B73", 0.8),
      dark: "#1B7355",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f5f5f5",
      contrastText: "#249B73",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          padding: "8px 16px",
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(36, 155, 115, 0.25)",
          },
        },
        outlined: {
          borderColor: "#249B73",
          color: "#249B73",
          "&:hover": {
            borderColor: "#1B7355",
            backgroundColor: "rgba(36, 155, 115, 0.04)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: alpha("#249B73", 0.1),
          color: "#249B73",
          fontWeight: 600,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha("#249B73", 0.6),
          "&.Mui-checked": {
            color: "#249B73",
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        selectIcon: {
          color: "#249B73",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#249B73",
          "&:hover": {
            backgroundColor: alpha("#249B73", 0.1),
          },
        },
      },
    },
  },
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  bgcolor: "background.paper",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  p: 4,
  borderRadius: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const columns = [
  { id: "select", label: "", width: "8%" },
  { id: "name", label: "Mahsulot nomi", width: "30%" },
  { id: "quantity", label: "Ombordagi soni", width: "18%" },
  { id: "price", label: "Narxi", width: "20%" },
  { id: "desiredQuantity", label: "Miqdor", width: "27%" },
];

export default function ShopAddModal() {
  const { open, onClose } = useShopProductsStore();
  const [tableData, setTableData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { id: paramsId } = useParams();

  const handleQuantityChange = (id, newQuantity) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, desiredQuantity: newQuantity } : item
      )
    );
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const selectedItems = tableData
      .filter((item) => selected.includes(item.id))
      .map((item) => ({
        productId: item.id,
        quantity: item.desiredQuantity,
      }));

    if (selectedItems.length === 0) {
      notification("Iltimos, kamida bitta mahsulotni tanlang", "warning");
      return;
    }

    try {
      const res = await $api.patch(`shops/add/${paramsId}`, {
        products: selectedItems,
      });
      if (res.status === 200) {
        notification("Muvofaqiyatli qo'shildi", "success");
        onClose();
      }
    } catch (error) {
      notification(error.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const res = await $api.get(
          "/statuses/products/by/d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783",
          {
            params: {
              page: page + 1,
              limit: rowsPerPage,
            },
          }
        );
        console.log(res.data);
        
        const allData = res.data.data.data;
        const total = res.data.data.pagination?.totalItems || 0;

        setTableData(
          allData
            .filter((item) => item.active_quantity !== 0) // Avval filter
            .map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price.toLocaleString("uz-UZ") + " so'm",
              quantity: item.active_quantity,
              desiredQuantity: 0,
            }))
        );

        setTotalItems(total);
      } catch (error) {
        console.error(error);
      }
    };

    const debounce = setTimeout(() => {
      getAllProducts();
    }, 500);

    return () => clearTimeout(debounce);
  }, [page, rowsPerPage, searchTerm]);

  return (
    <ThemeProvider theme={theme}>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShoppingBag size={28} color="#249B73" />
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 600, color: "#249B73" }}
              >
                Yangi mahsulot qo'shish
              </Typography>
            </div>
            <IconButton
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full"
              size="small"
              sx={{ color: "grey.600" }}
            >
              <X size={24} />
            </IconButton>
          </div>

          <div className="mb-4">
            <TextField
              fullWidth
              placeholder="Mahsulot nomini qidirish..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha("#249B73", 0.8),
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#249B73",
                  },
                },
              }}
            />
          </div>

          <TableContainer
            component={Paper}
            className="!shadow-none"
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.id} width={col.width} sx={{ py: 1.5 }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha("#249B73", 0.04),
                        },
                        ...(selected.includes(row.id) && {
                          backgroundColor: alpha("#249B73", 0.08),
                        }),
                      }}
                    >
                      <TableCell sx={{ py: 1 }}>
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onChange={() => toggleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography
                          fontWeight={selected.includes(row.id) ? 600 : 400}
                        >
                          {row.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography>{row.quantity}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography>{row.price}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {selected.includes(row.id) ? (
                          <div className="flex items-center">
                            <IconButton
                              onClick={() =>
                                handleQuantityChange(
                                  row.id,
                                  Math.max(0, row.desiredQuantity - 1)
                                )
                              }
                              size="small"
                            >
                              <Minus size={18} />
                            </IconButton>
                            <TextField
                              size="small"
                              type="number"
                              value={row.desiredQuantity}
                              onChange={(e) => {
                                const newQty = Number(e.target.value);
                                if (newQty >= 0 && newQty <= row.quantity) {
                                  handleQuantityChange(row.id, newQty);
                                }
                              }}
                              inputProps={{
                                min: 0,
                                max: row.quantity,
                                style: { textAlign: "center", width: 60 },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: alpha("#249B73", 0.5),
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#249B73",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#249B73",
                                  },
                                },
                              }}
                            />
                            <IconButton
                              onClick={() =>
                                handleQuantityChange(
                                  row.id,
                                  Math.min(
                                    row.quantity,
                                    row.desiredQuantity + 1
                                  )
                                )
                              }
                              size="small"
                            >
                              <Plus size={18} />
                            </IconButton>
                          </div>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                          >
                            Tanlang va miqdorni kiriting
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        Mahsulotlar topilmadi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Qatorlar soni:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count !== -1 ? count : `${to} dan ko'p`}`
              }
            />
          </TableContainer>

          <Box className="flex justify-between items-center pt-2">
            <Typography variant="body2" color="text.secondary">
              {selected.length > 0
                ? `${selected.length} ta mahsulot tanlangan`
                : "Mahsulotlarni tanlang"}
            </Typography>
            <div className="flex gap-3">
              <Button variant="outlined" onClick={onClose} color="primary">
                Bekor qilish
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={selected.length === 0}
                color="primary"
              >
                Saqlash
              </Button>
            </div>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

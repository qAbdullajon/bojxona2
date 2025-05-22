import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  Tooltip,
} from "@mui/material";
import { ChevronDown, Filter, EyeOff } from "lucide-react";
import {
  useProductTypeFilterStore,
  useShipperFilterStore,
  useStatusFilterStore,
} from "../hooks/useFilterStore";

export default function GlobalTable({
  columns,
  rows,
  page,
  rowsPerPage,
  total,
  onPageChange,
  totalQuantity,
}) {
  const { setValue, setId } = useStatusFilterStore();
  const { setValue: setShipperValue, setId: setShipperId } =
    useShipperFilterStore();
  const { setValue: setTypeValue, setId: setTypeId } =
    useProductTypeFilterStore();

  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: "asc",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.field]: true }), {})
  );

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleColumnVisibility = (columnField) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnField]: !prev[columnField],
    }));
  };

  const handleSort = (field) => {
    let direction = "asc";
    if (sortConfig.field === field && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ field, direction });
    handleClose();
  };

  const sortedRows = React.useMemo(() => {
    if (!sortConfig.field) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      // Check if values are numbers
      if (!isNaN(aValue) && !isNaN(bValue)) {
        const numA = parseFloat(aValue);
        const numB = parseFloat(bValue);
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }

      // Check if values are dates
      if (Date.parse(aValue) && Date.parse(bValue)) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // For strings
      const stringA = String(aValue).toLowerCase();
      const stringB = String(bValue).toLowerCase();

      if (stringA < stringB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (stringA > stringB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [rows, sortConfig]);

  const filteredColumns = columns.filter((col) => visibleColumns[col.field]);

  const handleRestartColumns = () => {
    const resetState = {};
    columns.forEach((col) => {
      resetState[col.field] = true;
    });
    setSortConfig({
      field: null,
      direction: "asc",
    });
    setVisibleColumns(resetState);
    handleClose();
    setValue("");
    setId(null);
    setShipperValue("");
    setShipperId(null);
    setTypeId(null);
    setTypeValue("");
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", padding: "20px 20px" }}
    >
      <div className="flex justify-between items-center mb-4">
        {totalQuantity && (
          <p className="text-xl font-medium">
            <span>Mahsulotlarning umumiy miqdori:</span> {totalQuantity}
          </p>
        )}
        <div className="flex w-full justify-end">
          <Tooltip title="Ustunlarni tahrirlash">
            <IconButton onClick={handleFilterClick}>
              <Filter size={18} />
            </IconButton>
          </Tooltip>
        </div>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 400,
              width: 300,
            },
          }}
        >
          <MenuItem disabled sx={{ fontWeight: "bold", mt: 1 }}>
            Ustunlarni tahrirlash:
          </MenuItem>

          {columns.map((column) => (
            <MenuItem
              key={`toggle-${column.field}`}
              onClick={() => toggleColumnVisibility(column.field)}
            >
              <Checkbox
                checked={visibleColumns[column.field]}
                size="small"
                sx={{ padding: "4px" }}
              />
              <span style={{ marginLeft: "8px" }}>{column.headerName}</span>
              {!visibleColumns[column.field] && (
                <EyeOff size={14} style={{ marginLeft: "auto" }} />
              )}
            </MenuItem>
          ))}

          <MenuItem
            onClick={handleRestartColumns}
            sx={{
              fontWeight: "bold",
              justifyContent: "center",
              mt: 1,
            }}
          >
            Filter ni tozalash
          </MenuItem>
        </Menu>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            {filteredColumns.map((column) => (
              <TableCell
                sx={{
                  color: "#7783c5",
                  borderColor: "#f5efee",
                  border: "1px solid #f5efee",
                  padding: "5px 8px",
                  width: column?.width,
                }}
                key={column.field}
                onClick={() => column?.vector && handleSort(column.field)}
                className={
                  column?.vector ? "cursor-pointer hover:bg-gray-50" : ""
                }
              >
                <div className="flex items-center justify-between">
                  <span>{column.headerName}</span>
                  {column?.vector && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        sortConfig.field === column.field &&
                        sortConfig.direction === "desc"
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  )}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedRows?.map((row, index) => (
            <TableRow key={index} hover>
              {filteredColumns.map((column) => (
                <TableCell
                  sx={{
                    border: "1px solid #f5efee",
                    padding: "5px 8px",
                  }}
                  key={`${column.field}-${index}`}
                >
                  {row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {total > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            count={Math.ceil(total / rowsPerPage)}
            page={page + 1}
            onChange={(event, newPage) => onPageChange(event, newPage - 1)}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
            sx={{
              button: {
                color: "black",
                "&.Mui-selected": {
                  backgroundColor: "#e2e2e2",
                  color: "black",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "gray",
                },
              },
              ul: {
                justifyContent: "center",
              },
            }}
          />
        </div>
      )}
    </TableContainer>
  );
}

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Pagination,
} from "@mui/material";

export default function GlobalTable({
  columns,
  rows,
  page,
  rowsPerPage,
  total,
  onPageChange,
  totalQuantity,
}) {
  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", padding: "20px 20px" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                sx={{
                  color: "#7783c5",
                  borderColor: "#f5efee",
                  border: "1px solid #f5efee",
                  padding: "5px 8px",
                  width: column?.width,
                }}
                key={column.field}
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  sx={{
                    border: "1px solid #f5efee",
                    padding: "5px 8px",
                  }}
                  key={column.field}
                >
                  {row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div
        className={`flex items-center ${
          totalQuantity ? "justify-between" : "justify-end"
        }`}
      >
        {totalQuantity && (
          <p className="text-xl font-medium">
            <span className="">Mahsulotlarning umumiy miqdori:</span>{" "}
            {totalQuantity}
          </p>
        )}
        {total > 0 && (
          <Pagination
            count={Math.ceil(total / rowsPerPage)}
            page={page + 1} // MUI uses 1-based indexing
            onChange={(event, newPage) => onPageChange(event, newPage - 1)}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
            sx={{
              paddingTop: "15px",
              button: {
                color: "black", // text rangi
                "&.Mui-selected": {
                  backgroundColor: "#e2e2e2",
                  color: "black",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "gray"
                }
              },
              ul: {
                justifyContent: "center",
              },
            }}
          />
        )}
      </div>
    </TableContainer>
  );
}

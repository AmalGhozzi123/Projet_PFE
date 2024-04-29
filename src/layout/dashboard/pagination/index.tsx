import React from 'react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, onPageChange }) => {
  const handleClick = (page: number, event: React.MouseEvent) => {
    event.preventDefault();
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <nav aria-label="Pagination navigation">
      <ul className="pagination">
        <li>
          <a href="#" onClick={(e) => handleClick(currentPage - 1, e)} aria-disabled={currentPage === 1}>
            <span aria-hidden="true">«</span><span className="visuallyhidden">Previous</span>
          </a>
        </li>
        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i}>
            <a
              href="#"
              onClick={(e) => handleClick(i + 1, e)}
              aria-current={currentPage === i + 1 ? "page" : undefined}
            >
              <span className="visuallyhidden">Page </span>{i + 1}
            </a>
          </li>
        ))}
        <li>
          <a href="#" onClick={(e) => handleClick(currentPage + 1, e)} aria-disabled={currentPage >= totalPages}>
            <span className="visuallyhidden">Next</span><span aria-hidden="true">»</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;

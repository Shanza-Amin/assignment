function Pagination({ currentPage, totalPages, pageSize, totalItems, onPrevious, onNext }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination">
      <div className="pagination-meta">
        Showing {startItem}-{endItem} of {totalItems}
      </div>

      <div className="pagination-controls">
        <button type="button" onClick={onPrevious} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button type="button" onClick={onNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

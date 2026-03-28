function Loader({ label = 'Loading' }) {
  return (
    <div className="loader-card" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{label}...</span>
    </div>
  );
}

export default Loader;

import './Loader.css';

interface LoaderProps {
  progress?: { loaded: number; total: number };
  onCancel?: () => void;
}

export function Loader({ progress, onCancel }: LoaderProps = {}) {
  return (
    <div className="loader-container">
      <div className="geometric-loader">
        <div className="geo-box box-1"></div>
        <div className="geo-box box-2"></div>
        <div className="geo-box box-3"></div>
      </div>
      <p className="loader-text">Loading Articles</p>
      {progress && (
        <p className="loader-progress">{progress.loaded} of {progress.total} feeds loaded</p>
      )}
      {onCancel && (
        <button className="loader-cancel" onClick={onCancel}>Cancel</button>
      )}
    </div>
  );
}

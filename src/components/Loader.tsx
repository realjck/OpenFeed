import './Loader.css';

export function Loader() {
  return (
    <div className="loader-container">
      <div className="geometric-loader">
        <div className="geo-box box-1"></div>
        <div className="geo-box box-2"></div>
        <div className="geo-box box-3"></div>
      </div>
      <p className="loader-text">Loading Articles</p>
    </div>
  );
}

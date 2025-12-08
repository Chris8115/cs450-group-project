import "./App.css";
import useSpotifyData from "./hooks/useSpotifyData";
import Dashboard from "./components/Dashboard";

function App() {
  const { data, loading } = useSpotifyData();

  console.log("APP DATA:", data);  // DEBUG

  if (loading) {
    return <p>Loading Spotify dataset...</p>;
  }

  if (!data || data.length === 0) {
    return <p>ERROR: No data loaded</p>;
  }

  return (
    <div className="App">
      <div id="tooltip-root"></div>
      <Dashboard data={data} />
    </div>
  );
}

export default App;

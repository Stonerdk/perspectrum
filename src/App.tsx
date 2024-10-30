import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StoryViewer from './storyViewer';
import StoryEditor from './storyEditor';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* StoryViewer Route */}
          <Route
            path="/"
            element={
              <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
                <StoryViewer />
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  <Link to="/edit">
                    <button style={styles.button}>Edit</button>
                  </Link>
                </div>
              </div>
            }
          />

          {/* GraphEditor Route */}
          <Route
            path="/edit"
            element={<StoryEditor/>}
          />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    transition: 'background-color 0.3s',
  },
};

export default App;
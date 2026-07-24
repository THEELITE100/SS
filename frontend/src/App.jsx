import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { bootstrapAuth } from './features/auth/authSlice';
import { useRealtimeConnection } from './features/realtime/useRealtimeConnection';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useRealtimeConnection();

  return <AppRoutes />;
}

export default App;

// src/context/AuthContext.jsx

import React, {
  createContext, useContext,
  useState, useEffect
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [farmer, setFarmer] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on app start
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('jalmitra_token');
      const savedFarmer = await AsyncStorage.getItem('jalmitra_farmer');
      const savedFarmId = await AsyncStorage.getItem('jalmitra_farm_id');

      if (savedToken && savedFarmer) {
        setToken(savedToken);
        setFarmer(JSON.parse(savedFarmer));
        setFarmId(savedFarmId);
      }
    } catch (error) {
      console.log('Session load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (farmerData, farms, authToken) => {
    try {
      // Save to AsyncStorage (persistent)
      await AsyncStorage.setItem('jalmitra_token', authToken);
      await AsyncStorage.setItem(
        'jalmitra_farmer', JSON.stringify(farmerData)
      );

      // Use first farm by default
      const primaryFarm = farms?.[0]?.id ?? 'farm001';
      await AsyncStorage.setItem('jalmitra_farm_id', primaryFarm);

      setToken(authToken);
      setFarmer(farmerData);
      setFarmId(primaryFarm);
    } catch (error) {
      console.log('Login save error:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      'jalmitra_token',
      'jalmitra_farmer',
      'jalmitra_farm_id',
    ]);
    setToken(null);
    setFarmer(null);
    setFarmId(null);
  };

  return (
    <AuthContext.Provider value={{
      farmer, farmId, token, loading,
      login, logout,
      isLoggedIn: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};
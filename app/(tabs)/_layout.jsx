import { Tabs, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { getLocalStorage } from '../../service/Storage';

const TabLayout = () => {
  const router = useRouter();

  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = async () => {
    const userInfo = await getLocalStorage('userDetail');
    if (!userInfo) {
      router.replace('/Login');
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00c26f',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SearchScreen"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SettingScreen"
        options={{
          tabBarLabel: 'Setting',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;

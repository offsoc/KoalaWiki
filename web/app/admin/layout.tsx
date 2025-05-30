'use client'

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import styles from './styles.module.css';
import Script from 'next/script';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('管理员');
  const [userRole, setUserRole] = useState('user');
  const pathname = usePathname();
  const router = useRouter();

  // 在客户端挂载时添加Tailwind CDN
  useEffect(() => {
    // 检查是否已经存在Tailwind CDN链接
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.tailwindcss.com';
      document.head.appendChild(link);
    }
  }, []);

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/repositories')) return 'repositories';
    if (pathname.startsWith('/admin/finetune')) return 'finetune';
    if (pathname.startsWith('/admin/settings')) return 'settings';
    return '';
  };

  // 检查用户是否已登录
  useEffect(() => {
    // 模拟检查登录状态
    const checkLoginStatus = () => {
      const userToken = localStorage.getItem('userToken');
      if (!userToken) {
        // 保存当前路径，以便登录后返回
        localStorage.setItem('redirectPath', pathname);
        router.push('/login');
      } else {
        setIsLoggedIn(true);
        // 获取存储的用户名
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName);
        }
        
        // 获取用户信息和角色
        const userInfoStr = localStorage.getItem('userInfo');
        console.log('从localStorage获取的userInfo:', userInfoStr);
        
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            console.log('解析后的userInfo:', userInfo);
            
            if (userInfo.role) {
              setUserRole(userInfo.role);
              console.log('设置用户角色为:', userInfo.role);
            } else {
              console.log('userInfo中没有role字段，使用默认角色user');
              setUserRole('user');
            }
          } catch (error) {
            console.error('解析用户信息失败:', error);
            // 如果解析失败，默认为普通用户
            setUserRole('user');
          }
        } else {
          console.log('localStorage中没有userInfo，使用默认角色user');
          setUserRole('user');
        }
      }
      setIsLoading(false);
    };
    
    checkLoginStatus();
  }, [router, pathname]);

  // 处理登出
  const handleLogout = () => {
    console.log('用户退出登录');
    // 清除所有用户登录信息
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('redirectPath'); // 也清除重定向路径
    
    // 重置状态
    setIsLoggedIn(false);
    setUserName('管理员');
    setUserRole('user');
    
    // 重定向到登录页面
    router.push('/login');
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 如果正在加载，显示空内容
  if (isLoading) {
    return null;
  }

  // 如果未登录，将由useEffect重定向到登录页面
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <Script id="tailwind-cdn" strategy="afterInteractive">
        {`
          if (!document.querySelector('link#tailwind-cdn')) {
            const link = document.createElement('link');
            link.id = 'tailwind-cdn';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.tailwindcss.com';
            document.head.appendChild(link);
          }
        `}
      </Script>
      <div className={styles.adminLayout}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          selectedKey={getSelectedKey()} 
          userRole={userRole}
        />
        
        <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentSidebarClosed : ''}`}>
          <Header 
            toggleSidebar={toggleSidebar} 
            userName={userName} 
            onLogout={handleLogout} 
          />
          
          <main className={styles.contentContainer}>
            <div className={styles.contentWrapper}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 
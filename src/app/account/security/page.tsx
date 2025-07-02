"use client";

import React, { useState } from 'react';
import styles from '../../../styles/SecurityPage.module.css';

export default function SecurityPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bảo mật và Mật khẩu</h1>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Đặt lại Mật khẩu</h2>
        
      </div>
      
    </div>
  );
}
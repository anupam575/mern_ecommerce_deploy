import React, { useState, useEffect } from 'react';
import developerImg from '../images/developer.jpg';

function About() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const styles = {
    aboutPage: {
      minHeight: '100vh',
      background: 'linear-gradient(to right, #fdfbfb, #ebedee)',
      padding: '60px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    
    },
    container: {
      maxWidth: '1100px',
      width: '100%',
      background: '#ffffff',
      padding: isMobile ? '30px' : '50px',
      borderRadius: '20px',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '30px',
      alignItems: 'center',
      textAlign: isMobile ? 'center' : 'left',
    },
    profileImg: {
      width: isMobile ? '100%' : '280px',
      maxWidth: '300px',
      height: 'auto',
      borderRadius: '18px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
      objectFit: 'cover',
      marginTop: isMobile ? '40px': '0',
    },
    text: {
      flex: 1,
      minWidth: '280px',
    },
    heading1: {
      fontSize: isMobile ? '32px' : '40px',
      marginBottom: '20px',
      color: '#2c3e50',
    },
    heading2: {
      color: '#34495e',
      fontSize: isMobile ? '20px' : '24px',
      marginBottom: '15px',
    },
    paragraph: {
      fontSize: '16.5px',
      color: '#555',
      lineHeight: '1.8',
      marginBottom: '15px',
    }
  };

  return (
    <div style={styles.aboutPage}>
      <div style={styles.container}>
        <img
          src={developerImg}
          alt="MERN Developer"
          style={styles.profileImg}
        />
        <div style={styles.text}>
          <h1 style={styles.heading1}>About Us</h1>
          <h2 style={styles.heading2}>Hi, I'm a MERN Stack Developer</h2>
          <p style={styles.paragraph}>
            Welcome to our eCommerce platform! I specialize in building fast, secure, and scalable applications using the MERN stack — MongoDB, Express.js, React, and Node.js.
          </p>
          <p style={styles.paragraph}>
            This project focuses on delivering smooth, modern shopping experiences with smart backend logic and clean user interfaces.
            My goal is to turn great ideas into fully functional and beautiful products that people love to use.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;

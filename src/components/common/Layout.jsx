// @ts-nocheck
import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import DemoBanner from './DemoBanner'

const Layout = ({children}) => {
  return (
      <>
          <DemoBanner />
          <Navbar />
          {children}
          <Footer />
      </>
  )
}

export default Layout
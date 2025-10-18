import React from 'react'
import Navbar from '../components/Navbar'

const Contact = () => {
  return (
    <div>
        <Navbar />
        <div className="flex items-center justify-between mb-8 border-b py-6">
            <p className="text-2xl md:text-3xl text-gray-500 px-10 hover:text-orange-600">
              About <span className="font-medium text-orange-600 hover:text-gray-500">Us</span>
            </p>
        </div>
        <p>This is the contact page of our application.</p>
        <p>Here you can find our contact information and a form to reach out to us.</p>
    </div>
  )
}

export default Contact
